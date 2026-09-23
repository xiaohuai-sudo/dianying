// 代理的配置：全部来自环境变量，前端拿不到任何密钥。
//
// 积分口径（见 docs/video-generation-options.md 第七节）：
//   1 积分 = 1 RH币（直接镜像平台账单单位）。
//   Standard(24G) 每秒 0.2 币 → 单价 0.2 积分/秒；Plus(48G) 每秒 0.4 币（plusFactor = 2）。
//   实测锚点：704×544/81 帧 i2v 在 Standard 跑 99 秒 = 20 RH币 = 20 积分。
export function loadConfig(env = {}) {
  const num = (v, d) => (v === undefined || v === "" ? d : Number(v));
  const plusFactor = num(env.CREDITS_PER_PLUS_SECOND, 2);

  const rehearsal = {
    kind: "rehearsal",
    label: "试镜档（Wan2.2 + LightX2V 6 步）",
    // 预扣上限：跑完按实际 GPU 秒结算，多退少不补。
    // 实测（2026-09-23，81 帧 704×544，Standard）：耗时 1 分 39 秒 → 20 RH币，即 20 积分。
    // 平台自报的「预计消耗 89 币」与预扣接口的 65 币 / 312 秒都偏高一倍以上，不要照着定。
    // 预扣取 40（实测的两倍），给更多帧数/更慢的队列留余量。
    preDeduct: num(env.REHEARSAL_PRE_DEDUCT, 40),
    instanceType: env.REHEARSAL_INSTANCE || "default",
    // 有 webappId 走 AI 应用接口；否则退回工作流接口
    webappId: env.REHEARSAL_WEBAPP_ID || "1949884135491985409",
    workflowId: env.REHEARSAL_WORKFLOW_ID || "1949877835465932801",
    queueTimeoutSec: num(env.QUEUE_TIMEOUT_SEC, 900),
  };

  const final = {
    kind: "final",
    label: "成片档（第三方模型，需企业共享 Key）",
    preDeduct: num(env.FINAL_PRE_DEDUCT, 60),
    instanceType: "third-party",
    // 标准模型路径，例如 kling-v3.0-std/image-to-video
    modelPath: env.FINAL_MODEL_PATH || "",
    creditsPerSecond: num(env.FINAL_CREDITS_PER_SECOND, 1),
    enabled: Boolean(env.FINAL_MODEL_PATH),
    queueTimeoutSec: num(env.QUEUE_TIMEOUT_SEC, 900),
  };

  return {
    newUserCredits: num(env.NEW_USER_CREDITS, 300),
    dailySigninCredits: num(env.DAILY_SIGNIN_CREDITS, 20),
    // 0.2 = Standard 档每秒的 RH币单价 ⇒ 收费积分与平台账单一致（99 秒 → 20 积分）
    creditsPerSecond: num(env.CREDITS_PER_SECOND, 0.2),
    plusFactor,
    tiers: { rehearsal, final },
    providerName: env.RH_PROVIDER || (env.RH_API_KEY ? "runninghub" : "mock"),
    apiKey: env.RH_API_KEY || "",
    apiBase: env.RH_API_BASE || "https://www.runninghub.cn",
    // 静态站地址，用于 CORS；多个用逗号分隔
    allowedOrigins: (env.ALLOWED_ORIGINS || "http://127.0.0.1:4175,http://localhost:4175").split(",").map((s) => s.trim()).filter(Boolean),
    // 本地把账本落盘用
    dataFile: env.CREDITS_FILE || "",
  };
}

export function creditsForSeconds(config, seconds, instanceType) {
  const factor = instanceType === "plus" ? config.plusFactor : 1;
  return Math.max(1, Math.ceil(seconds) * config.creditsPerSecond * factor);
}
