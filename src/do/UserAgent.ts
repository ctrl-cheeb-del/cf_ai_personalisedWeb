import { DurableObject } from "cloudflare:workers";
import type { CloudflareEnv } from "../env.ts";

type ApplyBody = {
  uid: string;
  page: string;
  baseHtml: string;
  baseHash: string;
  prompt: string;
};

type RebuildBody = {
  uid: string;
  page: string;
  baseHtml: string;
  baseHash: string;
};

export class UserAgent extends DurableObject<CloudflareEnv> {
  private isBusy: boolean = false;

  constructor(state: DurableObjectState, env: CloudflareEnv) {
    super(state, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/apply") {
      const body = (await request.json()) as ApplyBody;
      return this.apply(body);
    }
    if (request.method === "POST" && url.pathname === "/rebuild") {
      const body = (await request.json()) as RebuildBody;
      return this.rebuild(body);
    }
    if (request.method === "POST" && url.pathname === "/clear") {
      const body = (await request.json()) as { page?: string };
      return this.clear(body);
    }
    return new Response("Not found", { status: 404 });
  }

  private async apply(body: ApplyBody): Promise<Response> {
    if (this.isBusy) return new Response(JSON.stringify({ busy: true }), { status: 429 });
    this.isBusy = true;
    try {
      const historyKey = this.historyKey(body.uid);
      const history = (await this.ctx.storage.get<string[]>(historyKey)) ?? [];
      history.push(body.prompt);

      const editedHtml = await this.generateHtml(body.baseHtml, body.page, history);
      const kvKey = this.htmlKey(body.uid, body.page, body.baseHash);
      const latestKey = this.latestHtmlKey(body.uid, body.page);
      const latestBaseKey = this.latestBaseHashKey(body.uid, body.page);
      await this.env.KV.put(kvKey, editedHtml);
      await this.env.KV.put(latestKey, editedHtml);
      await this.env.KV.put(latestBaseKey, body.baseHash);
      await this.ctx.storage.put(historyKey, history);

      return new Response(
        JSON.stringify({ ok: true, html: editedHtml }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (err) {
      console.error("apply error:", err);
      return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
    } finally {
      this.isBusy = false;
    }
  }

  private async rebuild(body: RebuildBody): Promise<Response> {
    if (this.isBusy) return new Response(JSON.stringify({ busy: true }), { status: 429 });
    this.isBusy = true;
    try {
      const historyKey = this.historyKey(body.uid);
      const history = (await this.ctx.storage.get<string[]>(historyKey)) ?? [];
      if (history.length === 0) {
        return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });
      }
      const editedHtml = await this.generateHtml(body.baseHtml, body.page, history);
      const kvKey = this.htmlKey(body.uid, body.page, body.baseHash);
      const latestKey = this.latestHtmlKey(body.uid, body.page);
      const latestBaseKey = this.latestBaseHashKey(body.uid, body.page);
      await this.env.KV.put(kvKey, editedHtml);
      await this.env.KV.put(latestKey, editedHtml);
      await this.env.KV.put(latestBaseKey, body.baseHash);
      return new Response(
        JSON.stringify({ ok: true, html: editedHtml }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
    } finally {
      this.isBusy = false;
    }
  }

  private historyKey(uid: string): string {
    return `user:${uid}:history`;
  }

  private htmlKey(uid: string, page: string, baseHash: string): string {
    return `user:${uid}:page:${page}:base:${baseHash}:html`;
  }

  private latestHtmlKey(uid: string, page: string): string {
    return `user:${uid}:page:${page}:latest:html`;
  }

  private latestBaseHashKey(uid: string, page: string): string {
    return `user:${uid}:page:${page}:latest:basehash`;
  }

  private async generateHtml(baseHtml: string, page: string, promptHistory: string[]): Promise<string> {
    const latestPrompt = promptHistory[promptHistory.length - 1] ?? "";

    const systemPrompt = [
      "You are a senior web designer. You will receive the full HTML of a page.",
      "Return a complete, valid HTML document.",
      "Preserve existing <script> tags, asset links, and data attributes.",
      "Only make the requested visual/content changes. Do not fetch remote resources.",
      "Do not break the page's JS initialization. Keep #root and main scripts intact if present.",
      "Do not return any text other than the HTML. No description, no explanation, no nothing.",
    ].join(" ");

    const body = {
      model: "claude-haiku-4-5",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: "user", content: `<!--PAGE: ${page}-->` },
        { role: "user", content: baseHtml },
        { role: "user", content: `User request: ${latestPrompt}` },
        ...(promptHistory.length > 1
          ? [{ role: "user", content: `Previous requests: ${promptHistory.slice(0, -1).join(" | ")}` }]
          : []),
      ],
    } as const;

    const res = await fetch(`${this.env.AI_GATEWAY_URL}/v1/messages`, {
      method: "POST",
      headers: {
        "cf-aig-authorization": this.env.CF_AIG_AUTHORIZATION,
        Authorization: `Bearer ${this.env.ANTHROPIC_API_KEY}`,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    console.log("ai gateway response:", res.status);
    
    if (!res.ok) {
      const text = await res.text();
      console.error("ai gateway error:", text);
      throw new Error(`Claude error ${res.status}: ${text}`);
    }
    const data = (await res.json()) as { content?: Array<{ text?: string }> };
    let editedHtml = data?.content?.[0]?.text;
    if (typeof editedHtml !== "string" || editedHtml.trim().length === 0) {
      console.warn("no valid html returned from ai, using fallback");
      // fallback to base html
      return baseHtml;
    }
    // clean markdown code fences if present
    editedHtml = this.cleanHtml(editedHtml);
    return editedHtml;
  }

  private cleanHtml(html: string): string {
    let cleaned = html.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[\w-]*\n?/, '');
      cleaned = cleaned.replace(/\n?```$/, '');
    }
    return cleaned.trim();
  }

  private async clear(body: { page?: string }): Promise<Response> {
    console.log("clear called for page:", body.page ?? "all");
    
    // for proof of concept just clear all storage for this do
    await this.ctx.storage.deleteAll();
    
    return new Response(JSON.stringify({ ok: true, message: "DO storage cleared" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}


