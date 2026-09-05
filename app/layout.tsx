import type { Metadata } from "next";
import "./globals.css";
import { BoardProvider } from "@/components/BoardProvider";
import { SITE } from "@/lib/config";
import { LocaleShell } from "@/components/LocaleShell";
import { CompareProvider } from "@/components/CompareProvider";

export const metadata: Metadata = {
  title: `${SITE.name}｜电影视觉语言与美学分析`,
  description: SITE.tagline,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" suppressHydrationWarning data-scroll-behavior="smooth"><body><BoardProvider><CompareProvider><LocaleShell>{children}</LocaleShell></CompareProvider></BoardProvider></body></html>;
}
