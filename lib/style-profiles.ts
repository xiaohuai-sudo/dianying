/**
 * 导演 / 摄影指导风格档案（第一批 10 位）
 *
 * 两条设计原则：
 * 1) 只把「能被像素证明」的东西写成指纹（影调结构、明度跨度、饱和度、色温倾向）；
 *    构图、光位、景别、运动属于形式标签，用户勾选或由视觉模型判断，不假装能从色影调里读出来。
 * 2) 指纹是按「公开访谈与作品的通行描述」+「站内可代表该风格的画面实测值」共同标定的，
 *    scripts/studio/style-check.mts 会交叉验证：每位档案的代表画面必须排进自己的档案，
 *    排不进去就说明标定有问题，必须调整而不是含糊过去。
 *
 * 依据说明：以下均为公开资料与作品观察的整理，不代表本人言论，也不覆盖其全部作品。
 * 风格档案不使用任何真实影片剧照，示例一律指向本站原创演示画面。
 */

import type { ToneBandKey } from "./frame-features";

export interface FingerprintDimension {
  /** 中心值（阴影/亮部/跨度/饱和为百分比，色温为 −100 全冷 ~ +100 全暖） */
  center: number;
  /** 容差：距离 / 容差 = 归一化偏差，>1 记满分偏差 */
  tolerance: number;
  weight: number;
}

export interface StyleFingerprint {
  /** 阴影 + 暗部占比 % */
  shadow: FingerprintDimension;
  /** 亮部 + 高光占比 % */
  highlight: FingerprintDimension;
  /** 90 与 10 分位明度跨度 */
  spread: FingerprintDimension;
  /** 平均饱和度 % */
  saturation: FingerprintDimension;
  /** 色温倾向：暖色占比 − 冷色占比 */
  warmth: FingerprintDimension;
  /** 平均明度 %，权重最低，只用于判断画面整体曝光档位 */
  luma: FingerprintDimension;
}

export interface StyleForms {
  compositions: string[];
  lights: string[];
  shotSizes: string[];
  motions: string[];
}

export interface StyleProfile {
  slug: string;
  name: string;
  nameEn: string;
  role: "导演" | "摄影指导";
  region: "国际" | "东亚";
  /** 影调族：色影调只能稳定区分到这一层，族内的细分靠形式标签 */
  cluster: "低调冷" | "低调暖" | "高调" | "高饱和暖" | "混合色温霓虹";
  oneLine: string;
  fingerprint: StyleFingerprint;
  forms: StyleForms;
  advice: string[];
  pitfalls: string[];
  prompt: { image: string[]; motion: string[]; negative: string[] };
  exampleFrameIds: string[];
  basis: string;
}

const dimension = (center: number, tolerance: number, weight = 1): FingerprintDimension => ({ center, tolerance, weight });

/** 站内已有画面的波段标签名，供匹配时把标签映射到指纹解释 */
export const BAND_LABELS: Record<ToneBandKey, string> = { shadow: "阴影", dark: "暗部", midDark: "中暗", midLight: "中亮", light: "亮部", highlight: "高光" };

