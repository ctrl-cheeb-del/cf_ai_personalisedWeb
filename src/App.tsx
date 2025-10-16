import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import ReactDOMServer from "react-dom/server";
import { PizzaPage } from "./pizza/PizzaPage.tsx";
import { sha256Hex } from "./utils/hash.ts";

// This is ugly but it's necessary to support both local and prod environments
let apiBaseUrl: string = window.location.protocol + '//' + window.location.host;
try {
  // Bun will only inline this if we use exactly `process.env.PUBLIC_BACKEND_URL` it we use other forms including process?.env for example bun will not inline it
  // we can't check typeof process either because process may not be available but Bun may already have inlined process.env.PUBLIC_BACKEND_URL with the correct value
  apiBaseUrl = process.env.PUBLIC_BACKEND_URL ?? apiBaseUrl;
} catch {
  // Bun may not have had anything to inline and process.env may not exist to above can throw an error
  // do nothing
}

function backendUrl(path: string) {
  if(path.startsWith('/')) {
    return `${apiBaseUrl.replace(/\/$/, '')}${path}`;
  }
  const currentPathWithoutQuery = window.location.pathname.split('?')[0];
  const pathDirs = currentPathWithoutQuery.split('/');
  pathDirs.pop();  // we never want the 'filename'
  while(path.startsWith('..')) {
    pathDirs.shift();
    pathDirs.shift();
  }
  const newPath = pathDirs.join('/');
  return `${apiBaseUrl}${newPath}${path}`;
}

function fetchBackend(path: string, init?: Parameters<typeof fetch>[1]) {
  return fetch(backendUrl(path), { ...init, credentials: 'include' });
}

const BASE_PIZZA_HTML = ReactDOMServer.renderToStaticMarkup(<PizzaPage />);

function AnimatedDots() {
  return (
    <span className="animated-dots">
      <span className="dot">.</span>
      <span className="dot">.</span>
      <span className="dot">.</span>
    </span>
  );
}

function App() {
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canvasHtml, setCanvasHtml] = useState<string>(BASE_PIZZA_HTML);
  const [loading, setLoading] = useState(true);
  const [rebuilding, setRebuilding] = useState(false);
  const didInitRef = useRef(false);
  const rebuildInFlightRef = useRef(false);

  // on mount load the cached personalised html if present
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const loadCached = async () => {
      try {
        // send hash of base html so server can check if rebuild needed
        const baseHash = await sha256Hex(BASE_PIZZA_HTML);
        const params = new URLSearchParams({ baseHash });
        const res = await fetchBackend(`/p/catalog?${params}`);

        if (res.status === 202) {
          // switch ui to rebuilding view
          setRebuilding(true);
          setLoading(false);

          if (rebuildInFlightRef.current) return;
          rebuildInFlightRef.current = true;

          const doRebuild = async () => {
            const rebuildRes = await fetchBackend(`/api/rebuild`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ page: "catalog", baseHtml: BASE_PIZZA_HTML }),
            });
            if (rebuildRes.status === 429) {
              // if busy back off and retry 
              await new Promise((r) => setTimeout(r, 1200));
              return doRebuild();
            }
            const rebuild = await rebuildRes.json() as { ok?: boolean; html?: string; skipped?: boolean };
            if (rebuild.ok && rebuild.html) {
              setCanvasHtml(rebuild.html);
            } else {
              setCanvasHtml(BASE_PIZZA_HTML);
            }
            setRebuilding(false);
            rebuildInFlightRef.current = false;
          };

          await doRebuild();
          return;
        } else if (res.ok) {
          const html = await res.text();
          setCanvasHtml(html);
        }
      } catch (err) {
        console.error("Failed to load cached HTML:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCached();
  }, []);

  // send the current page html and users request for a personalised edit
  const submitPrompt = useCallback(async () => {
    setSubmitting(true);
    try {
      const baseHtml = canvasHtml;
      const out = (await fetchBackend(`/api/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "catalog", prompt, baseHtml }),
      }).then((r) => r.json())) as { ok?: boolean; pageUrl?: string; html?: string };
      if (out && out.ok) {
        if (typeof out.html === "string" && out.html.trim().length > 0) {
          // replace the main rendered page with response
          setCanvasHtml(out.html);
        }
      }
    } finally {
      setSubmitting(false);
    }
  }, [canvasHtml, prompt]);

  const resetCache = useCallback(async () => {
    setSubmitting(true);
    try {
      await fetchBackend("/api/clear-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "catalog" }),
      });
      setCanvasHtml(BASE_PIZZA_HTML);
      setPrompt("");
    } catch (err) {
      console.error("Failed to clear cache:", err);
      alert("Failed to clear cache");
    } finally {
      setSubmitting(false);
    }
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
        Loading...
      </div>
    );
  }

  if (rebuilding) {
    return (
      <div style={{ minHeight: "100vh", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#eee" }}>Rebuilding your personalized site...</div>
        <div style={{ fontSize: 14, opacity: 0.7 }}>The base site has been updated. Reapplying your customizations.</div>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
      <iframe
        title="site-canvas"
        style={{ width: "100%", height: "100%", border: 0, display: "block" }}
        srcDoc={canvasHtml}
      />

      {/* edit prompt input and buttons */}
      <div style={{ position: "fixed", right: 16, bottom: 16, width: 380, maxWidth: "calc(100% - 32px)", background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.4)", overflow: "hidden", zIndex: 1000 }}>
        <div style={{ padding: 12, borderBottom: "1px solid #222", fontWeight: 600 }}>Personalize</div>
        <div style={{ padding: 12 }}>
          <textarea
            placeholder="e.g., Make text bigger, move Calzone to last, high contrast"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            style={{ width: "95%", background: "#141414", color: "#eee", border: "1px solid #2a2a2a", borderRadius: 8, padding: 8 }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button disabled={submitting || !prompt.trim()} onClick={submitPrompt}>
              {submitting ? <AnimatedDots /> : "Apply"}
            </button>
            <button onClick={resetCache} disabled={submitting}>Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
