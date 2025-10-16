/// <reference types="node" />

import alchemy from "alchemy";
import { BunSPA, KVNamespace } from "alchemy/cloudflare";
import { DurableObjectNamespace } from "alchemy/cloudflare";

const app = await alchemy("cloudflare-bun-spa");

export const kv = await KVNamespace("kv", {
  title: `${app.name}-${app.stage}-kv`,
  adopt: true,
});

export const userState = await DurableObjectNamespace("user-state", {
  className: "UserAgent",
  sqlite: true,
});

export const bunsite = await BunSPA("website", {
  entrypoint: "src/server.ts",
  frontend: ["index.html"],
  noBundle: false,
  adopt: true,
  bindings: {
    KV: kv,
    USER_STATE: userState,
    AI_GATEWAY_URL: process.env.AI_GATEWAY_URL ?? "",
    CF_AIG_AUTHORIZATION: process.env.CF_AIG_AUTHORIZATION ?? "",
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
    ALCHEMY_TEST_VALUE: alchemy.secret("Hello from Alchemy!"),
  },
});

console.log({
  url: bunsite.url,
  apiUrl: bunsite.apiUrl,
});

if (process.env.ALCHEMY_E2E) {
  const { test } = await import("./test/e2e.js");
  await test({
    url: bunsite.url!,
    apiUrl: bunsite.apiUrl,
    env: { ALCHEMY_TEST_VALUE: "Hello from Alchemy!" },
  });
}

await app.finalize();
