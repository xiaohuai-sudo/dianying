// 本地跑法：node dev-server.mjs
//
// 默认用假 provider（不联网、不花积分），账本落在 .data/credits.json。
// 想接真 RunningHub：RH_API_KEY=xxx RH_PROVIDER=runninghub node dev-server.mjs
// —— 那样会真的花 RH币，先确认余额再开。
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "./src/config.mjs";
import { FileStore, MemoryStore } from "./src/store.mjs";
import { createHandler } from "./src/handler.mjs";
import { createMockProvider } from "./src/providers/mock.mjs";
import { createRunningHubProvider } from "./src/providers/runninghub.mjs";

const PORT = Number(process.env.PORT || 8787);
const config = loadConfig(process.env);

const store = config.dataFile
  ? new FileStore(config.dataFile, fs)
  : new FileStore(path.join(process.cwd(), ".data", "credits.json"), fs);

const provider =
  config.providerName === "runninghub"
    ? createRunningHubProvider({ apiKey: config.apiKey, apiBase: config.apiBase })
    : createMockProvider({ runSeconds: Number(process.env.MOCK_RUN_SECONDS || 40), failMode: process.env.MOCK_FAIL_MODE || null });

const { handle } = createHandler({
  config,
  store: store instanceof FileStore ? store : new MemoryStore(),
  provider,
  log: (...args) => console.log("[rh-proxy]", ...args),
});

const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);
  const request = new Request(`http://127.0.0.1:${PORT}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : body,
  });
  const response = await handle(request);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`rh-proxy 本地服务已启动  http://127.0.0.1:${PORT}`);
  console.log(`  provider : ${provider.name}${provider.name === "mock" ? `（假 provider，runSeconds=${provider.runSeconds}）` : ""}`);
  console.log(`  试镜档   : 预扣 ${config.tiers.rehearsal.preDeduct} 积分 · webappId ${config.tiers.rehearsal.webappId}`);
  console.log(`  成片档   : ${config.tiers.final.enabled ? "已启用 " + config.tiers.final.modelPath : "未启用（缺 FINAL_MODEL_PATH / 企业共享 Key）"}`);
  console.log(`  账本文件 : ${config.dataFile || path.join(process.cwd(), ".data", "credits.json")}`);
});