export const styleProfiles: StyleProfile[] = [
  {
    slug: "roger-deakins",
    name: "罗杰·狄金斯", nameEn: "Roger Deakins", role: "摄影指导", region: "国际", cluster: "低调冷",
    oneLine: "单一动机光源、低饱和、暗部保留可读层次；人物常在大空间里显得很小，光线几乎全部来自画内可信来源。",
    fingerprint: { shadow: dimension(45, 45, 1.2), highlight: dimension(14, 22, 0.8), spread: dimension(34, 40), saturation: dimension(20, 18, 1.2), warmth: dimension(-55, 60, 1.3), luma: dimension(16, 25, 0.4) },
    forms: { compositions: ["纵深", "留白", "三分法"], lights: ["自然光", "侧光", "低调光"], shotSizes: ["远景", "全景"], motions: ["缓慢横移", "固定机位长镜头"] },
    advice: ["把主光解释清楚：一个来源 + 环境反射，别叠第三种方向。", "压暗但不压死：暗部仍要能读出空间结构，而不是纯黑。", "让人物只占画面很小面积，用尺度而不是表情表达处境。"],
    pitfalls: ["误解为「自然光=不布光」：他的自然感来自极严格的动机与遮挡控制。", "只学低饱和，忽略他在冷环境里放的那块小面积暖色。"],
    prompt: {
      image: ["single motivated light source from a window or practical", "deep readable shadows, restrained desaturated palette", "figures small inside a wide spatial frame"],
      motion: ["非常缓慢的轨道横移，人物保持不动", "固定机位，让环境细节自行移动（雨、雾、水面）"],
      negative: ["多光源均匀打亮面部", "高饱和电影感滤镜", "夸张的光晕"],
    },
    exampleFrameIds: ["hill-fog", "train-platform", "lane-dawn", "teahouse-morning-steam"],
    basis: "公开访谈与作品观察整理；非本人言论。",
  },
  {
    slug: "emmanuel-lubezki",
    name: "艾曼努尔·卢贝兹基", nameEn: "Emmanuel Lubezki", role: "摄影指导", region: "国际", cluster: "高调",
    oneLine: "自然光优先、广角贴近人物、连续运镜；亮部敢过曝，让空气和光线成为画面的主体。",
    fingerprint: { shadow: dimension(22, 35, 1.2), highlight: dimension(36, 30, 0.8), spread: dimension(60, 35), saturation: dimension(23, 18, 1.2), warmth: dimension(45, 70, 1.3), luma: dimension(27, 22, 0.4) },
    forms: { compositions: ["三分法", "留白", "纵深"], lights: ["自然光", "逆光", "轮廓光"], shotSizes: ["特写", "全景"], motions: ["手持跟随", "连续长镜头"] },
    advice: ["先找到当下最强的自然光源，再把人物放进去，而不是先安排人物。", "允许高光溢出：亮部承载的是情绪，不是细节。", "用广角贴近人物，让动作既完整又有肌肉感。"],
    pitfalls: ["把「自然光」当成「不用测光」：他的曝光几乎全部押在最后一条亮部宽容度上。", "模仿长镜头却忽略调度：没有动作支撑的长镜头只是慢。"],
    prompt: {
      image: ["wide-angle close proximity to subject, natural daylight", "blown-out highlights, visible atmosphere and haze", "warm skin tones against ambient light"],
      motion: ["手持跟随人物行走，呼吸感明显", "单镜头连续运动，不切"],
      negative: ["密不透风的暗部", "冷硬的补光", "高对比硬阴影"],
    },
    exampleFrameIds: ["summer-seawall", "summer-arcade", "hill-cable-car"],
    basis: "公开访谈与作品观察整理；非本人言论。",
  },
  {
    slug: "hoyte-van-hoytema",
    name: "霍伊特·范·霍伊特玛", nameEn: "Hoyte van Hoytema", role: "摄影指导", region: "国际", cluster: "低调冷",
    oneLine: "大画幅与实拍质感、低饱和冷调、贴近人物皮肤的手持视角；空间巨大而人很亲密。",
    fingerprint: { shadow: dimension(57, 40, 1.2), highlight: dimension(25, 25, 0.8), spread: dimension(32, 30), saturation: dimension(21, 18, 1.2), warmth: dimension(-18, 60, 1.3), luma: dimension(16, 22, 0.4) },
    forms: { compositions: ["框架", "纵深", "留白"], lights: ["自然光", "侧光", "轮廓光"], shotSizes: ["中景", "近景"], motions: ["手持近身", "跟随移动"] },
    advice: ["用低饱和而不是纯灰：保留一点点色相倾向，画面才不显脏。", "把摄影机靠近身体，让景别承担情绪而不是台词。", "巨大空间与亲密近景交替出现，观众才会感到距离。"],
    pitfalls: ["以为大画幅就等于清晰：他真正在意的是质感与颗粒里的重量。", "把冷调做成死灰：缺少肤色锚点会让画面失去人味。"],
    prompt: {
      image: ["large-format feel, tactile texture, muted cool palette", "intimate handheld proximity to face and hands", "vast environment reduced to a small human figure"],
      motion: ["手持贴近人物肩背缓慢移动", "跟随脚步的长镜头，呼吸与脚步同步"],
      negative: ["通透干净的数码感", "均匀平光", "高饱和色块"],
    },
    exampleFrameIds: ["train-sleeper", "hill-stairs", "summer-rooftop-water"],
    basis: "公开访谈与作品观察整理；非本人言论。",
  },
  {
    slug: "jeff-cronenweth",
    name: "杰夫·克罗宁韦斯", nameEn: "Jeff Cronenweth", role: "摄影指导", region: "国际", cluster: "低调暖",
    oneLine: "数字摄影的精确控制、极低照度配高饱和色偏（常偏绿黄）、构图克制对称。",
    fingerprint: { shadow: dimension(85, 30, 1.2), highlight: dimension(1, 12, 0.8), spread: dimension(6, 22), saturation: dimension(55, 22, 1.2), warmth: dimension(5, 60, 1.3), luma: dimension(3, 14, 0.4) },
    forms: { compositions: ["对称", "中心", "框架"], lights: ["低调光", "霓虹", "侧光"], shotSizes: ["中景", "特写"], motions: ["稳定器平滑移动", "缓慢推进"] },
    advice: ["把色偏当灯光设计的一部分：绿黄或青灰要统一到整场，而不是单帧调色。", "在极低照度下用少数几盏高色纯度的光源塑造形体。", "构图先对齐再破坏：对称作为基准，用一个小偏差说明信息。"],
    pitfalls: ["只抄绿黄色偏，抄不到他对暗部噪点与肤色还原的控制。", "把低调光理解成欠曝，结果画面既暗又平。"],
    prompt: {
      image: ["very low ambient exposure, controlled digital precision", "single saturated greenish practical light source", "symmetrical restrained framing"],
      motion: ["稳定器极平滑的缓慢推进", "几乎静止的镜头，只让光源微动"],
      negative: ["胶片颗粒感", "暖色钨丝氛围", "手持晃动"],
    },
    exampleFrameIds: ["cinema-lobby-clock", "lane-phone-booth", "train-compartment-table"],
    basis: "公开访谈与作品观察整理；非本人言论。",
  },
  {
    slug: "gordon-willis",
    name: "戈登·威利斯", nameEn: "Gordon Willis", role: "摄影指导", region: "国际", cluster: "低调暖",
    oneLine: "「黑暗王子」：顶部光与极低调照明，把人物上半张脸留在暗处，用阴影制造信息层级。",
    fingerprint: { shadow: dimension(90, 22, 1.2), highlight: dimension(2, 12, 0.8), spread: dimension(6, 20), saturation: dimension(38, 22, 1.2), warmth: dimension(85, 55, 1.3), luma: dimension(2, 12, 0.4) },
    forms: { compositions: ["中心", "对称", "框架"], lights: ["低调光", "侧光", "烛光"], shotSizes: ["中景", "特写"], motions: ["固定机位", "缓慢变焦"] },
    advice: ["先决定这一场里「谁是亮的」，其余全部让它沉下去。", "用顶光或侧顶光雕刻轮廓，让人物靠身体而不是脸说话。", "暗部要留结构：靠墙面色差与边缘光让黑里有形。"],
    pitfalls: ["把低调光当成省灯，结果暗部没有层次、只有噪点。", "忽略他的暖钨丝基底，一味做冷黑会变成另一种风格。"],
    prompt: {
      image: ["extreme low-key, top light from above", "faces half-lost in shadow, warm tungsten base", "structured darkness with visible surface detail"],
      motion: ["完全固定的机位，靠光影变化推动", "极缓慢的推镜，不改变光位"],
      negative: ["补光填平阴影", "平光人像", "高亮均匀的环境"],
    },
    exampleFrameIds: ["cinema-seats", "teahouse-table", "cinema-booth"],
    basis: "公开访谈与作品观察整理；非本人言论。",
  },
  {
    slug: "wes-anderson",
    name: "韦斯·安德森", nameEn: "Wes Anderson", role: "导演", region: "国际", cluster: "高饱和暖",
    oneLine: "绝对对称与平面化构图、均匀照明下的高饱和粉彩，镜头像插画一样被摆放。",
    fingerprint: { shadow: dimension(65, 30, 1.2), highlight: dimension(11, 18, 0.8), spread: dimension(31, 26), saturation: dimension(45, 24, 1.2), warmth: dimension(80, 50, 1.3), luma: dimension(11, 18, 0.4) },
    forms: { compositions: ["对称", "中心", "三分法"], lights: ["自然光", "侧光", "低调光"], shotSizes: ["全景", "中景"], motions: ["正交推轨", "快速摇摄"] },
    advice: ["先把机器摆到绝对正侧或正中，再往画面里加东西。", "用均匀照明换取色块的干净，让色彩本身成为笑点或情绪。", "推轨与摇摄保持正交（横平竖直），动作才显得有仪式感。"],
    pitfalls: ["只抄对称会变成呆板：他的画面靠道具与服装颜色维持活力。", "忽略镜头运动：他的对称永远配正交运动，而不是静止。"],
    prompt: {
      image: ["perfect symmetry, flat frontal composition", "uniform lighting, saturated pastel color blocks", "meticulous production design, no depth cue"],
      motion: ["严格正交的横向推轨", "90 度快速摇摄，落点精确对齐"],
      negative: ["手持晃动", "强烈明暗对比", "失衡构图"],
    },
    exampleFrameIds: ["cinema-red-carpet", "summer-kitchen", "teahouse-morning-steam"],
    basis: "公开访谈与作品观察整理；非本人言论。",
  },
  {
    slug: "christopher-doyle",
    name: "杜可风", nameEn: "Christopher Doyle", role: "摄影指导", region: "东亚", cluster: "混合色温霓虹",
    oneLine: "手持与广角、混合色温（霓虹＋钨丝）、欠曝里放高饱和色斑；画面始终像在移动中失手抓住的。",
    fingerprint: { shadow: dimension(87, 25, 1.2), highlight: dimension(1.5, 12, 0.8), spread: dimension(6, 20), saturation: dimension(56, 24, 1.2), warmth: dimension(-35, 60, 1.3), luma: dimension(3, 12, 0.4) },
    forms: { compositions: ["倾斜", "中心", "框架"], lights: ["霓虹", "侧光", "低调光"], shotSizes: ["特写", "中景"], motions: ["手持晃动", "跟拍奔跑"] },
    advice: ["允许色温打架：同一画面里冷霓虹与暖钨丝并存，冲突就是内容。", "把摄影机交给身体：手持的失稳感要来自人物动作，而不是无理由的抖。", "用大面积暗部承载不安，只让一到两块高饱和色露出来。"],
    pitfalls: ["把「晃」当风格：没有调度支撑的手持只会让人晕。", "抄霓虹抄成满屏彩色，反而失去他画面里的黑。"],
    prompt: {
      image: ["handheld wide-angle, deep shadow with neon color patches", "mixed color temperature: cool neon against warm tungsten", "high saturation against large areas of darkness"],
      motion: ["手持跟拍人物行走，取景持续偏移", "跟随奔跑的晃动镜头"],
      negative: ["稳定器平滑运镜", "统一色温", "干净通透的夜景"],
    },
    exampleFrameIds: ["lane-neon", "lane-shutter", "lane-crossing"],
    basis: "公开访谈与作品观察整理；非本人言论。",
  },
  {
    slug: "ping-bin-lee",
    name: "李屏宾", nameEn: "Mark Lee Ping-Bin", role: "摄影指导", region: "东亚", cluster: "低调冷",
    oneLine: "自然光与低对比、固定机位长时间凝视；光线柔和得像没有设计过，空间自己在那里呼吸。",
    fingerprint: { shadow: dimension(71, 25, 1.2), highlight: dimension(1, 12, 0.8), spread: dimension(11, 22), saturation: dimension(28, 18, 1.2), warmth: dimension(-38, 60, 1.3), luma: dimension(4, 14, 0.4) },
    forms: { compositions: ["框架", "留白", "对称"], lights: ["自然光", "逆光", "烛光"], shotSizes: ["全景", "中景"], motions: ["固定机位", "极慢摇摄"] },
    advice: ["把机位定住：让时间在画面里自己流动，而不是靠运动制造节奏。", "保留低对比：暗部与亮部之间别拉太开，画面才留得住温润感。", "用门窗与纱帘做柔和过滤，光源永远在画外被解释。"],
    pitfalls: ["以为固定机位等于省事：它要求演员调度与场景细节极其准确。", "低对比被做成灰蒙蒙：缺少一点点色相倾向就没有温度。"],
    prompt: {
      image: ["soft filtered natural light, low contrast", "static wide framing through doorway or curtain", "muted green-grey palette with a warm accent"],
      motion: ["完全固定的长镜头，人物在画面内走动", "极慢的横摇，几乎察觉不到"],
      negative: ["强对比硬光", "快速剪辑感", "夸张色彩"],
    },
    exampleFrameIds: ["teahouse-rain", "hill-fog-bridge", "teahouse-window"],
    basis: "公开访谈与作品观察整理；非本人言论。",
  },
  {
    slug: "zhao-xiaoding",
    name: "赵小丁", nameEn: "Zhao Xiaoding", role: "摄影指导", region: "东亚", cluster: "高饱和暖",
    oneLine: "大面积高饱和色块、仪式化对称与纵深；色彩不是气氛，而是叙事单位的划分。",
    fingerprint: { shadow: dimension(65, 28, 1.2), highlight: dimension(11, 18, 0.8), spread: dimension(29, 26), saturation: dimension(53, 24, 1.2), warmth: dimension(95, 40, 1.3), luma: dimension(6, 16, 0.4) },
    forms: { compositions: ["对称", "中心", "纵深"], lights: ["侧光", "低调光", "自然光"], shotSizes: ["全景", "中景"], motions: ["轨道移动", "升格慢动作"] },
    advice: ["先定一块主色，再让其余颜色退到该色系的相邻位置。", "用对称建立仪式，再用一个不规则点打破它。", "让色彩承担段落划分：换场就换主色，而不是换台词。"],
    pitfalls: ["把高饱和做成满屏花：他的画面里总有一个明确的主色面积。", "忽略纵深：色块必须挂在前中后景上，否则只是平面海报。"],
    prompt: {
      image: ["one dominant saturated color field", "ceremonial symmetry with deep staging", "controlled color blocks across foreground and background"],
      motion: ["沿中轴的轨道推拉", "升格慢动作，让色块缓慢掠过"],
      negative: ["低饱和灰调", "杂乱配色", "手持失稳"],
    },
    exampleFrameIds: ["cinema-torn-curtain", "cinema-red-carpet", "summer-kitchen"],
    basis: "公开访谈与作品观察整理；非本人言论。",
  },
  {
    slug: "peter-pau",
    name: "鲍德熹", nameEn: "Peter Pau", role: "摄影指导", region: "东亚", cluster: "低调冷",
    oneLine: "烟雾、水汽与逆光共同制造流动感；运动镜头轻盈，写意大于实拍质感。",
    fingerprint: { shadow: dimension(71, 28, 1.2), highlight: dimension(3, 14, 0.8), spread: dimension(15, 24), saturation: dimension(29, 20, 1.2), warmth: dimension(-54, 60, 1.3), luma: dimension(6, 16, 0.4) },
    forms: { compositions: ["留白", "纵深", "倾斜"], lights: ["逆光", "轮廓光", "霓虹"], shotSizes: ["中景", "远景"], motions: ["升降运动", "跟拍移动"] },
    advice: ["逆光之前先放烟雾或水汽，让光路本身可见。", "让运动承担情绪：升降与横移要顺着动作的呼吸走。", "把环境留白做大，人物越小，写意感越强。"],
    pitfalls: ["只放烟雾不控方向，画面会变成一团灰。", "过度追求飘逸，失去重力与落地感。"],
    prompt: {
      image: ["backlit haze with visible light beams", "silhouetted figure against mist and water", "flowing motion, negative space dominant"],
      motion: ["升降镜头穿过烟雾", "跟随人物穿行，光路在身后散开"],
      negative: ["清晰硬朗的顺光", "干燥无雾的环境", "写实质感特写"],
    },
    exampleFrameIds: ["lane-umbrella", "teahouse-rain", "summer-storm-window", "hill-terrace-dusk"],
    basis: "公开访谈与作品观察整理；非本人言论。",
  },
];

export const styleProfileBySlug = (slug: string) => styleProfiles.find((profile) => profile.slug === slug);
