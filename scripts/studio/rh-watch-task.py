#!/usr/bin/env python
"""rh-watch-task.py — 盯一个 RunningHub 任务到结束：取片 → 抽帧体检 → 读账单。

    python scripts/studio/rh-watch-task.py <taskId> <tag> [--webapp <id>]

排队不计费，所以可以放心长盯；每 60 秒查一次任务状态。
"""
import argparse
import csv
import json
import os
import re
import subprocess
import time
import urllib.request

from camoufox.sync_api import Camoufox

OUTDIR = r"C:\Users\Lenovo\Downloads\jingjian-clips"
CSV = r"D:\dianyingwangzhan\.studio\tune-log.csv"
PROFILE = r"C:\Users\Lenovo\AppData\Local\Temp\cf-profile-copy3"


def log(m):
    print(f"[{time.strftime('%H:%M:%S')}] {m}", flush=True)


def audit(path):
    try:
        import imageio_ffmpeg
        import numpy as np
        from PIL import Image
    except Exception as e:
        return {"audit": f"缺依赖 {e}"}
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    tmp = os.path.join(os.path.expandvars(r"%LOCALAPPDATA%\Temp"), "rh_watch_frames")
    os.makedirs(tmp, exist_ok=True)
    for f in os.listdir(tmp):
        os.remove(os.path.join(tmp, f))
    subprocess.run([exe, "-y", "-i", path, "-vsync", "0", os.path.join(tmp, "f%04d.png")], capture_output=True)
    frames = sorted(os.listdir(tmp))
    grays = [np.asarray(Image.open(os.path.join(tmp, f)).convert("L"), dtype=np.float32) for f in frames]
    diffs = [float(abs(grays[i] - grays[i - 1]).mean()) for i in range(1, len(grays))]
    dups = sum(1 for d in diffs if d < 0.05)
    probe = subprocess.run([exe, "-i", path], capture_output=True, text=True, errors="replace").stderr
    res = re.search(r"(\d{3,4})x(\d{3,4})", probe)
    fps = re.search(r"([\d.]+) fps", probe)
    dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe)
    secs = (int(dur.group(1)) * 3600 + int(dur.group(2)) * 60 + float(dur.group(3))) if dur else 0
    return {"res": res.group(0) if res else "?", "fps": fps.group(1) if fps else "?",
            "seconds": round(secs, 2), "frames": len(grays),
            "dup_pct": round(dups / max(1, len(diffs)) * 100),
            "mean_diff": round(sum(diffs) / max(1, len(diffs)), 3),
            "audio": "yes" if "Audio:" in probe else "no"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("task")
    ap.add_argument("tag")
    ap.add_argument("--webapp", default="2101715005812068354")
    ap.add_argument("--profile", default=PROFILE)
    ap.add_argument("--interval", type=int, default=60)
    ap.add_argument("--max-hours", type=float, default=6)
    args = ap.parse_args()

    deadline = time.time() + args.max_hours * 3600
    out_url = None
    status = "?"
    err = ""
    with Camoufox(headless=True, os="windows", persistent_context=True, user_data_dir=args.profile) as ctx:
        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto(f"https://www.runninghub.cn/ai-detail/{args.webapp}", timeout=90000, wait_until="domcontentloaded")
        page.wait_for_timeout(8000)
        i = 0
        while time.time() < deadline:
            i += 1
            res = page.evaluate("""async (wid) => {
                const ck = {}; document.cookie.split(';').forEach(s => { const ix = s.indexOf('='); if (ix>0) ck[s.slice(0,ix).trim()] = s.slice(ix+1).trim(); });
                const r = await fetch('/task/list', {method:'POST',
                  headers:{'Content-Type':'application/json', 'Authorization': ck['Rh-Accesstoken'] || ''},
                  credentials:'include', body: JSON.stringify({size:10, current:1, webappId: wid, taskType:['WORKFLOW','WEBAPP']})});
                return await r.text();
            }""", args.webapp)
            try:
                recs = json.loads(res).get("data", {}).get("records") or []
            except Exception:
                recs = []
            rec = next((r for r in recs if str(r.get("taskId")) == args.task), None)
            if rec:
                status = rec.get("taskStatus") or "?"
                desc = str(rec.get("taskResultDesc") or "")
                m = re.search(r'"exception_message":"([^"]{0,160})', desc)
                err = m.group(1) if m else ""
            log(f"轮询 {i}: 状态={status}" + (f" | 错误={err[:80]}" if err else ""))
            if status == "SUCCESS":
                hist = page.evaluate("""async () => {
                    const ck = {}; document.cookie.split(';').forEach(s => { const ix = s.indexOf('='); if (ix>0) ck[s.slice(0,ix).trim()] = s.slice(ix+1).trim(); });
                    const r = await fetch('/api/output/v2/history', {method:'POST',
                      headers:{'Content-Type':'application/json', 'Authorization': ck['Rh-Accesstoken'] || ''},
                      credentials:'include', body: JSON.stringify({size:20, current:1})});
                    return await r.text();
                }""")
                try:
                    for r2 in (json.loads(hist).get("data") or []):
                        try:
                            pid = json.loads(r2.get("promptResponse") or "{}").get("prompt_id")
                        except Exception:
                            pid = None
                        if pid == args.task:
                            out_url = r2.get("fileUrl")
                except Exception:
                    pass
                break
            if status in ("FAILED", "CANCELED"):
                log("任务结束（非成功），退出轮询")
                break
            page.wait_for_timeout(args.interval * 1000)

    row = {"tag": args.tag, "task": args.task, "status": status, "error": err[:120]}
    if out_url:
        os.makedirs(OUTDIR, exist_ok=True)
        dst = os.path.join(OUTDIR, f"{args.tag}.mp4")
        urllib.request.urlretrieve(out_url, dst)
        size = os.path.getsize(dst) / 1024 / 1024
        log(f"已下载 → {dst}（{size:.2f} MB）")
        a = audit(dst)
        row.update(a)
        row["file"] = os.path.basename(dst)
        row["mb"] = round(size, 2)
        log("体检：" + json.dumps(a, ensure_ascii=False))
    else:
        row["file"] = "未拿到"
    os.makedirs(os.path.dirname(CSV), exist_ok=True)
    new = not os.path.exists(CSV)
    with open(CSV, "a", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=list(row.keys()))
        if new:
            w.writeheader()
        w.writerow(row)
    print(json.dumps(row, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
