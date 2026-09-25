"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type NavItem = { href: string; title: string };

/**
 * 帧页的连续浏览控件：
 *  - ← / → 键切换上一帧 / 下一帧（焦点在输入框时不拦截）
 *  - 手机左右滑动手势（横向位移 > 纵向位移才触发，避免干扰竖向滚动）
 *  - 底部常驻窄条：上一帧 / 序号 / 下一帧，键盘、鼠标、触摸都能用
 *  - 预取相邻两帧，切换近乎瞬时
 */
export function FrameNav({ prev, next, locale = "zh", position }: { prev: NavItem; next: NavItem; locale?: "zh" | "en"; position?: { index: number; total: number } }) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(prev.href);
    router.prefetch(next.href);
  }, [prev.href, next.href, router]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        router.push(prev.href);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        router.push(next.href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev.href, next.href, router]);

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startAt = 0;
    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startAt = Date.now();
    };
    const onEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Date.now() - startAt > 900) return;
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      router.push(dx < 0 ? next.href : prev.href);
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchend", onEnd);
    };
  }, [prev.href, next.href, router]);

  const prevLabel = locale === "zh" ? "上一帧" : "Previous";
  const nextLabel = locale === "zh" ? "下一帧" : "Next";
  const hint = locale === "zh" ? "按 ← → 键切换画面" : "Press ← → to move";

  return (
    <div className="sticky bottom-0 z-30 mt-12 border-t border-line bg-ink/95 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={prev.href}
          className="flex min-w-0 items-center gap-2 text-sm text-muted transition hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label={`${prevLabel}：${prev.title}`}
        >
          <span aria-hidden="true" className="text-gold">
            ←
          </span>
          <span className="hidden truncate sm:inline">{prev.title}</span>
          <span className="truncate sm:hidden">{prevLabel}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 text-xs text-muted">
          {position && (
            <span className="tabular-nums">
              {position.index} / {position.total}
            </span>
          )}
          <span aria-hidden="true" className="hidden text-line sm:inline">
            ·
          </span>
          <span className="hidden sm:inline">{hint}</span>
        </div>

        <Link
          href={next.href}
          className="flex min-w-0 items-center gap-2 text-sm text-muted transition hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label={`${nextLabel}：${next.title}`}
        >
          <span className="truncate sm:hidden">{nextLabel}</span>
          <span className="hidden truncate sm:inline">{next.title}</span>
          <span aria-hidden="true" className="text-gold">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
