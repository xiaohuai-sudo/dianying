#!/usr/bin/env python
"""rh-tune.py — 迭代调参用的一次性跑测：提交 → 认领产出 → 体检 → 记账。

用法（本机工作台的调参工具，不上线）：
    python scripts/studio/rh-tune.py --webapp 2102654742412488705 \
        --image <首帧.webp> --prompt "……" --tag A-turbo768p

它做四件事，全部按实测口径：
 1. 在 AI 应用页上传参考图 / 填提示词 / 点「立即运行」，抓 19 位任务号。
 2. 点「我的生成」，用 `/api/output/v2/history` 里 `promptResponse.prompt_id` 对上任务号
    再取产出 —— 绝不抓「页面上新出现的 mp4」（应用页自带示例片）。
 3. 读 `/call-api/bill-task` 里该任务那一行，拿真实 时长 / RH币。
 4. 抽帧体检（分辨率、真帧率、重复帧、逐帧差异），把一行结果追加进 .studio/tune-log.csv。

依赖：camoufox venv 里的 playwright + imageio-ffmpeg（本机已装）。
同一时刻只能有一个进程用同一个 profile 副本；默认用 copy1，可用 --profile 换副本并行。
"""
import argparse
import csv
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
DEFAULT_PROFILE = os.path.expandvars(r"%LOCALAPPDATA%\Temp\cf-profile-copy")
BASELINE_MP4 = {"1a9eb818f915c272199838a3b12ef9b2"}  # 应用页自带示例片


def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def audit(path):
    """抽帧体检：分辨率/真帧率/重复帧/逐帧差异。"""
    try:
        import imageio_ffmpeg
        import numpy as np
        from PIL import Image
    except Exception as e:
        return {"audit": f"缺依赖 {e}"}
    exe = imageio_ffmpeg.get_ffmpeg_exe()
    tmp = os.path.join(os.path.expandvars(r"%LOCALAPPDATA%\Temp"), "rh_tune_frames")
    os.makedirs(tmp, exist_ok=True)
    for f in os.listdir(tmp):
        os.remove(os.path.join(tmp, f))
    subprocess.run([exe, "-y", "-i", path, "-vsync", "0", os.path.join(tmp, "f%04d.png")], capture_output=True)
    frames = sorted(os.listdir(tmp))
    grays = [np.asarray(Image.open(os.path.join(tmp, f)).convert("L"), dtype=np.float32) for f in frames]
    diffs = [float(abs(grays[i] - grays[i - 1]).mean()) for i in range(1, len(grays))]
    dups = sum(1 for d in diffs if d < 0.5)
    probe = subprocess.run([exe, "-i", path], capture_output=True, text=True, errors="replace").stderr
    res = re.search(r"(\d{2,4})x(\d{2,4})", probe)
    fps = re.search(r"([\d.]+) fps", probe)
    dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", probe)
    secs = (int(dur.group(1)) * 3600 + int(dur.group(2)) * 60 + float(dur.group(3))) if dur else 0
    return {
        "res": res.group(0) if res else "?",
        "fps": fps.group(1) if fps else "?",
        "seconds": round(secs, 2),
        "frames": len(grays),
        "dup_pct": round(dups / max(1, len(diffs)) * 100),
        "mean_diff": round(sum(diffs) / max(1, len(diffs)), 3),
        "audio": "yes" if "Audio:" in probe else "no",
    }


