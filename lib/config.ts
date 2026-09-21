export const SITE = {
  name: "镜间",
  englishName: "Jingjian",
  description: "中文电影视觉语言与美学分析平台",
  tagline: "从一帧画面，读懂电影的视觉语言。",
  rightsEmail: process.env.NEXT_PUBLIC_RIGHTS_EMAIL || "rights@jingjian.example",
  year: 2026,
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://xiaohuai-sudo.github.io").replace(/\/$/, ""),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  ogImage: "/images/frames-optimized/teahouse-window-1280.webp",
};

export const IS_PLACEHOLDER_EMAIL = SITE.rightsEmail.endsWith(".example");

/** Absolute URL for metadata that crawlers and social cards require to be fully qualified. */
export const absoluteUrl = (path: string) => `${SITE.url}${SITE.basePath}${path.startsWith("/") ? path : `/${path}`}`;
