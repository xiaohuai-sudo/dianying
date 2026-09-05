"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useBoards } from "./BoardProvider";

const links = [
  ["/explore", "探索"], ["/visual-index", "视觉索引"], ["/films", "电影"], ["/topics", "专题"], ["/boards", "灵感板"], ["/about", "关于"],
];

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { totalSaved, hydrated } = useBoards();
  return <header className="sticky top-0 z-50 border-b border-line/80 bg-ink/90 backdrop-blur-xl">
    <div className="site-container flex h-16 items-center justify-between">
      <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
        <span className="grid h-8 w-8 place-items-center border border-gold/60 text-sm text-gold transition-colors group-hover:bg-gold group-hover:text-ink">間</span>
        <span className="font-serif text-xl tracking-[.22em] text-paper">镜间</span>
      </Link>
      <button type="button" aria-expanded={open} aria-label="打开导航" onClick={() => setOpen(!open)} className="rounded-sm border border-line px-3 py-2 text-sm text-paper md:hidden">{open ? "关闭" : "菜单"}</button>
      <nav aria-label="主导航" className={`${open ? "flex" : "hidden"} absolute left-0 top-16 w-full flex-col border-b border-line bg-ink p-5 md:static md:flex md:w-auto md:flex-row md:border-0 md:bg-transparent md:p-0`}>
        {links.map(([href, label]) => {
          const active = href === "/" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-link ${active ? "text-paper" : "text-muted"}`}>
            {label}{href === "/boards" && hydrated && totalSaved > 0 ? <span className="ml-1 text-gold">{totalSaved}</span> : null}
          </Link>;
        })}
      </nav>
    </div>
  </header>;
}
