// Cloudflare Workers 入口（模块语法）。
//
// 绑定（wrangler.toml）：
//   KV:  CREDITS  -> 积分账本
//   变量: RH_PROVIDER / RH_API_KEY(secret) / ALLOWED_ORIGINS / 各档位预扣
import { createHandler } from "./src/handler.mjs";
import { KvStore } from "./src/store.mjs";
import { loadConfig } from "./src/config.mjs";
import { createRunningHubProvider } from "./src/providers/runninghub.mjs";
import { createMockProvider } from "./src/providers/mock.mjs";

let cached = null;

function build(env) {
  if (cached && cached.env === env) return cached;
  const config = loadConfig(env);
  const store = new KvStore(env.CREDITS);
  const provider =
    config.providerName === "runninghub" ? createRunningHubProvider({ apiKey: config.apiKey, apiBase: config.apiBase }) : createMockProvider({});
  const handler = createHandler({ config, store, provider, log: (...args) => console.log("[rh-proxy]", ...args) });
  cached = { env, handler };
  return cached;
}

const worker = {
  async fetch(request, env, ctx) {
    const { handler } = build(env);
    return handler.handle(request, ctx);
  },
};

export default worker;
