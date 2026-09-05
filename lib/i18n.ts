import type { Film, Frame, FrameAnnotation, FrameReading, Locale, Topic } from "./types";

export const locales: Locale[] = ["zh", "en"];
export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);
export const otherLocale = (locale: Locale): Locale => locale === "zh" ? "en" : "zh";
export const localeName = (locale: Locale) => locale === "zh" ? "中" : "EN";

export const copy = {
  zh: {
    nav: ["探索", "视觉索引", "电影", "专题", "灵感板", "关于"],
    menu: "菜单", close: "关闭", skip: "跳到正文", original: "本站原创", compare: "加入对比",
    removeCompare: "移出对比", compareNow: "开始对比", clear: "清除", loadMore: "加载更多",
    favorite: "收藏", search: "搜索画面、技法或情绪", filters: "筛选条件", results: "个画面",
  },
  en: {
    nav: ["Explore", "Visual Index", "Films", "Topics", "Boards", "About"],
    menu: "Menu", close: "Close", skip: "Skip to content", original: "Jingjian Original", compare: "Add to compare",
    removeCompare: "Remove", compareNow: "Compare frames", clear: "Clear", loadMore: "Load more",
    favorite: "Save", search: "Search frames, techniques or moods", filters: "Filters", results: "frames",
  },
} as const;

export const navPaths = ["/explore", "/visual-index", "/films", "/topics", "/boards", "/about"];
export const withLocale = (locale: Locale, path = "/") => `/${locale}${path === "/" ? "" : path}`;

const tagEnglish: Record<string, string> = {
  "暖黄": "Warm amber", "冷蓝": "Cool blue", "红色": "Red", "绿色": "Green", "黑白": "Monochrome", "低饱和": "Low saturation", "高对比": "High contrast",
  "中心": "Centered", "对称": "Symmetry", "三分法": "Rule of thirds", "框架": "Frame within frame", "留白": "Negative space", "纵深": "Depth", "倾斜": "Diagonal",
  "特写": "Close-up", "近景": "Medium close-up", "中景": "Medium shot", "全景": "Wide shot", "远景": "Long shot",
  "自然光": "Natural light", "侧光": "Side light", "逆光": "Backlight", "轮廓光": "Rim light", "霓虹": "Neon", "烛光": "Candlelight", "低调光": "Low-key light",
  "街道": "Street", "卧室": "Bedroom", "茶馆": "Teahouse", "餐厅": "Dining room", "车站": "Station", "列车": "Train", "汽车": "Car", "雨夜": "Rainy night", "自然景观": "Landscape", "放映厅": "Screening room",
  "孤独": "Solitude", "浪漫": "Romance", "温暖": "Tenderness", "压抑": "Oppression", "神秘": "Mystery", "怀旧": "Nostalgia", "紧张": "Tension",
  "清晨": "Dawn", "白天": "Day", "黄昏": "Dusk", "夜晚": "Night", "中国南方": "Southern China", "中国东部": "Eastern China", "中国北方": "Northern China", "中国沿海": "Coastal China", "中国西南": "Southwest China", "中国内陆": "Inland China",
  "2010年代": "2010s", "2020年代": "2020s",
};

export const displayTag = (value: string, locale: Locale) => locale === "zh" ? value : (tagEnglish[value.replace("（虚构）", "")] ?? value.replace("（虚构）", " (fictional)"));

const wordMap: Record<string, string> = {
  teahouse: "Teahouse", lane: "Lane", train: "Train", summer: "Summer", hill: "Hill City", cinema: "Cinema",
  window: "Window", rain: "Rain", door: "Door", screen: "Screen", light: "Light", shadow: "Shadow", evening: "Evening", morning: "Morning",
  tea: "Tea", cup: "Cup", cups: "Cups", table: "Table", letter: "Letter", stairs: "Stairs", station: "Station", platform: "Platform",
  roof: "Roof", rooftop: "Rooftop", water: "Water", garden: "Garden", street: "Street", bridge: "Bridge", river: "River", ferry: "Ferry",
  chair: "Chair", chairs: "Chairs", corridor: "Corridor", kitchen: "Kitchen", lantern: "Lantern", phone: "Phone", booth: "Booth",
  clock: "Clock", aisle: "Aisle", fan: "Fan", fog: "Fog", projector: "Projector", seats: "Seats", archive: "Archive",
};

