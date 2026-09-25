#!/usr/bin/env python
"""rh-run-direct.py — 直接调 AI 应用的提交接口，用 nodeInfoList 覆盖任意节点参数。

为什么需要它：应用表单只暴露「图 + 提示词」，而清晰度（width/height/duration_seconds）、
采样参数都藏在图里。站点自己的提交接口 `/task/webapp/create` 接受 `inputs[]` 覆盖列表，
所以只要知道节点的 fieldName，就能绕开表单直接改参数 —— 这也是上线时代理要发的形状。

    python scripts/studio/rh-run-direct.py \
        --webapp 2101715005812068354 \
        --image-name <上传后的文件名> \
        --prompt "……" \
        --set "6:width=1280,6:height=704,30:width=1280,30:height=704,31:width=1280,31:height=704" \
        --instance plus --tag A-720p

产出：任务号、状态、产出文件（下载到 Downloads/jingjian-clips/<tag>.mp4）、抽帧体检结果。
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
import urllib.request

from camoufox.sync_api import Camoufox

REPO = r"D:\dianyingwangzhan"
OUTDIR = r"C:\Users\Lenovo\Downloads\jingjian-clips"
CSV = os.path.join(REPO, ".studio", "tune-log.csv")


def log(m):
    print(f"[{time.strftime('%H:%M:%S')}] {m}", flush=True)


def load_app_inputs(page, webapp):
    """读应用页当前的上传文件名与提示词（复用已上传的素材，避免重复上传）。"""
    return page.evaluate("""async (wid) => {
        const r = await fetch('/task/list', {method:'POST', headers:{'Content-Type':'application/json'},
            credentials:'include', body: JSON.stringify({size:1, current:1, webappId: wid,
              taskType:['WORKFLOW','WEBAPP'], taskStatus:['SUCCESS','RUNNING','QUEUED']})});
        return (await r.text()).slice(0, 400);
    }""", webapp)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--webapp", required=True)
    ap.add_argument("--image-name", default="", help="已上传到工作区的文件名（nodeId 4 / fieldName image）")
    ap.add_argument("--image", default="", help="本地图片路径：先用页面表单上传，再从抓包拿文件名")
    ap.add_argument("--prompt", default="")
    ap.add_argument("--set", default="", help="节点覆盖，形如 '6:width=1280,6:height=704'")
    ap.add_argument("--instance", default="plus", help="default / plus / …（档位）")
    ap.add_argument("--tag", required=True)
    ap.add_argument("--profile", default=os.path.expandvars(r"%LOCALAPPDATA%\Temp\cf-profile-copy2"))
    ap.add_argument("--timeout-min", type=int, default=45)
    args = ap.parse_args()

    overrides = []
    for part in [p for p in args.set.split(",") if p.strip()]:
        nid, kv = part.split(":", 1)
        fn, fv = kv.split("=", 1)
        try:
            fv = int(fv)
        except ValueError:
            pass
        overrides.append({"nodeId": nid.strip(), "fieldName": fn.strip(), "fieldValue": fv})
    log(f"覆盖项 {len(overrides)} 条：{json.dumps(overrides, ensure_ascii=False)}")

    image_name = args.image_name
    caps = []
    task_id = None
    out_url = None
    os.makedirs(OUTDIR, exist_ok=True)

    with Camoufox(headless=True, os="windows", persistent_context=True, user_data_dir=args.profile) as ctx:
        page = ctx.pages[0] if ctx.pages else ctx.new_page()

        def on_req(req):
            if req.method == "POST" and "runninghub.cn" in req.url and req.post_data:
                caps.append({"url": req.url.split("runninghub.cn")[-1], "body": req.post_data})

        page.on("request", on_req)
        page.goto(f"https://www.runninghub.cn/ai-detail/{args.webapp}", timeout=90000, wait_until="domcontentloaded")
        page.wait_for_timeout(9000)

        if args.image and not image_name:
            log("上传本地图片，并从表单提交里取文件名…")
            page.set_input_files("input[type=file]", args.image, timeout=45000)
            page.wait_for_timeout(12000)
            # 上传接口返回的文件名
            for c in caps:
                m = re.search(r'"(?:fileName|file_name|name|image)"\s*:\s*"([0-9a-f]{32,64}\.\w+)"', c["body"])
                if m:
                    image_name = m.group(1)
                    break
            if not image_name:
                log("⚠️ 没拿到上传文件名，改从页面 DOM 猜；若失败请用 --image-name 指定")
                image_name = page.evaluate("""() => {
                    const el = document.querySelector('img[src*="/upload"], img[src*="rh-images"]');
                    return el ? el.getAttribute('src') : '';
                }""") or ""
        log("image 文件名: " + str(image_name)[:80])

        inputs = []
        if image_name:
            inputs.append({"nodeId": "4", "nodeName": "LoadImage", "fieldName": "image",
                           "fieldValue": os.path.basename(image_name), "description": "image"})
        if args.prompt:
            inputs.append({"nodeId": "7", "nodeName": "RHMiniMaxH3FL2VAEncode", "fieldName": "prompt",
                           "fieldValue": args.prompt, "description": "prompt"})
        inputs.extend(overrides)

        payload = {"webappId": args.webapp, "inputs": inputs,
                   "clientId": "".join(re.findall(r"[0-9a-f]", str(time.time())))[:32],
                   "instanceType": args.instance, "usePersonalQueue": False}
        log("提交 /task/webapp/create…")
        res = page.evaluate("""async (p) => {
            const ck = {}; document.cookie.split(';').forEach(s => { const i = s.indexOf('='); if (i>0) ck[s.slice(0,i).trim()] = s.slice(i+1).trim(); });
            const r = await fetch('/task/webapp/create', {method:'POST',
              headers:{'Content-Type':'application/json', 'Authorization': ck['Rh-Accesstoken'] || ''},
              credentials:'include', body: JSON.stringify(p)});
            return (await r.text()).slice(0, 500);
        }""", payload)
        log("提交响应: " + str(res)[:400])
        m = re.search(r'"(\d{15,20})"', str(res))
        for key in ("taskId", "id", "taskCode"):
            mm = re.search(r'"%s"\s*:\s*"?(\d{15,20})' % key, str(res))
            if mm:
                task_id = mm.group(1)
                break
        if not task_id:
            m2 = re.search(r"\b(2\d{18})\b", str(res))
            task_id = m2.group(1) if m2 else None
        log("任务号 = " + str(task_id))

        deadline = time.time() + args.timeout_min * 60
        i = 0
        while time.time() < deadline:
            i += 1
            st = page.evaluate("""async (wid) => {
                const ck = {}; document.cookie.split(';').forEach(s => { const i = s.indexOf('='); if (i>0) ck[s.slice(0,i).trim()] = s.slice(i+1).trim(); });
                const r = await fetch('/task/list', {method:'POST',
                    headers:{'Content-Type':'application/json', 'Authorization': ck['Rh-Accesstoken'] || ''},
                    credentials:'include', body: JSON.stringify({size:6, current:1, webappId: wid,
                      taskType:['WORKFLOW','WEBAPP']})});
                return (await r.text()).slice(0, 3000);
            }""", args.webapp)
            s = str(st)
            # 只看这个任务自己的状态，别被历史成功记录骗了
            own = ""
            for m in re.finditer(r"\{[^{}]*\}", s):
                chunk = m.group(0)
                if task_id and task_id in chunk:
                    own = chunk
            found_task = bool(own) or (task_id and task_id in s)
            status_field = re.search(r'"(?:taskStatus|status)"\s*:\s*"([A-Z_]+)"', own or "")
            stt = status_field.group(1) if status_field else ""
            done = stt == "SUCCESS"
            failed = stt in ("FAILED", "CANCELED")
            log(f"  轮询 {i}: 任务可见={found_task} 成功标记={done} 失败标记={failed}")
            if found_task and done:
                # 取产出直链
                hist = page.evaluate("""async () => {
                    const ck = {}; document.cookie.split(';').forEach(s => { const i = s.indexOf('='); if (i>0) ck[s.slice(0,i).trim()] = s.slice(i+1).trim(); });
                    const r = await fetch('/api/output/v2/history', {method:'POST',
                      headers:{'Content-Type':'application/json', 'Authorization': ck['Rh-Accesstoken'] || ''},
                      credentials:'include', body: JSON.stringify({size:6, current:1})});
                    return (await r.text()).slice(0, 4000);
                }""")
                try:
                    data = json.loads(hist)
                    for rec in (data.get("data") or []):
                        try:
                            pid = json.loads(rec.get("promptResponse") or "{}").get("prompt_id")
                        except Exception:
                            pid = None
                        if pid == task_id:
                            out_url = rec.get("fileUrl")
                except Exception:
                    pass
                break
            if found_task and failed:
                log("任务失败")
                break
            page.wait_for_timeout(30000)

        if not out_url:
            # 退路：打开「我的生成」再抓一次
            try:
                page.locator("text=我的生成").first.click(timeout=8000)
                page.wait_for_timeout(8000)
            except Exception:
                pass

    row = {"tag": args.tag, "webapp": args.webapp, "task": task_id, "overrides": json.dumps(overrides, ensure_ascii=False)}
    if out_url:
        dst = os.path.join(OUTDIR, f"{args.tag}.mp4")
        urllib.request.urlretrieve(out_url, dst)
        log(f"已下载 → {dst}（{os.path.getsize(dst)/1024/1024:.2f} MB）")
        row["file"] = os.path.basename(dst)
        row["mb"] = round(os.path.getsize(dst) / 1024 / 1024, 2)
    else:
        log("没拿到产出直链")
        row["file"] = "未拿到"
    os.makedirs(os.path.dirname(CSV), exist_ok=True)
    import csv
    new = not os.path.exists(CSV)
    with open(CSV, "a", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=list(row.keys()))
        if new:
            w.writeheader()
        w.writerow(row)
    print(json.dumps(row, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
