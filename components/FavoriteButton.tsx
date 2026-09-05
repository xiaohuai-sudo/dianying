"use client";

import { useBoards } from "./BoardProvider";
import type { Locale } from "@/lib/types";

export function FavoriteButton({ frameId, compact = false, locale = "zh" }: { frameId: string; compact?: boolean; locale?: Locale }) {
  const { activeBoard, isInActiveBoard, toggleFrame, hydrated } = useBoards();
  const saved = hydrated && isInActiveBoard(frameId);
  const compactLabel = locale === "zh" ? (saved ? "取消收藏" : "收藏") : (saved ? "Remove from board" : "Save to board");
  const fullLabel = locale === "zh" ? (saved ? `已收藏至「${activeBoard.name}」` : `收藏到「${activeBoard.name}」`) : (saved ? `Saved to “${activeBoard.name}”` : `Save to “${activeBoard.name}”`);
  return <button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFrame(frameId); }} aria-pressed={saved} title={hydrated ? compactLabel : (locale === "zh" ? "正在读取收藏" : "Loading saved frames")} className={compact ? `favorite-icon ${saved ? "is-saved" : ""}` : `button-secondary ${saved ? "border-gold text-gold" : ""}`}>
    <span aria-hidden="true">{saved ? "♥" : "♡"}</span>{compact ? <span className="sr-only">{compactLabel}</span> : <span>{fullLabel}</span>}
  </button>;
}
