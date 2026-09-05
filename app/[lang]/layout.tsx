import { notFound } from "next/navigation";
import { isLocale, locales } from "@/lib/i18n";
import { HtmlLocaleSync } from "@/components/HtmlLocaleSync";

export function generateStaticParams() { return locales.map((lang) => ({ lang })); }

export default async function LanguageLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <><HtmlLocaleSync locale={lang} />{children}</>;
}
