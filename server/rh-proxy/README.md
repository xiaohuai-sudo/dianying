# 镜间 · 生成代理（rh-proxy）

静态站没有后端，**API Key 绝不能进前端**。这一层就是那层薄代理：只做三件事——
发任务、查任务、扣积分；Key 只活在环境变量里。

## 现在能做什么

| 路由 | 作用 |
|---|---|
| `POST /v1/session` | 建会话；新用户赠送 300 积分（幂等） |
| `POST /v1/signin` | 每日签到 +20（同一天只加一次） |
| `GET /v1/balance` | 余额（`total` / `held` 正在跑的任务占用量） |
| `GET /v1/ledger` | 流水（只追加，余额由流水汇总） |
| `POST /v1/generate` | `{kind:"rehearsal"}` → 预扣 180 → 提交任务 → 返回 `taskId` |
| `GET /v1/task/:id` | 轮询；跑完按**实际 GPU 秒**结算并退还差额 |
| `POST /v1/task/:id/cancel` | 取消，全额退还 |
| `GET /v1/health` | 当前 provider 与各档位预扣额 |

鉴权暂时是最简单的 `X-User-Id` 头（6–64 位），**上线前必须换成真正的登录态**。

## 本地跑

```bash
# 假 provider（不联网、不花积分），账本落在 .data/credits.json
npm run proxy:dev
curl -s -X POST -H "X-User-Id: jingjian-demo01" http://127.0.0.1:8787/v1/session

# 真调 RunningHub —— 会真的扣 RH币，先看余额
RH_API_KEY=xxx RH_PROVIDER=runninghub npm run proxy:dev
```

断言：`npm run proxy:test`（覆盖预扣 / 结算 / 差额退还 / 失败退还 / 排队超时退还 /
主动取消 / 幂等不重复扣 / 余额不足 402 / 越权 403 / 成片档未启用 501）。

## 部署到 Cloudflare Workers

```bash
cd server/rh-proxy
npx wrangler kv namespace create CREDITS     # 把返回的 id 填进 wrangler.toml
npx wrangler secret put RH_API_KEY           # 真跑时才需要；不要写进任何文件
npx wrangler deploy
```

`RH_PROVIDER` 先留 `mock` 部署一次——线上链路（CORS、KV、预扣）通不通可以先验证，
一个积分都不会花。确认无误再改成 `runninghub`。

## 积分口径

- **1 积分 = 1 秒 Standard(24G) GPU**；Plus(48G) 每秒 2 积分（`CREDITS_PER_PLUS_SECOND`）。
- 试镜档**实测 20 积分一条**（81 帧、1 分 39 秒 GPU 时间，2026-09-23，见
  `docs/video-generation-options.md` 第九节）；预扣取 **40**（实测两倍），结算按**从 RUNNING 到
  SUCCESS 的实际秒数**，差额自动退还。
  排队时间不计费。
- 失败 / 取消 / 排队超时（默认 900 秒）→ 全额退还。
- 幂等键是 provider 的 `taskId`：重复查询不会重复扣。
- **不接任何支付**：积分只来自赠送、签到（将来要卖，是加一条充值入口，不动上面的账本）。

## 还没做的（下一步）

1. ~~用一条真实运行钉死试镜档的实际秒数~~ 已完成：实测 20 积分/条，`REHEARSAL_PRE_DEDUCT` 已设为 40。
2. 真正的登录态（现在只有 `X-User-Id`）。
3. 站内的「生成」按钮：前端只跟这个代理说话，永远不接触 RunningHub。
