import Link from "next/link";
import { IS_PLACEHOLDER_EMAIL, SITE } from "@/lib/config";

export function Footer() {
  return <footer className="mt-24 border-t border-line bg-[#0a0c0e]">
    <div className="site-container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr]">
      <div>
        <p className="font-serif text-xl tracking-widest text-paper">镜间</p>
        <p className="mt-3 text-sm text-muted">镜间——中文电影视觉语言与美学分析平台</p>
        <p className="mt-2 max-w-xl text-sm leading-7 text-muted">本站不提供影视原片及未经授权的高清剧照下载。当前所有作品和画面均为展示网站功能而创作的虚构内容。</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-muted">
        <Link href="/about" className="hover:text-paper">关于本站</Link><Link href="/copyright" className="hover:text-paper">版权说明</Link>
        <Link href="/visual-index" className="hover:text-paper">视觉索引</Link><Link href="/topics" className="hover:text-paper">美学专题</Link>
        <Link href="/rights" className="hover:text-paper">权利人联系</Link><Link href="/explore" className="hover:text-paper">探索画面</Link>
      </div>
    </div>
    <div className="border-t border-line py-5">
      <div className="site-container flex flex-col justify-between gap-2 text-xs text-muted sm:flex-row">
        <span>© {SITE.year} 镜间 · 原创文字与设计</span>
        {IS_PLACEHOLDER_EMAIL ? <span className="text-gold">演示邮箱：{SITE.rightsEmail}（上线前替换）</span> : <span>{SITE.rightsEmail}</span>}
      </div>
    </div>
  </footer>;
}
