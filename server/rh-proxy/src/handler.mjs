// 代理的业务逻辑：与运行环境无关（Workers / Node 都用同一份）。
// 输入是标准 Request，输出是标准 Response —— 所以 Workers 里直接用，本地也用同一套。
import { Credits, InsufficientCredits } from "./credits.mjs";
import { creditsForSeconds } from "./config.mjs";

const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...extraHeaders },
  });

function corsHeaders(request, config) {
  const origin = request.headers.get("Origin") || "";
  const allowed = config.allowedOrigins.includes(origin) ? origin : config.allowedOrigins[0] || "*";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

/** 从请求里取用户标识。第一版：X-User-Id；上线前换成真正的登录态。 */
function userIdOf(request) {
  const id = request.headers.get("X-User-Id") || "";
  return /^[A-Za-z0-9_-]{6,64}$/.test(id) ? id : null;
}

function normalizeStatus(raw) {
  const s = String(raw || "").toUpperCase();
  if (s === "SUCCESS" || s === "SUCCEEDED") return "succeeded";
  if (s === "RUNNING") return "running";
  if (s === "QUEUED" || s === "PENDING") return "queued";
  if (s === "FAILED") return "failed";
  if (s === "CANCELED" || s === "CANCELLED") return "canceled";
  return "unknown";
}

export function createHandler({ config, store, provider, clock = () => Date.now(), log = () => {} }) {
  const credits = new Credits(store, config);

  async function handle(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, config) });
    const cors = corsHeaders(request, config);

    try {
      if (path === "/v1/health") {
        return json({ ok: true, provider: provider.name, tiers: Object.fromEntries(Object.entries(config.tiers).map(([k, v]) => [k, { label: v.label, preDeduct: v.preDeduct, enabled: v.enabled !== false }])) }, 200, cors);
      }

      // 建会话：第一次出现即赠送初始积分（幂等）
      if (path === "/v1/session" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const userId = userIdOf(request) || body.userId;
        if (!/^[A-Za-z0-9_-]{6,64}$/.test(userId || "")) return json({ error: "需要 6–64 位的 userId" }, 400, cors);
        await credits.ensureUser(userId, clock());
        const balance = await credits.balance(userId);
        return json({ userId, balance }, 200, cors);
      }

      const userId = userIdOf(request);
      if (!userId) return json({ error: "缺少 X-User-Id" }, 401, cors);
      await credits.ensureUser(userId, clock());

      if (path === "/v1/balance" && request.method === "GET") {
        return json({ userId, balance: await credits.balance(userId) }, 200, cors);
      }

      if (path === "/v1/ledger" && request.method === "GET") {
        const limit = Number(url.searchParams.get("limit") || 50);
        return json({ userId, entries: await credits.entries(userId, limit) }, 200, cors);
      }

      if (path === "/v1/signin" && request.method === "POST") {
        const result = await credits.signin(userId, clock(), config.dailySigninCredits);
        return json({ ...result, balance: await credits.balance(userId) }, 200, cors);
      }

      // 生成：先预扣，再提交；提交失败立刻全额退还
      if (path === "/v1/generate" && request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        const tier = config.tiers[body.kind || "rehearsal"];
        if (!tier) return json({ error: `未知档位：${body.kind}` }, 400, cors);
        if (tier.enabled === false) {
          return json({ error: `${tier.label} 尚未启用（需要企业共享 Key，先在环境变量里配 FINAL_MODEL_PATH）` }, 501, cors);
        }

        // 先看余额（不落任何写），提交成功后才真正预扣；这样账本里每条任务只有一笔持有。
        const before = await credits.balance(userId);
        if (before.available < tier.preDeduct) throw new InsufficientCredits(before.available, tier.preDeduct);

        let submitted;
        try {
          submitted = await provider.submit({
            tier,
            params: {
              via: tier.webappId ? "ai-app" : "workflow",
              nodeInfoList: body.nodeInfoList || [],
              modelParams: body.modelParams || {},
            },
          });
        } catch (error) {
          return json({ error: `提交失败：${error.message}`, reserved: 0 }, 502, cors);
        }

        let record;
        try {
          // 幂等键 = provider 的 taskId：重复提交同一个任务不会重复扣
          record = await credits.reserve(userId, submitted.taskId, tier.preDeduct, clock(), { kind: tier.kind });
        } catch (error) {
          await provider.cancel(submitted.taskId).catch(() => {});
          throw error;
        }

        return json(
          {
            taskId: submitted.taskId,
            provider: submitted.provider,
            kind: tier.kind,
            reserved: record.amount,
            balance: await credits.balance(userId),
          },
          202,
          cors,
        );
      }

      // 查询任务：跑完就结算（按实际 GPU 秒），失败/取消/排队超时就全额退还
      const taskMatch = path.match(/^\/v1\/task\/([A-Za-z0-9_-]+)$/);
      if (taskMatch && request.method === "GET") {
        const taskId = taskMatch[1];
        const record = await credits.reservation(taskId);
        if (!record) return json({ error: "未知任务" }, 404, cors);
        if (record.userId !== userId) return json({ error: "无权访问该任务" }, 403, cors);

        // 已终态：直接回放，不重复扣
        if (record.state !== "reserved") {
          return json({ taskId, status: record.charged === 0 ? "refunded" : "settled", charged: record.charged, balance: await credits.balance(userId) }, 200, cors);
        }

        const status = normalizeStatus((await provider.status(taskId)).status);
        if (status === "queued") {
          const waited = (clock() - new Date(record.createdAt).getTime()) / 1000;
          if (waited > config.tiers[record.kind].queueTimeoutSec) {
            await provider.cancel(taskId);
            await credits.refund(taskId, clock(), "排队超时全额退还");
            return json({ taskId, status: "timeout_refunded", charged: 0, balance: await credits.balance(userId) }, 200, cors);
          }
          return json({ taskId, status, balance: await credits.balance(userId) }, 200, cors);
        }

        if (status === "failed" || status === "canceled") {
          await credits.refund(taskId, clock(), status === "canceled" ? "已取消全额退还" : "任务失败全额退还");
          const settled = await credits.reservation(taskId);
          return json({ taskId, status, charged: settled.charged, balance: await credits.balance(userId) }, 200, cors);
        }

        if (status === "running") {
          await credits.markRunning(taskId, clock());
          return json({ taskId, status, reserved: record.amount, balance: await credits.balance(userId) }, 200, cors);
        }

        if (status === "succeeded") {
          const fresh = await credits.reservation(taskId);
          const detail = await provider.status(taskId);
          const startMs = fresh.runningStartedAt ? new Date(fresh.runningStartedAt).getTime() : clock();
          const seconds = Math.max(1, Math.ceil((clock() - startMs) / 1000));
          const actual = creditsForSeconds(config, seconds, config.tiers[record.kind].instanceType);
          const settled = await credits.settle(taskId, actual, clock());
          return json(
            {
              taskId,
              status: "succeeded",
              url: detail.url || null,
              seconds,
              charged: settled.charged,
              refunded: settled.amount - settled.charged,
              balance: await credits.balance(userId),
            },
            200,
            cors,
          );
        }

        return json({ taskId, status: "queued", balance: await credits.balance(userId) }, 200, cors);
      }

      // 主动取消：全额退还
      const cancelMatch = path.match(/^\/v1\/task\/([A-Za-z0-9_-]+)\/cancel$/);
      if (cancelMatch && request.method === "POST") {
        const taskId = cancelMatch[1];
        const record = await credits.reservation(taskId);
        if (!record || record.userId !== userId) return json({ error: "未知任务" }, 404, cors);
        await provider.cancel(taskId);
        const settled = await credits.refund(taskId, clock(), "用户取消全额退还");
        return json({ taskId, status: settled.state === "refunded" ? "canceled" : "noop", charged: settled.charged, balance: await credits.balance(userId) }, 200, cors);
      }

      return json({ error: "未知路由", path }, 404, cors);
    } catch (error) {
      if (error instanceof InsufficientCredits) {
        return json({ error: error.message, code: error.code, balance: error.balance, need: error.need }, 402, cors);
      }
      log("handler error", error);
      return json({ error: "服务内部错误", detail: String(error?.message || error) }, 500, cors);
    }
  }

  return { handle, credits };
}