def bill_row(page, task_id):
    """从 /call-api/bill-task 里读这条任务的真实 时长 / RH币（按任务号匹配整行）。"""
    try:
        page.goto("https://www.runninghub.cn/call-api/bill-task", timeout=60000, wait_until="domcontentloaded")
        page.wait_for_timeout(8000)
        txt = page.inner_text("body").replace("\t", "|")
    except Exception as e:
        return {"bill": f"读不到 {repr(e)[:50]}"}
    for row in re.findall(r"(\d{19})\s*\|\s*(\d{4}-\d{2}-\d{2} [\d:]+)\s*\|\s*([^|]{2,60}?)\s*\|\s*([^|]{2,8}?)\s*\|\s*([\d:]{4,8})\s*\|\s*(\d+)", txt):
        if row[0] == task_id:
            return {"bill_start": row[1], "bill_name": row[2][:40], "bill_status": row[3],
                    "bill_dur": row[4], "bill_coins": row[5]}
    return {"bill": "该行还没出现（可能未结算）"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--webapp", required=True, help="AI 应用 id（/ai-detail/<id>）")
    ap.add_argument("--image", default="", help="参考图/首帧路径（不传则不改动应用默认输入）")
    ap.add_argument("--prompt", default="", help="提示词")
    ap.add_argument("--tag", required=True, help="这次实验的名字（同时作为文件名前缀）")
    ap.add_argument("--profile", default=DEFAULT_PROFILE, help="profile 副本目录")
    ap.add_argument("--num", default="", help="按顺序填前 N 个可见数字框，逗号分隔（如 '1,2' = 输出分辨率1/插帧倍率2）")
    ap.add_argument("--switch", default="", choices=["", "on", "off"], help="设置第一个开关（如「是否插帧」）")
    ap.add_argument("--timeout-min", type=int, default=40)
    args = ap.parse_args()

    os.makedirs(OUTDIR, exist_ok=True)
    os.makedirs(os.path.dirname(CSV), exist_ok=True)
    history = []
    out_path = os.path.join(OUTDIR, f"{args.tag}.mp4")

    with Camoufox(headless=True, os="windows", persistent_context=True, user_data_dir=args.profile) as ctx:
        page = ctx.pages[0] if ctx.pages else ctx.new_page()

        def on_resp(r):
            if "output/v2/history" in r.url:
                try:
                    history.append(r.text())
                except Exception:
                    pass

        page.on("response", on_resp)
        page.goto(f"https://www.runninghub.cn/ai-detail/{args.webapp}", timeout=90000, wait_until="domcontentloaded")
        page.wait_for_timeout(9000)
        log("页面已开：" + page.title()[:60])

        if args.image:
            log("上传输入：" + os.path.basename(args.image))
            page.set_input_files("input[type=file]", args.image, timeout=45000)
            wait = 38000 if args.image.lower().endswith((".mp4", ".mov", ".webm")) else 9000
            page.wait_for_timeout(wait)
        if args.prompt:
            log("填提示词")
            filled = False
            for sel in ["textarea:visible", "[contenteditable='true']:visible",
                        "input[placeholder*='提示']:visible", "input[placeholder*='描述']:visible",
                        "input[placeholder*='prompt']:visible"]:
                try:
                    el = page.locator(sel).first
                    if el.count():
                        el.click(timeout=8000)
                        el.fill(args.prompt)
                        log(f"  已写入（{sel}）")
                        filled = True
                        break
                except Exception as e:
                    log(f"  {sel} 不可用 {repr(e)[:60]}")
            if not filled:
                log("  ⚠️ 该应用没有可见的提示词输入框（可能用固定提示词），本次跳过")

        if args.num:
            vals = [v.strip() for v in args.num.split(",") if v.strip()]
            log(f"填数字框：{vals}")
            boxes = page.locator("textarea:visible")
            for i, v in enumerate(vals):
                try:
                    el = boxes.nth(i)
                    if el.count():
                        el.click(timeout=6000)
                        el.fill(v)
                        log(f"   第 {i+1} 个框 ← {v}")
                except Exception as e:
                    log(f"   第 {i+1} 个框失败 {repr(e)[:60]}")

        if args.switch:
            log(f"设置第一个开关 = {args.switch}")
            try:
                sw = page.locator(".ant-switch").first
                if sw.count():
                    cls = sw.get_attribute("class") or ""
                    is_on = "ant-switch-checked" in cls
                    if (args.switch == "on") != is_on:
                        sw.click(timeout=6000)
                        log(f"   已切换（原状态 {'开' if is_on else '关'}）")
                    else:
                        log(f"   已是目标状态（{'开' if is_on else '关'}）")
            except Exception as e:
                log("   开关设置失败 " + repr(e)[:70])

        log("提交前的可见表单：")
        try:
            form = page.evaluate("""() => {
              const out = [];
              document.querySelectorAll('input, textarea, .ant-select-selection-item').forEach(e => {
                const r = e.getBoundingClientRect();
                if (r.width > 30 && r.height > 8 && out.length < 14)
                  out.push(e.tagName + '[' + (e.type||'') + '] ' + (e.placeholder||'') + ' = ' + (e.value||e.textContent||''));
              });
              return out;
            }""")
            for f in form:
                log("   · " + str(f)[:90])
        except Exception as e:
            log("   表单读取失败 " + repr(e)[:60])

        log("点「立即运行」（等实例握手）")
        clicked = False
        for i in range(25):
            try:
                btn = page.locator("text=立即运行").first
                if btn.count() and btn.is_visible():
                    btn.click(timeout=8000)
                    clicked = True
                    log(f"  已点击（第 {i+1} 轮）")
                    break
            except Exception as e:
                log(f"  第 {i+1} 轮异常 {repr(e)[:60]}")
            page.wait_for_timeout(3000)
        if not clicked:
            log("点不到「立即运行」，放弃")
            sys.exit(2)
        page.wait_for_timeout(12000)

        body = page.inner_text("body")
        m = re.search(r"任务ID\s*(\d{15,20})", body)
        task_id = m.group(1) if m else None
        log(f"任务号 = {task_id}")
        if not task_id:
            page.screenshot(path=os.path.expandvars(r"%LOCALAPPDATA%\Temp\rh_tune_noid.png"), full_page=True)
            sys.exit(3)

        found = None
        deadline = time.time() + args.timeout_min * 60
        i = 0
        while time.time() < deadline and not found:
            i += 1
            for txt in list(history):
                try:
                    data = json.loads(txt)
                except Exception:
                    continue
                for rec in (data.get("data") or []):
                    try:
                        pid = json.loads(rec.get("promptResponse") or "{}").get("prompt_id")
                    except Exception:
                        pid = None
                    if pid == task_id:
                        found = rec.get("fileUrl")
            log(f"  轮询 {i}: 命中={'有' if found else '无'} | history={len(history)}")
            if found:
                break
            if i % 3 == 1:
                try:
                    page.reload(timeout=60000)
                    page.wait_for_timeout(6000)
                    el = page.locator("text=我的生成").first
                    if el.count():
                        el.click(timeout=8000)
                        page.wait_for_timeout(7000)
                except Exception:
                    pass
            page.wait_for_timeout(30000)

        info = bill_row(page, task_id)
        log("账单行：" + json.dumps(info, ensure_ascii=False))

    row = {"tag": args.tag, "webapp": args.webapp, "task": task_id, **info}
    if found:
        urllib.request.urlretrieve(found, out_path)
        size = os.path.getsize(out_path) / 1024 / 1024
        log(f"已下载 → {out_path}（{size:.2f} MB）")
        a = audit(out_path)
        row.update(a)
        row["file"] = os.path.basename(out_path)
        row["mb"] = round(size, 2)
        if a.get("frames"):
            row["coins_per_sec"] = round(float(row.get("bill_coins") or 0) / max(a["seconds"], 0.1), 3)
    else:
        row["file"] = "未拿到产出"

    new = not os.path.exists(CSV)
    with open(CSV, "a", newline="", encoding="utf-8-sig") as fh:
        w = csv.DictWriter(fh, fieldnames=list(row.keys()))
        if new:
            w.writeheader()
        w.writerow(row)
    print("=== 本轮结果 ===")
    print(json.dumps(row, ensure_ascii=False, indent=2))
    print("已追加到 " + CSV)


if __name__ == "__main__":
    main()
