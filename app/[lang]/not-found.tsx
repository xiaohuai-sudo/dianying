"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLocale, withLocale } from "@/lib/i18n";

export default function LocalizedNotFound() {
  const value = usePathname().split("/")[1];
  const locale = isLocale(value) ? value : "zh";
  return <div className="site-container grid min-h-[60vh] place-items-center py-20 text-center"><div><p className="section-kicker">404 · FRAME NOT FOUND</p><h1 className="font-serif text-4xl sm:text-6xl">{locale === "zh" ? "这一帧不在放映中" : "This frame is not screening"}</h1><p className="mt-5 text-sm text-muted">{locale === "zh" ? "页面可能已移动，或内容仍在版权审核中。" : "The page may have moved, or the content may still be under rights review."}</p><div className="mt-8 flex justify-center gap-4"><Link href={withLocale(locale)} className="button-secondary">{locale === "zh" ? "返回首页" : "Home"}</Link><Link href={withLocale(locale, "/explore")} className="button-primary">{locale === "zh" ? "探索画面" : "Explore frames"}</Link></div></div></div>;
}
