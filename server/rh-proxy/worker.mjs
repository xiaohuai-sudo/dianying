// Cloudflare Workers 入口（模块语法）。
//
// 绑定（wrangler.toml）：
//   KV:  CREDITS  -> 积分账本
//   变量: RH_PROVIDER / RH_API_KEY(secret) / ALLOWED_ORIGINS / 各档位预扣
import { createHandler } from "./src/handler.mjs";
import { KvStore, MemoryStore } from "./src/store.mjs";
import { loadConfig } from "./src/config.mjs";
import { createRunningHubProvider } from "./src/providers/runninghub.mjs";
import { createMockProvider } from "./src/providers/mock.mjs";

let cached = null;

// 临时预览部署（wrangler deploy --temporary）没有 KV 绑定；那种情况下退化成进程内账本，
// 只够验证链路上通不通，真实账本必须挂 KV。
const ephemeral = new MemoryStore();

function build(env) {
  if (cached && cached.env === env) return cached;
  const config = loadConfig(env);
  const store = env.CREDITS ? new KvStore(env.CREDITS) : ephemeral;
  if (!env.CREDITS) console.warn("[rh-proxy] 没有 CREDITS KV 绑定，正在用进程内账本（仅预览用）");
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
