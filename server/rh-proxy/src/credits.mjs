// 积分账本：预扣 → 结算 → 退还，全部只追加，余额由流水汇总得出。
//
// 不变式：
//  1. 余额 = 该用户所有 delta 之和（没有任何「余额字段」被直接自增）。
//  2. 一个 taskId 只可能预扣一次、结算一次（靠 resv:<taskId> 记录的状态机守卫）。
//  3. 结算金额永远不会超过预扣金额（差额自动退还）。
//
// 存储抽象（store）需要 get / put / list 三个能力，见 store.mjs。

export const RESV_RESERVED = "reserved";
export const RESV_SETTLED = "settled";
export const RESV_REFUNDED = "refunded";

export class InsufficientCredits extends Error {
  constructor(balance, need) {
    super(`积分不足：需要 ${need}，当前 ${balance}`);
    this.code = "INSUFFICIENT_CREDITS";
    this.status = 402;
    this.balance = balance;
    this.need = need;
  }
}

const resvKey = (taskId) => `resv:${taskId}`;

// 流水键：时间戳 + 进程内自增序号 + 随机后缀，保证同一毫秒的多条流水不会互相覆盖。
let seq = 0;
const deltaKey = (userId, now) =>
  `ledger:${userId}:${String(now).padStart(15, "0")}:${String((seq += 1)).padStart(8, "0")}:${Math.random()
    .toString(36)
    .slice(2, 8)}`;

export class Credits {
  constructor(store, config) {
    this.store = store;
    this.config = config;
  }

  /** 新用户首次出现时赠送初始积分；重复调用是幂等的。 */
  async ensureUser(userId, now) {
    const key = `user:${userId}`;
    const existing = await this.store.get(key);
    if (existing) return existing;
    const user = { id: userId, createdAt: new Date(now).toISOString(), lastSignin: null };
    await this.store.put(key, user);
    await this.add(userId, this.config.newUserCredits, "新用户赠送", null, now);
    return user;
  }

  async add(userId, delta, reason, taskId, now) {
    const key = deltaKey(userId, now);
    await this.store.put(key, { userId, delta, reason, taskId, at: new Date(now).toISOString() });
    return delta;
  }

  async entries(userId, limit = 50) {
    const all = await this.store.list(`ledger:${userId}:`);
    return all
      .sort((a, b) => (a.key < b.key ? -1 : 1))
      .slice(-limit)
      .map((e) => e.value);
  }

  /**
   * 余额：预扣在 reserve 时就写成负数流水，所以 total 本身就是可用余额；
   * held 只是「还在跑的任务占了多少」的展示字段。
   */
  async balance(userId) {
    const ledger = await this.store.list(`ledger:${userId}:`);
    const total = ledger.reduce((sum, e) => sum + Number(e.value.delta || 0), 0);
    const holds = await this.store.list(`resv:`);
    const held = holds
      .filter((e) => e.value.userId === userId && e.value.state === RESV_RESERVED)
      .reduce((sum, e) => sum + Number(e.value.amount || 0), 0);
    return { total, held, available: total };
  }

  /** 签到：同一天只加一次。 */
  async signin(userId, now, amount) {
    const user = await this.ensureUser(userId, now);
    const day = new Date(now).toISOString().slice(0, 10);
    if (user.lastSignin === day) return { credited: 0, day };
    await this.store.put(`user:${userId}`, { ...user, lastSignin: day });
    await this.add(userId, amount, "每日签到", null, now);
    return { credited: amount, day };
  }

  /** 预扣：余额不足直接抛错；同一 taskId 重复预扣不会重复扣。预扣即写一条负数流水。 */
  async reserve(userId, taskId, amount, now, meta = {}) {
    const existing = await this.store.get(resvKey(taskId));
    if (existing) return existing;
    const { available } = await this.balance(userId);
    if (available < amount) throw new InsufficientCredits(available, amount);
    const record = {
      taskId,
      userId,
      amount,
      state: RESV_RESERVED,
      kind: meta.kind || "rehearsal",
      createdAt: new Date(now).toISOString(),
      runningStartedAt: null,
      settledAt: null,
      charged: null,
    };
    await this.add(userId, -amount, `生成预扣（上限 ${amount}）`, taskId, now);
    await this.store.put(resvKey(taskId), record);
    return record;
  }

  async markRunning(taskId, now) {
    const record = await this.store.get(resvKey(taskId));
    if (!record || record.state !== RESV_RESERVED || record.runningStartedAt) return record;
    const updated = { ...record, runningStartedAt: new Date(now).toISOString() };
    await this.store.put(resvKey(taskId), updated);
    return updated;
  }

  /**
   * 结算：actual 为实际消耗，封顶到预扣额；退还差额。
   * 幂等 —— 已结算/已退还的 taskId 再次调用只返回原记录。
   */
  async settle(taskId, actual, now, reason = "生成结算") {
    const record = await this.store.get(resvKey(taskId));
    if (!record) return null;
    if (record.state !== RESV_RESERVED) return record;
    const charged = Math.max(0, Math.min(Math.round(actual), record.amount));
    const refund = record.amount - charged;
    if (refund > 0) await this.add(record.userId, refund, `${reason}·退还差额`, taskId, now);
    const updated = { ...record, state: RESV_SETTLED, charged, settledAt: new Date(now).toISOString() };
    await this.store.put(resvKey(taskId), updated);
    return updated;
  }

  /** 全额退还：任务失败、超时或被取消。 */
  async refund(taskId, now, reason = "任务失败全额退还") {
    const record = await this.store.get(resvKey(taskId));
    if (!record) return null;
    if (record.state !== RESV_RESERVED) return record;
    await this.add(record.userId, record.amount, reason, taskId, now);
    const updated = { ...record, state: RESV_REFUNDED, charged: 0, settledAt: new Date(now).toISOString() };
    await this.store.put(resvKey(taskId), updated);
    return updated;
  }

  async reservation(taskId) {
    return this.store.get(resvKey(taskId));
  }
}
