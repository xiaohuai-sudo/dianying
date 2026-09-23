// 端到端断言：积分预扣 / 结算 / 退还 / 幂等 / 权限。
// 跑法：node --test server/rh-proxy/test/flow.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.mjs";
import { MemoryStore } from "../src/store.mjs";
import { createHandler } from "../src/handler.mjs";
import { createMockProvider } from "../src/providers/mock.mjs";

let now = Date.parse("2026-09-23T10:00:00Z");
const clock = () => now;

function build({ runSeconds = 40, failMode = null, env = {} } = {}) {
  const config = loadConfig(env);
  const store = new MemoryStore();
  const provider = createMockProvider({ clock, runSeconds, failMode });
  const { handle } = createHandler({ config, store, provider, clock });
  const call = async (path, { method = "GET", userId = "user-abc123", body } = {}) => {
    const res = await handle(
      new Request(`http://local${path}`, {
        method,
        headers: { "X-User-Id": userId, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      }),
    );
    return { status: res.status, data: await res.json() };
  };
  return { call, store, config, provider };
}

test("新用户拿到初始积分，签到每天只加一次", async () => {
  now = Date.parse("2026-09-23T10:00:00Z");
  const { call } = build();
  const s = await call("/v1/session", { method: "POST" });
  assert.equal(s.status, 200);
  assert.equal(s.data.balance.available, 300);

  const first = await call("/v1/signin", { method: "POST" });
  assert.equal(first.data.credited, 20);
  assert.equal(first.data.balance.available, 320);

  const again = await call("/v1/signin", { method: "POST" });
  assert.equal(again.data.credited, 0, "同一天签到不应重复赠送");
  assert.equal(again.data.balance.available, 320);
});

test("生成：预扣 → 按实际 GPU 秒结算 → 退还差额（不重复扣）", async () => {
  now = Date.parse("2026-09-23T10:00:00Z");
  const { call } = build({ runSeconds: 40 });
  await call("/v1/session", { method: "POST" });

  const gen = await call("/v1/generate", { method: "POST", body: { kind: "rehearsal" } });
  assert.equal(gen.status, 202);
  assert.equal(gen.data.reserved, 180);
  assert.equal(gen.data.balance.held, 180);
  assert.equal(gen.data.balance.available, 300 - 180);

  const poll1 = await call(`/v1/task/${gen.data.taskId}`);
  assert.equal(poll1.data.status, "running");

  now += 40_000; // 快进 40 秒
  const poll2 = await call(`/v1/task/${gen.data.taskId}`);
  assert.equal(poll2.data.status, "succeeded");
  assert.equal(poll2.data.seconds, 40);
  assert.equal(poll2.data.charged, 40);
  assert.equal(poll2.data.refunded, 140);
  assert.equal(poll2.data.balance.available, 300 - 40);
  assert.equal(poll2.data.balance.held, 0);

  const poll3 = await call(`/v1/task/${gen.data.taskId}`);
  assert.equal(poll3.data.charged, 40, "重复查询不应改变结算结果");
  assert.equal(poll3.data.balance.available, 300 - 40);
});

test("任务失败：全额退还", async () => {
  now = Date.parse("2026-09-23T10:00:00Z");
  const { call } = build({ failMode: "fail" });
  await call("/v1/session", { method: "POST" });
  const gen = await call("/v1/generate", { method: "POST", body: { kind: "rehearsal" } });
  const poll = await call(`/v1/task/${gen.data.taskId}`);
  assert.equal(poll.data.status, "failed");
  assert.equal(poll.data.charged, 0);
  assert.equal(poll.data.balance.available, 300);
});

test("排队超时：取消任务并全额退还", async () => {
  now = Date.parse("2026-09-23T10:00:00Z");
  const { call } = build({ failMode: "never", env: { QUEUE_TIMEOUT_SEC: "60" } });
  await call("/v1/session", { method: "POST" });
  const gen = await call("/v1/generate", { method: "POST", body: { kind: "rehearsal" } });
  const queued = await call(`/v1/task/${gen.data.taskId}`);
  assert.equal(queued.data.status, "queued");

  now += 61_000;
  const later = await call(`/v1/task/${gen.data.taskId}`);
  assert.equal(later.data.status, "timeout_refunded");
  assert.equal(later.data.balance.available, 300);
});

test("主动取消：全额退还", async () => {
  now = Date.parse("2026-09-23T10:00:00Z");
  const { call } = build();
  await call("/v1/session", { method: "POST" });
  const gen = await call("/v1/generate", { method: "POST", body: { kind: "rehearsal" } });
  const canceled = await call(`/v1/task/${gen.data.taskId}/cancel`, { method: "POST" });
  assert.equal(canceled.data.status, "canceled");
  assert.equal(canceled.data.balance.available, 300);
});

test("余额不足：402，且不产生任何持有", async () => {
  now = Date.parse("2026-09-23T10:00:00Z");
  const { call } = build({ env: { NEW_USER_CREDITS: "50" } });
  await call("/v1/session", { method: "POST" });
  const gen = await call("/v1/generate", { method: "POST", body: { kind: "rehearsal" } });
  assert.equal(gen.status, 402);
  assert.equal(gen.data.code, "INSUFFICIENT_CREDITS");
  const bal = await call("/v1/balance");
  assert.equal(bal.data.balance.available, 50);
  assert.equal(bal.data.balance.held, 0);
});

test("别人的任务看不了", async () => {
  now = Date.parse("2026-09-23T10:00:00Z");
  const { call } = build();
  await call("/v1/session", { method: "POST" });
  const gen = await call("/v1/generate", { method: "POST", body: { kind: "rehearsal" } });
  const peek = await call(`/v1/task/${gen.data.taskId}`, { userId: "user-other999" });
  assert.equal(peek.status, 403);
});

test("成片档未配置时明确拒服务，不静默失败", async () => {
  now = Date.parse("2026-09-23T10:00:00Z");
  const { call } = build();
  await call("/v1/session", { method: "POST" });
  const gen = await call("/v1/generate", { method: "POST", body: { kind: "final" } });
  assert.equal(gen.status, 501);
});

test("健康检查暴露档位与预扣额", async () => {
  const { call } = build();
  const health = await call("/v1/health");
  assert.equal(health.data.provider, "mock");
  assert.equal(health.data.tiers.rehearsal.preDeduct, 180);
  assert.equal(health.data.tiers.final.enabled, false);
});
