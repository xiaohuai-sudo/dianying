"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { copy, isLocale, withLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

interface CompareContextValue {
  frameIds: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

function localeFromPath(pathname: string): Locale {
  const candidate = pathname.split("/")[1];
  return isLocale(candidate) ? candidate : "zh";
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [frameIds, setFrameIds] = useState<string[]>([]);
  const locale = localeFromPath(pathname);

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("frames")?.split(",").filter(Boolean).slice(0, 4) ?? [];
    const timer = window.setTimeout(() => setFrameIds(next), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const update = useCallback((ids: string[]) => {
    setFrameIds(ids);
    const params = new URLSearchParams(window.location.search);
    if (ids.length) params.set("frames", ids.join(",")); else params.delete("frames");
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [pathname, router]);

  const toggle = useCallback((id: string) => {
    if (frameIds.includes(id)) update(frameIds.filter((item) => item !== id));
    else if (frameIds.length < 4) update([...frameIds, id]);
  }, [frameIds, update]);

  const clear = useCallback(() => update([]), [update]);
  const value = useMemo(() => ({ frameIds, has: (id: string) => frameIds.includes(id), toggle, clear }), [frameIds, toggle, clear]);

  return <CompareContext.Provider value={value}>{children}{frameIds.length > 0 && !pathname.includes("/compare") && <div className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center justify-between gap-4 border border-gold/60 bg-ink/95 px-4 py-3 shadow-2xl backdrop-blur" role="status"><div><p className="text-xs text-gold">{locale === "zh" ? "画面对比" : "FRAME COMPARISON"}</p><p className="text-sm text-paper">{frameIds.length}/4 {locale === "zh" ? "张已选择" : "selected"}</p></div><div className="flex items-center gap-2"><button type="button" onClick={clear} className="min-h-11 px-3 text-xs text-muted hover:text-paper">{copy[locale].clear}</button><Link href={`${withLocale(locale, "/compare")}?frames=${frameIds.join(",")}`} className="button-primary px-4">{copy[locale].compareNow}</Link></div></div>}</CompareContext.Provider>;
}

export function useCompare() {
  const value = useContext(CompareContext);
  if (!value) throw new Error("useCompare must be used inside CompareProvider");
  return value;
}

export function CompareButton({ frameId, compact = false }: { frameId: string; compact?: boolean }) {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);
  const { has, toggle, frameIds } = useCompare();
  const active = has(frameId);
  const disabled = !active && frameIds.length >= 4;
  return <button type="button" disabled={disabled} aria-pressed={active} onClick={() => toggle(frameId)} className={compact ? `grid h-10 w-10 place-items-center rounded-full border bg-ink/80 text-lg backdrop-blur ${active ? "border-gold text-gold" : "border-white/20 text-paper"}` : "button-secondary"} aria-label={active ? copy[locale].removeCompare : copy[locale].compare} title={active ? copy[locale].removeCompare : copy[locale].compare}>{active ? "✓" : "＋"}{!compact && <span>{active ? copy[locale].removeCompare : copy[locale].compare}</span>}</button>;
}
