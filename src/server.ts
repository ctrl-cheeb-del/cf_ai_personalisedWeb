import { Hono } from "hono";
import { cors } from "hono/cors";
import type { CloudflareEnv } from "./env.ts";
import { UserAgent } from "./do/UserAgent.ts";
import { sha256Hex } from "./utils/hash.ts";

export const api = new Hono<{ Bindings: CloudflareEnv }>();

api.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://localhost:1337"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposeHeaders: ["Set-Cookie"],
    credentials: true,
  }),
);

api.get("/api/test/env", (c) =>
  c.json({ ALCHEMY_TEST_VALUE: c.env.ALCHEMY_TEST_VALUE }),
);

api.get("/api/test/kv/:key", async (c) => {
  const key = c.req.param("key");
  const value = await c.env.KV.get(key);
  if (!value) {
    return c.json({ error: "Not found" }, 404);
  }
  return c.text(value);
});

api.put("/api/test/kv/:key", async (c) => {
  const key = c.req.param("key");
  const value = await c.req.text();
  await c.env.KV.put(key, value);
  return c.json({ success: true }, 201);
});

api.delete("/api/test/kv/:key", async (c) => {
  const key = c.req.param("key");
  await c.env.KV.delete(key);
  return c.newResponse(null, 204);
});

// clear the personalised cache for the current user
api.post("/api/clear-cache", async (c) => {
  const { uid } = getOrSetUid(c);
  const page = (await c.req.json()).page ?? "catalog";
  
  // delete all cached html for this user + page
  const latestKey = `user:${uid}:page:${page}:latest:html`;
  await c.env.KV.delete(latestKey);
  
  // also clear prompt history in do
  const id = c.env.USER_STATE.idFromName(uid);
  const stub = c.env.USER_STATE.get(id);
  await stub.fetch("https://do/clear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ page }),
  });
  
  return c.json({ ok: true, message: "Cache and history cleared" });
});

export default api;

// Export Durable Object class so the worker bundle contains it
export { UserAgent };

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const [k, v] = part.split("=");
    if (!k) continue;
    out[k.trim()] = (v ?? "").trim();
  }
  return out;
}

function createUidCookie(uid: string): string {
  const attrs = [
    `uid=${uid}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=31536000",
  ];
  return attrs.join("; ");
}

function getOrSetUid(c: import("hono").Context): { uid: string; setCookie: string | null } {
  const cookies = parseCookies(c.req.header("Cookie"));
  const existing = cookies["uid"];
  if (existing && existing.length > 0) return { uid: existing, setCookie: null };
  const uid = crypto.randomUUID();
  const cookie = createUidCookie(uid);
  return { uid, setCookie: cookie };
}

api.get("/p/:page", async (c) => {
  const { uid, setCookie } = getOrSetUid(c);
  const page = c.req.param("page");

  console.log("get /p/:page for uid:", uid, "page:", page);

  // prefer latest personalised html
  const latestKey = `user:${uid}:page:${page}:latest:html`;
  const personalized = await c.env.KV.get(latestKey);
  const latestBaseKey = `user:${uid}:page:${page}:latest:basehash`;
  const cachedBaseHash = await c.env.KV.get(latestBaseKey);

  const url = new URL(c.req.url);
  const clientBaseHash = url.searchParams.get("baseHash");

  if (personalized) {
    // if we have both client hash and cached hash, compare
    if (clientBaseHash && cachedBaseHash && clientBaseHash !== cachedBaseHash) {
      console.log("base page changed (202)");
      const headers: Record<string, string> = { "Content-Type": "text/plain" };
      if (setCookie) headers["Set-Cookie"] = setCookie;
      return c.newResponse("Rebuild required", 202, headers);
    }
    console.log("returning personalised html");
    const headers: Record<string, string> = { "Content-Type": "text/html; charset=utf-8" };
    if (setCookie) headers["Set-Cookie"] = setCookie;
    return c.newResponse(personalized, 200, headers);
  }

  console.log("no cached page, returning 404 so client uses base");
  return c.newResponse("Not cached", 404);
});

api.post("/api/prompt", async (c) => {
  const { uid, setCookie } = getOrSetUid(c);
  const { page, prompt, baseHtml } = (await c.req.json()) as {
    page: string;
    prompt: string;
    baseHtml: string;
  };

  console.log("prompt received for uid:", uid, "page:", page);
  const baseHash = await sha256Hex(baseHtml);

  // route to do
  const id = c.env.USER_STATE.idFromName(uid);
  const stub = c.env.USER_STATE.get(id);
  const res = await stub.fetch("https://do/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, page, baseHtml, baseHash, prompt }),
  });
  console.log("do response:", res.status);
  const data = (await res.json()) as { ok?: boolean; html?: string; error?: string };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (setCookie) headers["Set-Cookie"] = setCookie;
  return c.newResponse(JSON.stringify({ ok: Boolean(data?.ok), html: data?.html, pageUrl: `/p/${page}`, error: data?.error }), 200, headers);
});

api.post("/api/rebuild", async (c) => {
  const { uid, setCookie } = getOrSetUid(c);
  const { page, baseHtml } = (await c.req.json()) as { page: string; baseHtml: string };
  const baseHash = await sha256Hex(baseHtml);
  const id = c.env.USER_STATE.idFromName(uid);
  const stub = c.env.USER_STATE.get(id);
  const res = await stub.fetch("https://do/rebuild", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, page, baseHtml, baseHash }),
  });
  const data = (await res.json()) as { ok?: boolean; html?: string; skipped?: boolean; error?: string };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (setCookie) headers["Set-Cookie"] = setCookie;
  return c.newResponse(JSON.stringify(data), 200, headers);
});

