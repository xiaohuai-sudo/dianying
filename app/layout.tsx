import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BoardProvider } from "@/components/BoardProvider";
import { SITE, absoluteUrl } from "@/lib/config";
import { LocaleShell } from "@/components/LocaleShell";
import { CompareProvider } from "@/components/CompareProvider";

export const metadata: Metadata = {
  title: `${SITE.name}｜电影视觉语言与美学分析`,
  description: SITE.tagline,
  applicationName: `${SITE.name} ${SITE.englishName}`,
  keywords: ["电影视觉语言", "电影美学", "画面分析", "色彩分析", "构图", "光影", "cinematic visual language", "film aesthetics", "frame analysis"],
  authors: [{ name: "镜间编辑部" }],
  creator: "镜间视觉实验室",
  publisher: "镜间",
  category: "education",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: `${SITE.name} ${SITE.englishName}`,
    title: `${SITE.name}｜电影视觉语言与美学分析`,
    description: SITE.tagline,
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    images: [{ url: absoluteUrl(SITE.ogImage), width: 1280, height: 720, alt: "镜间｜电影视觉语言与美学分析" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}｜电影视觉语言与美学分析`,
    description: SITE.tagline,
    images: [absoluteUrl(SITE.ogImage)],
  },
};

export const viewport: Viewport = { colorScheme: "dark", themeColor: "#0D0F12" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" suppressHydrationWarning data-scroll-behavior="smooth"><body><BoardProvider><CompareProvider><LocaleShell>{children}</LocaleShell></CompareProvider></BoardProvider></body></html>;
}
