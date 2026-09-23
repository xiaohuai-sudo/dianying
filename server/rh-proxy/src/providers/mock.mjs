// 假 provider：本地把全流程跑通，不花一分钱、不联网。
// 时间由注入的 clock 驱动，所以测试可以「快进」。
//
// 行为：提交后进入 queued；第一次查询转 running（开始计时）；runSeconds 秒后 succeeded。
// failMode = "fail" 则失败；"never" 则永远排队（用来验证排队超时全额退还）。

export function createMockProvider({ clock = () => Date.now(), runSeconds = 40, failMode = null } = {}) {
  const tasks = new Map();
  let seq = 0;

  return {
    name: "mock",
    runSeconds,

    async submit({ tier, params = {} }) {
      const taskId = `mock-${++seq}-${clock()}`;
      tasks.set(taskId, {
        tier: tier.kind,
        submittedAt: clock(),
        startedAt: null,
        params,
      });
      return { taskId, provider: "mock" };
    },

    async status(taskId) {
      const task = tasks.get(taskId);
      if (!task) return { status: "failed", raw: "unknown task" };
      if (failMode === "never") return { status: "queued" };
      if (!task.startedAt) task.startedAt = clock();
      const elapsed = (clock() - task.startedAt) / 1000;
      if (failMode === "fail") return { status: "failed", raw: "mock failure" };
      if (elapsed < runSeconds) return { status: "running" };
      return { status: "succeeded", url: `https://example.invalid/${taskId}.mp4`, fileType: "mp4" };
    },

    async cancel(taskId) {
      const task = tasks.get(taskId);
      if (task) task.canceled = true;
      return { canceled: true };
    },

    async upload(bytes, filename) {
      return { fileName: `mock-${filename}`, fileType: "IMAGE", bytes: bytes?.length ?? 0 };
    },
  };
}
