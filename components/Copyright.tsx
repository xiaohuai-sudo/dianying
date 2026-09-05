import Link from "next/link";
import type { CopyrightInfo, Locale } from "@/lib/types";
import { withLocale } from "@/lib/i18n";

export function CopyrightBadge({ info, locale = "zh" }: { info: CopyrightInfo; locale?: Locale }) {
  return <span className="inline-flex items-center gap-1 border border-gold/30 bg-ink/70 px-2 py-1 text-[11px] text-gold"><span className="h-1.5 w-1.5 rounded-full bg-gold" />{locale === "zh" ? info.copyrightStatus : "Jingjian Original"}</span>;
}

export function CopyrightLine({ info, locale = "zh" }: { info: CopyrightInfo; locale?: Locale }) {
  return <p className="mt-3 text-xs leading-5 text-muted">{locale === "zh" ? `图片：${info.author} · © 2026 镜间 · ${info.licenseType}` : "Image: Jingjian Visual Lab · © 2026 Jingjian · Internal demonstration license"}</p>;
}

export function CopyrightPanel({ info, locale = "zh" }: { info: CopyrightInfo; locale?: Locale }) {
  const rows = locale === "zh" ? [
    ["图片标题", info.imageTitle], ["图片作者", info.author], ["权利人", info.rightsHolder], ["来源类型", info.sourceType], ["授权类型", info.licenseType], ["版权状态", info.copyrightStatus], ["使用范围", info.usageScope], ["是否允许下载", info.allowDownload ? "允许" : "不允许"], ["授权记录", info.proofNote], ["添加日期", info.addedDate], ["审核状态", info.reviewStatus],
  ] : [
    ["Image title", info.imageTitle], ["Image author", "Jingjian Visual Lab"], ["Rights holder", "Jingjian demonstration project"], ["Source type", "Jingjian original demonstration asset"], ["License", "Internal demonstration license"], ["Copyright status", "Jingjian Original"], ["Permitted use", "Jingjian interface demonstration and visual analysis only; no commercial asset license is granted"], ["Download", "Not permitted"], ["Rights record", info.proofNote], ["Added", info.addedDate], ["Review", "Approved"],
  ];
  return <aside className="border border-line bg-panel p-5 sm:p-7" aria-labelledby="copyright-title">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="copyright-title" className="font-serif text-xl text-paper">{locale === "zh" ? "图片版权信息" : "Image rights information"}</h2><CopyrightBadge info={info} locale={locale} /></div>
    <dl className="mt-6 divide-y divide-line">{rows.map(([label, value]) => <div key={label} className="grid gap-1 py-3 text-sm sm:grid-cols-[8rem_1fr]"><dt className="text-muted">{label}</dt><dd className="leading-6 text-paper">{value}</dd></div>)}</dl>
    <div className="mt-5 flex flex-wrap items-center gap-4 text-sm"><Link href={withLocale(locale, "/copyright#original-demo-assets")} className="text-gold underline decoration-gold/30 underline-offset-4">{locale === "zh" ? "查看来源说明" : "View source statement"}</Link><Link href={withLocale(locale, "/rights")} className="text-paper underline decoration-line underline-offset-4">{locale === "zh" ? "报告版权问题" : "Report a rights concern"}</Link></div>
  </aside>;
}
