/**
 * 镜间工作台 · 色卡质检台（本地网页版）
 *
 * 只在本机运行，不进入 GitHub Pages 产物。启动：
 *   npm run studio        → http://127.0.0.1:4321
 *
 * 能做的三件事：
 *   1. 按「色卡与画面的吻合度」逐帧对照手写色卡与实测主色；
 *   2. 决定每帧是「采用实测 / 补全 / 标记刻意偏离 / 撤销」，决定存在 .studio/state.json；
 *   3. 把决定写成 lib/palette-overrides.ts，构建时覆盖手写色卡（不改 lib/data.ts）。
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { clearStudioCache, loadOverrides, loadState, loadStudio, OVERRIDE_FILE, paletteFit, saveState, suggestPalette, writeOverrideFile } from "./lib/load.mjs";

const root = process.cwd();
const port = Number(process.argv[2] ?? process.env.STUDIO_PORT ?? 4321);
const assetTypes = { ".html": "text/html; charset=utf-8", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".css": "text/css", ".js": "text/javascript" };

const json = (response, payload, status = 200) => {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
};
const readBody = (request) => new Promise((resolve) => {
  let body = "";
  request.on("data", (chunk) => { body += chunk; });
  request.on("end", () => { try { resolve(JSON.parse(body || "{}")); } catch { resolve({}); } });
});

function summaryOf(frames, decisions) {
  const measured = frames.filter((frame) => frame.fit);
  return {
    total: frames.length,
    severe: measured.filter((frame) => frame.fit.coverage < 0.3).length,
    borderline: measured.filter((frame) => frame.fit.coverage >= 0.3 && frame.fit.coverage < 0.6).length,
    good: measured.filter((frame) => frame.fit.coverage >= 0.6).length,
    overridden: frames.filter((frame) => frame.paletteSource === "override").length,
    decided: Object.keys(decisions).length,
    filmDefaults: frames.filter((frame) => frame.paletteSource === "film-default").length,
  };
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://127.0.0.1:${port}`);

  try {
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const html = await readFile(path.join(root, "scripts/studio/ui.html"));
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return response.end(html);
    }

    if (url.pathname === "/api/frames") {
      const { frames } = await loadStudio();
      const state = await loadState();
      const withDecisions = frames.map((frame) => ({ ...frame, decision: state.decisions[frame.slug] ?? null }));
      return json(response, { summary: summaryOf(frames, state.decisions), frames: withDecisions });
    }

    if (url.pathname === "/api/decision" && request.method === "POST") {
      const body = await readBody(request);
      const { frames } = await loadStudio();
      const frame = frames.find((item) => item.slug === body.slug);
      if (!frame) return json(response, { error: `未知画面 ${body.slug}` }, 404);
      if (!["replace", "merge", "intent", "reset"].includes(body.mode)) return json(response, { error: `未知动作 ${body.mode}` }, 400);

      const state = await loadState();
      if (body.mode === "reset") delete state.decisions[body.slug];
      else {
        const palette = body.mode === "intent" ? [] : suggestPalette(frame.palette, frame.tone.dominants, body.mode);
        state.decisions[body.slug] = { mode: body.mode, palette, at: new Date().toISOString(), coverageBefore: frame.fit ? Math.round(frame.fit.coverage * 1000) / 10 : null };
      }
      await saveState(state);
      const palette = state.decisions[body.slug]?.palette ?? frame.palette;
      const fit = body.mode === "reset" ? frame.fit : paletteFit(palette, frame.tone.dominants);
      return json(response, { decision: state.decisions[body.slug] ?? null, palette, fit, summary: summaryOf(frames, state.decisions) });
    }

    if (url.pathname === "/api/apply" && request.method === "POST") {
      const state = await loadState();
      const overrides = {};
      for (const [slug, decision] of Object.entries(state.decisions)) {
        const palette = Array.isArray(decision.palette) ? decision.palette.filter((color) => /^#[0-9A-Fa-f]{6}$/.test(color)) : [];
        if (palette.length) overrides[slug] = palette;
      }
      const note = `${new Date().toISOString().slice(0, 16).replace("T", " ")} · 共 ${Object.keys(overrides).length} 帧`;
      await writeOverrideFile(overrides, note);
      clearStudioCache();
      return json(response, { file: OVERRIDE_FILE, count: Object.keys(overrides).length, slugs: Object.keys(overrides).sort(), note });
    }

    if (url.pathname === "/api/reset-decisions" && request.method === "POST") {
      await saveState({ decisions: {} });
      await writeOverrideFile({}, "已清空：等待第一次回填");
      clearStudioCache();
      return json(response, { ok: true });
    }

    if (url.pathname === "/api/overrides") return json(response, { overrides: await loadOverrides(), file: OVERRIDE_FILE });

    if (url.pathname.startsWith("/images/")) {
      const filePath = path.join(root, "public", url.pathname.replace(/^\/+/, ""));
      const info = await stat(filePath).catch(() => null);
      if (!info || info.isDirectory()) { response.writeHead(404); return response.end("not found"); }
      const body = await readFile(filePath);
      response.writeHead(200, { "content-type": assetTypes[path.extname(filePath)] ?? "application/octet-stream", "cache-control": "no-store" });
      return response.end(body);
    }

    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
  } catch (error) {
    json(response, { error: String(error?.message ?? error) }, 500);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`镜间工作台 · 色卡质检台：http://127.0.0.1:${port}`);
  console.log("决定保存在 .studio/state.json；「生成回填文件」会写 lib/palette-overrides.ts（需重新 build 才生效）");
});
