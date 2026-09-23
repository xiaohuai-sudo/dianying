// 真 provider：RunningHub 官方接口。
// 接口形状来自官方文档与实测（apiKey 放在 body，Host 头必须显式带，任务异步）。
//
// 注意：这里没有任何「本地伪造」——调用失败就把失败原样往上抛。

const STATUS_MAP = {
  QUEUED: "queued",
  RUNNING: "running",
  SUCCESS: "succeeded",
  FAILED: "failed",
  CANCELED: "canceled",
  CANCELLED: "canceled",
};

export function createRunningHubProvider({ apiKey, apiBase = "https://www.runninghub.cn", fetchImpl = fetch } = {}) {
  if (!apiKey) throw new Error("createRunningHubProvider 需要 apiKey");

  const host = new URL(apiBase).host;

  async function post(path, body) {
    const res = await fetchImpl(`${apiBase}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Host: host,
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ apiKey, ...body }),
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`RunningHub ${path} 返回非 JSON（HTTP ${res.status}）：${text.slice(0, 200)}`);
    }
    if (json.code !== 0) throw new Error(`RunningHub ${path} 失败 code=${json.code} msg=${json.msg}`);
    return json.data;
  }

  return {
    name: "runninghub",

    /** 提交任务。tier 决定走 AI 应用接口、工作流接口还是标准模型接口。 */
    async submit({ tier, params = {} }) {
      const nodeInfoList = params.nodeInfoList || [];
      const instanceType = tier.instanceType === "plus" ? "plus" : "default";

      // 成片档：第三方标准模型，路径形如 kling-v3.0-std/image-to-video
      if (tier.modelPath) {
        const res = await fetchImpl(`${apiBase}/openapi/v2/${tier.modelPath.replace(/^\//, "")}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Host: host, Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ apiKey, ...(params.modelParams || {}) }),
        });
        const json = await res.json();
        if (json.code !== 0 && json.code !== undefined) {
          throw new Error(`标准模型 ${tier.modelPath} 失败 code=${json.code} msg=${json.msg}`);
        }
        const data = json.data ?? json;
        return { taskId: data.taskId || data.id, provider: "runninghub-standard-model" };
      }

      const taskId =
        tier.webappId && params.via === "ai-app"
          ? (await post("/task/openapi/ai-app/run", {
              webappId: tier.webappId,
              nodeInfoList,
              taskType: "ASYNC",
              instanceType,
            })).taskId
          : (await post("/task/openapi/create", {
              workflowId: tier.workflowId,
              nodeInfoList,
              addMetadata: true,
              instanceType,
            })).taskId;
      return { taskId, provider: "runninghub" };
    },

    async status(taskId) {
      const data = await post("/task/openapi/status", { taskId });
      const raw = typeof data === "string" ? data : data?.taskStatus || data?.status;
      const status = STATUS_MAP[String(raw || "").toUpperCase()] || "unknown";
      if (status !== "succeeded") return { status, raw };
      const outputs = await post("/task/openapi/outputs", { taskId });
      const list = Array.isArray(outputs) ? outputs : outputs?.outputs || [outputs];
      const first = list.find((o) => o && (o.fileUrl || o.url)) || {};
      return { status, url: first.fileUrl || first.url || null, fileType: first.fileType || null, raw };
    },

    async cancel(taskId) {
      await post("/task/openapi/cancel", { taskId });
      return { canceled: true };
    },

    /**
     * 上传首帧。AI 应用/工作流用 /task/openapi/upload（返回 fileName，
     * 直接填进 nodeInfoList 的 file 类字段）；标准模型用 /openapi/v2/media/upload/binary。
     */
    async upload(bytes, filename, mime = "image/webp") {
      const form = new FormData();
      form.append("apiKey", apiKey);
      form.append("file", new Blob([bytes], { type: mime }), filename);
      const res = await fetchImpl(`${apiBase}/task/openapi/upload`, {
        method: "POST",
        headers: { Host: host },
        body: form,
      });
      const json = await res.json();
      if (json.code !== 0) throw new Error(`上传失败 code=${json.code} msg=${json.msg}`);
      return { fileName: json.data.fileName, fileType: json.data.fileType };
    },

    async account() {
      const res = await fetchImpl(`${apiBase}/api/account/get-account-info?apiKey=${encodeURIComponent(apiKey)}`, {
        headers: { Host: host },
      });
      const json = await res.json();
      return json.data ?? json;
    },
  };
}