export function englishFrameTitle(frame: Frame) {
  return frame.slug.split("-").map((word) => wordMap[word] ?? `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ");
}

const englishFilms: Record<string, Pick<Film, "synopsis" | "visualStyle" | "compositionNotes" | "lightingNotes">> = {
  "southern-teahouse": { synopsis: "On the final day of a riverside teahouse, three old acquaintances learn to read one another again through rain, steam and unfinished gestures.", visualStyle: "Muted amber is held against wet blue-green. Windows, bamboo blinds and screens repeatedly divide the figures, keeping intimacy behind a visible threshold.", compositionNotes: "Frames within frames, deep staging and thirds form the central grammar; spatial layers carry more narrative weight than overt action.", lightingNotes: "Soft overcast window light fills the room while tungsten bulbs and the tea stove create small warm islands." },
  "after-the-rain-lane": { synopsis: "After a night shift, an umbrella repairer crosses the old city in search of a letter that was never sent.", visualStyle: "Cool blue ambient light wraps the wet street while red-orange signs briefly enter at the edge. Reflections make the lane feel like an unreliable memory.", compositionNotes: "Long-lens compression, occlusion and directional negative space turn hesitation into distance.", lightingNotes: "Neon, backlight and rim light reveal the rain; wet pavement creates a second path of illumination." },
  "night-train": { synopsis: "On a slow train toward the border, strangers exchange secrets during a ten-minute blackout.", visualStyle: "Fluorescent green and deep exterior blue alternate across repetitive seats and unstable window reflections.", compositionNotes: "Symmetry, depth and internal frames direct the eye toward a destination that remains unseen.", lightingNotes: "Low-key lighting is interrupted by moving window light; the blackout preserves only thin contours." },
  "humid-summer": { synopsis: "During a summer of power cuts, two young people record sounds that are disappearing from a coastal town.", visualStyle: "Faded greens, sun-bleached surfaces and warm skin tones give the heat a tactile presence.", compositionNotes: "Thirds and broad negative space keep the figures near architectural edges and the balance gently unsettled.", lightingNotes: "Strong daylight is filtered through curtains, leaves and humidity, moving from hard noon to tender dusk." },
  "letters-from-hill-city": { synopsis: "A postman climbs a layered hill city each day to deliver letters addressed to the future.", visualStyle: "Fog grey and brick red meet across stairs, ramps and wires that turn the city into a complex cross-section.", compositionNotes: "Diagonals, depth and vertical displacement continually reduce the figure against the built landscape.", lightingNotes: "Morning fog dissolves boundaries; evening side light restores the rough surface of walls." },
  "empty-cinema": { synopsis: "On the night before a cinema is demolished, an aging projectionist screens one final unnamed reel for empty seats.", visualStyle: "Dark red seats, golden dust and deep black space create a restrained theatrical solemnity.", compositionNotes: "Symmetry and repetition establish ritual, while empty intervals make absence visible.", lightingNotes: "The projector beam, rather than the screen, becomes the emotional source of light." },
};

export const localizeFilm = (film: Film, locale: Locale): Film => locale === "zh" ? film : ({ ...film, title: film.englishTitle, region: displayTag(film.region, locale), director: romanizeName(film.director), cinematographer: romanizeName(film.cinematographer), ...englishFilms[film.slug] });

const surnames: Record<string, string> = { "林": "Lin", "周": "Zhou", "许": "Xu", "程": "Cheng", "高": "Gao", "沈": "Shen", "唐": "Tang", "季": "Ji", "顾": "Gu", "罗": "Luo", "叶": "Ye", "白": "Bai", "梁": "Liang" };
export function romanizeName(name: string) { return `${surnames[name[0]] ?? name[0]} ${name.slice(1)}`; }

const topicEnglish: Record<string, { title: string; excerpt: string; category: string }> = {
  "warm-yellow": { title: "Why Warm Amber Is Not Always Warm", excerpt: "Color temperature is only the beginning. Separation, luminance and human distance decide whether amber becomes intimacy, age or confinement.", category: "Color" },
  "framing-relationships": { title: "How Frames Describe Relationships", excerpt: "Doors, windows and reflections turn invisible emotional boundaries into visible structure.", category: "Composition" },
  "rain-night-light": { title: "Five Lighting Strategies for Rain at Night", excerpt: "Rain becomes legible through backlight, reflection, color-temperature layers and controlled haze.", category: "Light" },
  "teahouse-space": { title: "Everyday Life Inside a Teahouse", excerpt: "Tables, screens, steam and circulation turn a familiar room into a dense field of relationships.", category: "Space" },
  "negative-space": { title: "How Negative Space Creates Solitude", excerpt: "Emptiness matters when a figure faces a region without reply, scale or a clear exit.", category: "Composition" },
  "red-danger": { title: "Danger and Desire in Cinematic Red", excerpt: "Position, area and material allow red to attract the eye and warn it at the same time.", category: "Color" },
  "centered-composition": { title: "Beyond Stability: The Centered Frame", excerpt: "A centered subject may feel calm, ceremonial or trapped; the surrounding space decides which reading wins.", category: "Composition" },
  "depth-and-blocking": { title: "Depth as a Path into the Image", excerpt: "Foreground, middle ground and background organize the time it takes the eye to reach a subject.", category: "Space" },
  "natural-light-time": { title: "How Natural Light Lets Time Enter the Story", excerpt: "Dawn, noon, overcast weather and dusk change boundaries, movement and the felt duration of a scene.", category: "Light" },
  "low-key-information": { title: "Low-key Lighting as Information Control", excerpt: "Purposeful darkness still has layers and direction. Its job is to decide what the audience may know now.", category: "Light" },
  "close-up-without-dialogue": { title: "When a Close-up Speaks Better Than Dialogue", excerpt: "A close-up becomes meaningful only when texture, action and the surrounding shots prepare its information.", category: "Shot Size" },
  "warm-cool-attention": { title: "Organizing Attention with Warm–Cool Contrast", excerpt: "Color contrast is most useful when it assigns figures, spaces and times to distinct temperature zones.", category: "Color" },
};

export function localizeTopic(topic: Topic, locale: Locale): Topic & { category: string } {
  if (locale === "zh") return { ...topic, category: topicEnglish[topic.slug]?.category ?? "视觉语言" };
  const meta = topicEnglish[topic.slug];
  return {
    ...topic,
    title: meta?.title ?? topic.slug,
    excerpt: meta?.excerpt ?? topic.excerpt,
    author: topic.author === "镜间编辑部" ? "Jingjian Editorial" : romanizeName(topic.author),
    readTime: topic.readTime.replace("分钟", "min read"),
    category: meta?.category ?? "Visual Language",
    sections: topic.sections.map((section, index) => ({
      ...section,
      heading: index === 0 ? "Start with the visual decision" : index === 1 ? "Read the relationship inside the frame" : "Translate the idea into practice",
      paragraphs: section.paragraphs.map((_, paragraphIndex) => `${meta?.title ?? "This visual strategy"} becomes useful when form is read as a sequence rather than a label. ${section.frameId ? `In the example “${section.frameId.split("-").map((w) => wordMap[w] ?? w).join(" ")}”, ` : ""}${paragraphIndex ? "Compare what changes when the same device is repeated: " : "Look first at where attention enters the image, then ask "}how color, distance, light and the surrounding negative space decide what is revealed, delayed or left unanswered.`),
    })),
  };
}

const firstSentence = (text: string) => text.split(/[。！？]/)[0];
const hash = (value: string) => [...value].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7);

export function buildAnnotations(frame: Frame): FrameAnnotation[] {
  const seed = hash(frame.slug);
  const focusX = 30 + seed % 41;
  const focusY = 30 + Math.floor(seed / 17) % 41;
  const localized = (zh: string, en: string) => ({ zh, en });
  const annotations: FrameAnnotation[] = [
    { id: `${frame.slug}-focus`, kind: "focus", label: localized(`视觉重心：${frame.visualFocus}`, `Primary point of attention in ${englishFrameTitle(frame)}`), x: focusX, y: focusY },
    { id: `${frame.slug}-light`, kind: "light", label: localized(`主光：${frame.lightDirection}`, `Key light: ${displayTag(frame.lights[0], "en")}`), x: seed % 2 ? 8 : 92, y: 12 + seed % 25, x2: focusX, y2: focusY },
    { id: `${frame.slug}-subject`, kind: "subject", label: localized(`人物位置：${frame.subjectPosition}`, `Figure placement and relational distance`), x: Math.max(8, focusX - 12), y: Math.max(8, focusY - 16), width: 24, height: 34 },
  ];
  if (frame.compositions.includes("三分法")) annotations.push({ id: `${frame.slug}-thirds`, kind: "thirds", label: localized("三分线与交点", "Rule-of-thirds grid"), x: 0, y: 0 });
  if (frame.compositions.some((item) => item === "中心" || item === "对称")) annotations.push({ id: `${frame.slug}-center`, kind: "center", label: localized("中心轴线", "Central axis"), x: 50, y: 0 });
  if (frame.compositions.includes("框架")) annotations.push({ id: `${frame.slug}-frame`, kind: "frame", label: localized("画内框架", "Frame within the frame"), x: 13, y: 12, width: 74, height: 75 });
  if (frame.compositions.includes("纵深")) annotations.push({ id: `${frame.slug}-depth`, kind: "depth", label: localized("纵深引导线", "Depth and leading lines"), x: 8, y: 92, x2: focusX, y2: focusY });
  if (frame.compositions.includes("留白")) annotations.push({ id: `${frame.slug}-negative`, kind: "negative", label: localized("关系性留白", "Relational negative space"), x: focusX > 50 ? 5 : 58, y: 10, width: 37, height: 72 });
  return annotations;
}

export function frameReading(frame: Frame, locale: Locale): FrameReading {
  const enTitle = englishFrameTitle(frame);
  const composition = frame.compositions.map((item) => displayTag(item, "en")).join(" and ");
  const lights = frame.lights.map((item) => displayTag(item, "en")).join(" with ");
  if (locale === "en") return {
    title: enTitle,
    alt: `Original staged cinematic frame titled “${enTitle}”; no identifiable real performer appears.`,
    summary: `${enTitle} organizes attention through ${composition.toLowerCase()}, ${lights.toLowerCase()} and a ${displayTag(frame.shotSize, "en").toLowerCase()} viewing distance.`,
    techniqueIntent: `The frame places its primary visual emphasis around “${enTitle}”. ${composition} controls the route of the eye, while ${lights.toLowerCase()} separates visible action from information held back in shadow.`,
    narrativeEffect: `Rather than using atmosphere as decoration, the image turns ${displayTag(frame.moods[0], "en").toLowerCase()} into a spatial condition. Distance, interruption and the relative weight of the environment allow an ordinary gesture to suggest what happened before and what may remain unresolved afterward.`,
    watchFor: `Begin with the figure placement, follow the strongest line toward the visual focus, then compare the warm and cool areas at the edge of the action.`,
    creationNotes: [`Block the scene with ${composition.toLowerCase()} before adding color.`, `Motivate the key from the ${seedDirection(frame)} and preserve readable shadow detail.`, `Pair this ${displayTag(frame.shotSize, "en").toLowerCase()} with a contrasting distance to test how intimacy changes.`],
    questions: [`If ${displayTag(frame.compositions[0], "en").toLowerCase()} were removed, would the figures feel closer or farther apart?`, `Would the emotional reading survive if the dominant palette became its complement?`, `What off-screen sound would support—or contradict—the current visual rhythm?`],
    annotations: buildAnnotations(frame),
  };
  return {
    title: frame.title,
    alt: frame.alt,
    summary: `${firstSentence(frame.analysis)}。画面以“${frame.visualFocus}”组织第一层注意力。`,
    techniqueIntent: `摄影机没有把“${frame.title}”处理成孤立的漂亮瞬间，而是用${frame.compositions.join("与")}安排视线抵达“${frame.visualFocus}”的路径。${frame.lights.join("与")}决定了动作中哪些部分先被看见。`,
    narrativeEffect: `${firstSentence(frame.analysis)}。人物与环境的面积差、明暗边界和动作方向共同把“${frame.moods.join("、")}”变成可感知的空间关系，使这一帧既保留前因，也留下尚未完成的余韵。`,
    watchFor: `先确认${frame.subjectPosition}，再沿${frame.compositions[0]}形成的方向寻找“${frame.visualFocus}”，最后比较${frame.lightDirection}带来的亮部与暗部。`,
    creationNotes: [`先以黑白块面建立${frame.compositions.join("＋")}的空间关系，再加入色彩。`, `从${frame.lightDirection}建立主光，并保持“${frame.lightQuality}”的暗部逻辑。`, `将这个${frame.shotSize}与不同观看距离的镜头配对，比较人物关系如何改变。`],
    questions: [`如果移除“${frame.compositions[0]}”，人物关系会更亲近还是更疏远？`, `如果主色改为互补色，“${frame.moods.join("、")}”是否仍然成立？`, `画外最可能存在什么声音，它会支持还是反驳当前情绪？`],
    annotations: buildAnnotations(frame),
  };
}

function seedDirection(frame: Frame) { return hash(frame.slug) % 2 ? "camera-left side" : "camera-right side"; }

export function similarityReason(a: Frame, b: Frame, locale: Locale) {
  const common = [...a.compositions, ...a.lights, ...a.colors].filter((item, index, all) => all.indexOf(item) === index && [...b.compositions, ...b.lights, ...b.colors].includes(item)).slice(0, 2);
  if (!common.length) return locale === "zh" ? "共享相近的空间情绪" : "A related spatial mood";
  return locale === "zh" ? `同为${common.join("＋")}` : `Shared ${common.map((item) => displayTag(item, locale)).join(" + ")}`;
}
