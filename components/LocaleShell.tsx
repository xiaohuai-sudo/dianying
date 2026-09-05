"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { copy, isLocale, localeName, navPaths, otherLocale, withLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { useBoards } from "./BoardProvider";

function getLocale(pathname: string): Locale { const value = pathname.split("/")[1]; return isLocale(value) ? value : "zh"; }

export function LocaleShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = getLocale(pathname);
  const targetLocale = otherLocale(locale);
  const [open, setOpen] = useState(false);
  const { totalSaved } = useBoards();

  const switchLanguage = () => {
    const nextPath = pathname.match(/^\/(zh|en)(\/|$)/) ? pathname.replace(/^\/(zh|en)/, `/${targetLocale}`) : withLocale(targetLocale, pathname);
    window.localStorage.setItem("jingjian-locale", targetLocale);
    setOpen(false);
    router.push(`${nextPath}${window.location.search}`);
  };

  return <>
    <a href="#main-content" className="sr-only z-[100] bg-gold px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">{copy[locale].skip}</a>
    <header className="sticky top-0 z-40 border-b border-line bg-ink/95 backdrop-blur"><div className="site-container flex h-16 items-center justify-between"><Link href={withLocale(locale)} onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-3 font-serif text-xl" aria-label={locale === "zh" ? "镜间首页" : "Jingjian home"}><span className="grid h-8 w-8 place-items-center border border-gold/60 text-xs text-gold">間</span><span>{locale === "zh" ? "镜间" : "Jingjian"}</span></Link><div className="flex items-center gap-2"><button type="button" onClick={switchLanguage} className="min-h-11 border border-line px-3 text-xs text-gold hover:border-gold" aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}>{localeName(locale)} / {localeName(targetLocale)}</button><button type="button" aria-expanded={open} aria-label={open ? copy[locale].close : copy[locale].menu} onClick={() => setOpen(!open)} className="button-secondary min-h-11 px-3 md:hidden">{open ? copy[locale].close : copy[locale].menu}</button><nav aria-label={locale === "zh" ? "主导航" : "Primary navigation"} className={`${open ? "flex" : "hidden"} absolute left-0 top-16 w-full flex-col border-b border-line bg-ink p-5 md:static md:flex md:w-auto md:flex-row md:border-0 md:bg-transparent md:p-0`}>{navPaths.map((path, index) => <Link key={path} href={withLocale(locale, path)} onClick={() => setOpen(false)} className={`nav-link ${pathname.startsWith(withLocale(locale, path)) ? "text-paper" : "text-[#aaa8a2]"}`}>{copy[locale].nav[index]}{path === "/boards" && totalSaved > 0 ? ` ${totalSaved}` : ""}</Link>)}</nav></div></div></header>
    <main id="main-content">{children}</main>
    <footer className="border-t border-line bg-[#0a0c0f]"><div className="site-container py-10 text-sm text-muted"><div className="grid gap-8 md:grid-cols-[1fr_auto]"><div><p className="font-serif text-2xl text-paper">{locale === "zh" ? "镜间" : "Jingjian"}</p><p className="mt-3 max-w-xl leading-7">{locale === "zh" ? "镜间——中文电影视觉语言与美学分析平台。本项目不提供影视原片及未经授权的高清剧照下载。" : "A bilingual platform for reading cinematic visual language. No films or unauthorized high-resolution stills are offered for download."}</p></div><div className="grid grid-cols-2 gap-x-8 gap-y-3"><Link href={withLocale(locale, "/about")} className="hover:text-paper">{locale === "zh" ? "关于本站" : "About"}</Link><Link href={withLocale(locale, "/copyright")} className="hover:text-paper">{locale === "zh" ? "版权说明" : "Copyright"}</Link><Link href={withLocale(locale, "/rights")} className="hover:text-paper">{locale === "zh" ? "权利人联系" : "Rights contact"}</Link><Link href={withLocale(locale, "/explore")} className="hover:text-paper">{locale === "zh" ? "探索画面" : "Explore frames"}</Link></div></div><div className="mt-8 flex flex-col justify-between gap-2 border-t border-line pt-5 text-xs sm:flex-row"><span>© 2026 {locale === "zh" ? "镜间 · 原创文字与设计" : "Jingjian · Original writing and design"}</span><span>{locale === "zh" ? "演示邮箱：rights@jingjian.example（上线前替换）" : "Demo email: rights@jingjian.example (replace before launch)"}</span></div></div></footer>
  </>;
}
