import { Film, Frame, Topic, CopyrightInfo, FilterKey } from "./types";
import { extendedFrames } from "./extended-frames";
import { cinematicExpansionFrameIdsByFilm, cinematicExpansionFrames } from "./cinematic-expansion";

const originalCopyright = (title: string): CopyrightInfo => ({
  imageTitle: title,
  author: "镜间视觉实验室",
  rightsHolder: "镜间演示项目",
  sourceUrl: "/copyright#original-demo-assets",
  sourceType: "镜间原创演示资产",
  licenseType: "本站内部演示授权",
  copyrightStatus: "本站原创",
  usageScope: "仅限镜间网站功能演示与电影美学分析，不作为商业素材授权",
  allowDownload: false,
  proofNote: "JJ-DEMO-2026 · 创作与审核记录留档",
  addedDate: "2026-09-04",
  reviewStatus: "审核通过",
});

export const films: Film[] = [
  {
    slug: "southern-teahouse", title: "南方茶馆", englishTitle: "The Southern Teahouse", year: 2019,
    director: "林雾", cinematographer: "周岚", region: "中国南方（虚构）", aspectRatio: "1.85:1",
    synopsis: "一间临河茶馆在梅雨季迎来最后一个营业日，三位旧识在潮气与茶烟中重新辨认彼此。",
    visualStyle: "低饱和暖黄与湿润青绿互相牵制。门窗、竹帘和屏风不断切割人物，让亲密关系始终隔着一层可见的距离。",
    compositionNotes: "框架、纵深与三分法构成主要语法，空间层次比人物动作承担更多叙事。",
    lightingNotes: "窗外阴天作为大面积柔光，室内钨丝灯与茶炉提供局部暖色，明暗过渡缓慢而黏稠。",
    palette: ["#C39A5A", "#80745B", "#35544C", "#202A27", "#171613"],
    frameIds: ["teahouse-window", "teahouse-table", "teahouse-rain", "teahouse-closing", "teahouse-kettle", "teahouse-corridor", "teahouse-river-window", "teahouse-empty-chair", "teahouse-morning-steam", ...(cinematicExpansionFrameIdsByFilm["southern-teahouse"] ?? [])], topicIds: ["warm-yellow", "framing-relationships", "teahouse-space", "depth-and-blocking", "natural-light-time", "low-key-information"],
  },
  {
    slug: "after-the-rain-lane", title: "雨巷之后", englishTitle: "After the Rain Lane", year: 2021,
    director: "许澄", cinematographer: "程泊", region: "中国东部（虚构）", aspectRatio: "2.39:1",
    synopsis: "夜班结束后，一名修伞匠穿过旧城雨巷，寻找一封从未寄出的信。",
    visualStyle: "冷蓝环境光包裹潮湿街面，橙红店招只在画面边缘短暂出现。反射与雾气让真实空间变成一段不可靠的记忆。",
    compositionNotes: "长焦压缩巷道，人物常在边缘或被雨幕遮挡，留白强调迟疑与等待。",
    lightingNotes: "霓虹、逆光和轮廓光共同勾勒雨丝；高光被地面积水拉长，形成第二条叙事路径。",
    palette: ["#173347", "#31576A", "#7EA2AB", "#B8583C", "#10161C"],
    frameIds: ["lane-neon", "lane-umbrella", "lane-letter", "lane-dawn", "lane-bicycle", "lane-bus-stop", "lane-shutter", "lane-crossing", "lane-phone-booth", ...(cinematicExpansionFrameIdsByFilm["after-the-rain-lane"] ?? [])], topicIds: ["rain-night-light", "negative-space", "red-danger", "close-up-without-dialogue", "warm-cool-attention"],
  },
  {
    slug: "night-train", title: "夜行列车", englishTitle: "Nightbound", year: 2017,
    director: "高原", cinematographer: "沈默", region: "中国北方（虚构）", aspectRatio: "2.00:1",
    synopsis: "一列通往边境的慢车上，陌生乘客在停电的十分钟里交换了各自的秘密。",
    visualStyle: "车厢荧光绿与窗外深蓝交替闪烁，重复座椅建立机械秩序，人物则被玻璃反射分成多个不稳定的影像。",
    compositionNotes: "对称、纵深与框中框反复出现，铁轨和座椅线条把视线引向不可见的终点。",
    lightingNotes: "低调光为主，窗外间歇光源形成移动侧光，停电段落只保留微弱轮廓。",
    palette: ["#253E45", "#607A73", "#A2A176", "#22242B", "#0D1117"],
    frameIds: ["train-aisle", "train-window", "train-platform", "train-sleeper", "train-dining-car", "train-tunnel", "train-luggage", "train-station-clock", ...(cinematicExpansionFrameIdsByFilm["night-train"] ?? [])], topicIds: ["framing-relationships", "negative-space", "low-key-information", "close-up-without-dialogue", "centered-composition"],
  },
  {
    slug: "humid-summer", title: "潮湿的夏天", englishTitle: "A Humid Summer", year: 2023,
    director: "唐禾", cinematographer: "季青", region: "中国沿海（虚构）", aspectRatio: "1.66:1",
    synopsis: "停电频繁的暑假里，两名少年在海边小城记录即将消失的声音。",
    visualStyle: "褪色绿、日晒白和皮肤暖色构成近乎触觉化的闷热感，静止长镜头让时间像汗水一样缓慢流动。",
    compositionNotes: "三分法与大片留白并用，人物常被安排在建筑边缘，画面重心保持轻微失衡。",
    lightingNotes: "强烈自然光经过窗帘、树叶和水汽过滤，正午硬光与傍晚柔光形成节奏对照。",
    palette: ["#C9C29B", "#829D82", "#506D66", "#E2A873", "#394642"],
    frameIds: ["summer-bedroom", "summer-seawall", "summer-fan", "summer-rooftop-water", "summer-arcade", "summer-kitchen", "summer-empty-pool", "summer-storm-window", ...(cinematicExpansionFrameIdsByFilm["humid-summer"] ?? [])], topicIds: ["negative-space", "warm-yellow", "natural-light-time", "warm-cool-attention"],
  },
  {
    slug: "letters-from-hill-city", title: "山城来信", englishTitle: "Letters from the Hill City", year: 2015,
    director: "顾桥", cinematographer: "罗松", region: "中国西南（虚构）", aspectRatio: "1.78:1",
    synopsis: "邮差每天攀过层叠阶梯，替一位老人投递写给未来的信。",
    visualStyle: "雾灰山体与砖红墙面组成沉静对比，坡道、楼梯和电线把平面切成方向复杂的城市剖面。",
    compositionNotes: "倾斜线、纵深和高低错位强调城市的立体结构，人物尺度被环境不断缩小。",
    lightingNotes: "清晨雾光消解边界，傍晚则以侧光突出墙体粗粝纹理，整体保持低饱和。",
    palette: ["#778280", "#A06B55", "#564D48", "#B9B4A4", "#313839"],
    frameIds: ["hill-stairs", "hill-letter", "hill-fog", "hill-cable-car", "hill-rooftop-lines", "hill-postbox", "hill-stair-rain", "hill-terrace-dusk", ...(cinematicExpansionFrameIdsByFilm["letters-from-hill-city"] ?? [])], topicIds: ["negative-space", "framing-relationships", "depth-and-blocking", "close-up-without-dialogue"],
  },
  {
    slug: "empty-cinema", title: "无人的放映厅", englishTitle: "The Empty Screening Room", year: 2020,
    director: "叶声", cinematographer: "白栩", region: "中国内陆（虚构）", aspectRatio: "2.35:1",
    synopsis: "老放映员在影院拆除前夜，为空座位放映最后一卷无名胶片。",
    visualStyle: "暗红座椅、尘埃金光与深黑空间建立舞台般的肃穆感。银幕并非最亮处，游移的放映光柱才是画面的情绪主体。",
    compositionNotes: "严格对称与中心构图制造仪式感，空座位的重复图案让缺席变得可见。",
    lightingNotes: "单一放映光束切开黑暗，侧后方工作灯勾勒人物轮廓，红色被压到接近棕黑。",
    palette: ["#7E302B", "#B27B47", "#4A2925", "#242024", "#0B0A0C"],
    frameIds: ["cinema-seats", "cinema-booth", "cinema-screen", "cinema-projector-reel", "cinema-torn-curtain", "cinema-lobby-clock", "cinema-aisle-lamp", "cinema-final-frame", ...(cinematicExpansionFrameIdsByFilm["empty-cinema"] ?? [])], topicIds: ["red-danger", "framing-relationships", "centered-composition", "low-key-information"],
  },
];

const frame = (input: Omit<Frame, "copyright">): Frame => ({ ...input, copyright: originalCopyright(input.title) });

export const frames: Frame[] = [
  frame({ slug: "teahouse-window", filmSlug: "southern-teahouse", title: "隔窗的午后", image: "/images/frames/teahouse-window.png", alt: "暖黄茶馆内，一个虚构人物隔着木窗坐在远处，窗外是青绿雨景", palette: ["#C39A5A", "#665A43", "#35544C", "#171613"], colors: ["暖黄", "绿色", "低饱和"], compositions: ["框架", "纵深"], shotSize: "全景", lights: ["自然光", "侧光"], lightDirection: "画面左侧窗外向室内", lightQuality: "阴天漫射柔光", subjectPosition: "右侧后景，被窗框包围", visualFocus: "窗框内的人物面部与白瓷茶杯", scenes: ["茶馆", "雨夜"], moods: ["孤独", "怀旧"], time: "白天", region: "中国南方", decade: "2010年代", analysis: "暖黄色没有把空间变得亲密，反而因前景木窗的深黑边缘显得陈旧而封闭。人物被安置在右侧后景，身体只占窗框内很小的面积，视线必须越过空桌与茶烟才能抵达他。左侧阴天柔光没有照亮整张脸，使等待成为一种缓慢、没有出口的状态；青绿色雨景则把室内暖色压成对往日的残余记忆。" }),
  frame({ slug: "teahouse-table", filmSlug: "southern-teahouse", title: "两只未碰的茶杯", image: "/images/frames/teahouse-table.png", alt: "旧茶馆圆桌上相对摆放两只茶杯，虚构人物分坐画面两侧", palette: ["#B98D52", "#7A5B3C", "#39483D", "#1B1916"], colors: ["暖黄", "低饱和"], compositions: ["对称", "留白"], shotSize: "中景", lights: ["烛光", "低调光"], lightDirection: "桌面中央向上反射", lightQuality: "局部柔光，四周快速衰减", subjectPosition: "人物分列左右边缘", visualFocus: "中央两只相隔的白瓷杯", scenes: ["茶馆"], moods: ["压抑", "怀旧"], time: "夜晚", region: "中国南方", decade: "2010年代", analysis: "近乎对称的座位暗示两人曾经拥有平等而亲近的关系，但中央空出的桌面把这种对称转化为僵持。两只茶杯比人物更亮，成为没有发生的交谈的替身。暖光只停留在桌心，人物脸部逐渐沉入边缘暗部，观众先读到距离，再辨认表情。画面因此用最普通的茶馆陈设，把沉默具体化为一段可测量的空间。" }),
  frame({ slug: "teahouse-rain", filmSlug: "southern-teahouse", title: "竹帘后的雨", image: "/images/frames/teahouse-rain.png", alt: "青绿色雨幕中的茶馆廊檐，虚构人物站在半透明竹帘后", palette: ["#79918A", "#405D57", "#B29A67", "#202A27"], colors: ["绿色", "冷蓝", "低饱和"], compositions: ["框架", "三分法"], shotSize: "中景", lights: ["自然光", "逆光"], lightDirection: "人物身后的庭院", lightQuality: "潮湿空气扩散的柔光", subjectPosition: "左侧三分线，隔着竹帘", visualFocus: "竹帘纹理与模糊侧脸", scenes: ["茶馆", "雨夜"], moods: ["神秘", "孤独"], time: "黄昏", region: "中国南方", decade: "2010年代", analysis: "半透明竹帘既允许观看又拒绝看清，使人物处在出现与消失之间。细密竖线像一道柔软的栅栏，将左侧侧脸切成碎片；右侧空廊则延长离开的方向。庭院逆光照亮雨丝，却没有给人物明确轮廓，观众感受到的是潮气和阻隔，而非事件本身。冷绿环境压过微弱暖色，让这场告别带着迟疑而非决绝。" }),
  frame({ slug: "teahouse-closing", filmSlug: "southern-teahouse", title: "打烊之后", image: "/images/frames/teahouse-closing.png", alt: "空茶馆深处只亮一盏暖灯，虚构人物正在合上木门", palette: ["#D2A054", "#55442F", "#283632", "#0F1110"], colors: ["暖黄", "高对比"], compositions: ["纵深", "中心"], shotSize: "远景", lights: ["轮廓光", "低调光"], lightDirection: "后景顶灯与门缝", lightQuality: "硬边缘光配合微弱环境光", subjectPosition: "画面中央远端", visualFocus: "门缝与人物肩线形成的亮边", scenes: ["茶馆"], moods: ["孤独", "压抑"], time: "夜晚", region: "中国南方", decade: "2010年代", analysis: "桌椅形成重复的纵深线，把观看推向画面最远端的关门动作。人物尺寸很小，几乎成为建筑结构的一部分，结束营业因此不只是动作，也是空间对他的吞没。唯一暖灯落在空桌而非人物身上，像仍在等待不会再来的客人；门缝硬光勾出肩部轮廓，短暂证明他的存在，随后也将随门合拢而消失。" }),

  frame({ slug: "lane-neon", filmSlug: "after-the-rain-lane", title: "霓虹落进积水", image: "/images/frames/lane-neon.png", alt: "冷蓝雨巷与红色无文字霓虹倒影，一名虚构人物走在远处", palette: ["#153449", "#2B6072", "#C04E3E", "#0C151D"], colors: ["冷蓝", "红色", "高对比"], compositions: ["纵深", "三分法"], shotSize: "全景", lights: ["霓虹", "逆光"], lightDirection: "巷道后方与画外店面", lightQuality: "雨雾扩散的点状硬光", subjectPosition: "右侧三分线后景", visualFocus: "人物脚下被红光割断的蓝色倒影", scenes: ["街道", "雨夜"], moods: ["神秘", "紧张"], time: "夜晚", region: "中国东部", decade: "2020年代", analysis: "冷蓝巷道建立连续、安静的夜色，红色倒影却从画面下方斜切进入，像危险先于人物抵达。人物被压缩在狭长透视尽头，没有正面照明，只靠轮廓与地面反射确认方向。红光并不照亮现实物体，而在积水中形成第二个不稳定空间，使观众怀疑他追逐的是一条真实线索，还是被记忆反复改写的信号。" }),
  frame({ slug: "lane-umbrella", filmSlug: "after-the-rain-lane", title: "伞下的停顿", image: "/images/frames/lane-umbrella.png", alt: "狭窄雨巷中撑深色伞的虚构人物停在路灯下", palette: ["#24495D", "#86A7AD", "#D19A5D", "#111A21"], colors: ["冷蓝", "暖黄", "低饱和"], compositions: ["中心", "留白"], shotSize: "远景", lights: ["轮廓光", "自然光"], lightDirection: "人物正上方偏后", lightQuality: "被雨雾软化的顶逆光", subjectPosition: "中央下方，占比很小", visualFocus: "伞缘银色轮廓与大片空墙", scenes: ["街道", "雨夜"], moods: ["孤独", "浪漫"], time: "夜晚", region: "中国东部", decade: "2020年代", analysis: "人物位于中心却没有获得支配感，因为上方湿墙占据了大部分画面，尺度关系让停顿显得格外脆弱。路灯从伞后勾出一圈银边，把人物从深蓝背景中暂时分离；暖色很少，只落在雨滴与墙皮凸起处。大片留白没有提供出口，反而像未能寄出的句子，迫使观众在空处想象他不愿继续前行的原因。" }),
  frame({ slug: "lane-letter", filmSlug: "after-the-rain-lane", title: "被雨浸开的字迹", image: "/images/frames/lane-letter.png", alt: "虚构人物戴手套的手在街灯下握着一封被雨打湿的无字信", palette: ["#CBA066", "#8A725B", "#315366", "#1A2026"], colors: ["暖黄", "冷蓝", "高对比"], compositions: ["三分法", "倾斜"], shotSize: "特写", lights: ["侧光", "低调光"], lightDirection: "画面左上方街灯", lightQuality: "集中硬光，边缘被雨雾软化", subjectPosition: "手与信位于右下三分区", visualFocus: "湿纸纤维的高光", scenes: ["街道", "雨夜"], moods: ["紧张", "怀旧"], time: "夜晚", region: "中国东部", decade: "2020年代", analysis: "倾斜的信封边缘与斜落雨丝构成彼此冲突的方向，让静止特写仍带有不安。街灯暖光只照亮湿纸表层，无法恢复已经晕开的内容；背景冷蓝被压成没有信息的暗块。观众被迫注视纸张的质感而非文字，这使信件从叙事证据变为情绪证据：重要的不是它说了什么，而是人物为何仍不肯松手。" }),
  frame({ slug: "lane-dawn", filmSlug: "after-the-rain-lane", title: "雨停前的清晨", image: "/images/frames/lane-dawn.png", alt: "雨后清晨的空巷，一名虚构人物背对镜头走向淡青色天光", palette: ["#9AAEB0", "#607A80", "#B78261", "#27363D"], colors: ["冷蓝", "低饱和"], compositions: ["纵深", "留白"], shotSize: "远景", lights: ["自然光", "逆光"], lightDirection: "巷口正前方", lightQuality: "清晨均匀柔光", subjectPosition: "中央偏左远景", visualFocus: "巷口亮面与人物背影", scenes: ["街道"], moods: ["怀旧", "孤独"], time: "清晨", region: "中国东部", decade: "2020年代", analysis: "清晨天光抹平了夜里强烈的霓虹对比，巷道从神秘场所重新变回普通街道。人物背影沿纵深线走向最亮处，但低饱和色彩没有把这个方向解释成希望；湿墙仍保留冷意，空出的右侧让离开显得没有回应。经历一夜寻找后，画面不提供答案，而是用逐渐清晰的空间提醒观众：现实恢复可见，并不等于遗憾已经消失。" }),

  frame({ slug: "train-aisle", filmSlug: "night-train", title: "停电后的车厢", image: "/images/frames/train-aisle.png", alt: "昏暗列车车厢的对称过道，虚构乘客坐在两侧剪影中", palette: ["#243A41", "#61776C", "#A39A65", "#0D1115"], colors: ["绿色", "冷蓝", "低饱和"], compositions: ["对称", "纵深"], shotSize: "全景", lights: ["低调光", "轮廓光"], lightDirection: "车厢尽头应急灯", lightQuality: "微弱硬光与大面积暗部", subjectPosition: "人物分布两侧，中央无人", visualFocus: "过道尽头的一点绿光", scenes: ["列车"], moods: ["紧张", "神秘"], time: "夜晚", region: "中国北方", decade: "2010年代", analysis: "严格对称的座椅建立出冷静秩序，停电却让这个秩序只剩轮廓。中央过道像一条没有退路的黑色通道，把目光带向尽头的应急灯；两侧乘客彼此很近，却被高靠背切割成独立剪影。微绿光线既是安全标志，也带着病态色偏，使短暂沉默不再中性，仿佛每个人都在等待秘密先从别人一侧泄露。" }),
  frame({ slug: "train-window", filmSlug: "night-train", title: "玻璃里的第二张脸", image: "/images/frames/train-window.png", alt: "夜行列车窗边的虚构人物侧脸与玻璃倒影重叠", palette: ["#31505C", "#79908A", "#B5A66B", "#151B21"], colors: ["冷蓝", "绿色"], compositions: ["框架", "三分法"], shotSize: "近景", lights: ["侧光", "自然光"], lightDirection: "窗外移动光源", lightQuality: "间歇硬侧光", subjectPosition: "左侧侧脸，倒影在右侧", visualFocus: "真实眼睛与倒影眼睛之间", scenes: ["列车"], moods: ["神秘", "孤独"], time: "夜晚", region: "中国北方", decade: "2010年代", analysis: "车窗把同一张脸拆成实体与倒影，两者并未精确重合，形成一种身份迟滞。外部移动光源只在瞬间擦过眼睛，其余表情沉在暗部，使观众无法确定哪一面更接近真实。窗框像画框固定住人物，窗外景物则被速度抹成色带。画面的叙事张力来自这种反差：身体被困在明确座位上，思想却随着反射不断偏离当前位置。" }),
  frame({ slug: "train-platform", filmSlug: "night-train", title: "无名站台", image: "/images/frames/train-platform.png", alt: "空旷夜间站台与停靠列车，一名虚构人物站在大片雾气中", palette: ["#43585D", "#8D987E", "#C3A66D", "#171D20"], colors: ["冷蓝", "低饱和"], compositions: ["留白", "纵深"], shotSize: "远景", lights: ["逆光", "轮廓光"], lightDirection: "站台远端雾灯", lightQuality: "雾气扩散柔光", subjectPosition: "右侧下方", visualFocus: "人物与列车门之间的亮雾", scenes: ["车站"], moods: ["孤独", "压抑"], time: "夜晚", region: "中国北方", decade: "2010年代", analysis: "大面积雾气抹去了站名与远景信息，让停靠失去地理意义。人物被放在右下角，左侧列车和上方空雾形成沉重留白，看似开放，实际没有可确认的方向。逆光没有揭示面孔，只勾勒衣领和行李边缘；人与车门之间那段最亮的距离因此成为选择本身。画面让抵达与离开同时存在，却拒绝告诉观众哪一个动作正在发生。" }),

  frame({ slug: "summer-bedroom", filmSlug: "humid-summer", title: "停转的吊扇", image: "/images/frames/summer-bedroom.png", alt: "褪绿色旧卧室里停转的吊扇，虚构少年躺在床边阴影中", palette: ["#C9C29B", "#829D82", "#5B6F63", "#E0A36D"], colors: ["绿色", "暖黄", "低饱和"], compositions: ["三分法", "留白"], shotSize: "全景", lights: ["自然光", "侧光"], lightDirection: "右侧百叶窗", lightQuality: "被窗帘过滤的柔侧光", subjectPosition: "左下角床沿", visualFocus: "上方停住的扇叶与窗光条纹", scenes: ["卧室"], moods: ["压抑", "怀旧"], time: "白天", region: "中国沿海", decade: "2020年代", analysis: "吊扇占据上方视觉中心却完全静止，观众几乎能从这种静止中感到闷热。人物缩在左下角，大片墙面把等待拉长；百叶窗光线在床单上留下规则条纹，与松散身体形成对照。褪绿色墙面降低了生命力，少量皮肤暖色也被环境吞没。画面没有表现汗水或动作，却通过空气仿佛不再流动的空间关系传达停电时的焦躁。" }),
  frame({ slug: "summer-seawall", filmSlug: "humid-summer", title: "海堤之外", image: "/images/frames/summer-seawall.png", alt: "日晒发白的海堤旁，两名虚构少年背对镜头望向灰绿色海面", palette: ["#D6D0AF", "#88A19A", "#5D7774", "#D99F6F"], colors: ["绿色", "低饱和"], compositions: ["三分法", "留白"], shotSize: "远景", lights: ["自然光", "逆光"], lightDirection: "海面上方偏右", lightQuality: "潮湿空气中的强漫射光", subjectPosition: "画面下方三分线", visualFocus: "两个人之间的窄小间隙", scenes: ["自然景观"], moods: ["浪漫", "温暖"], time: "黄昏", region: "中国沿海", decade: "2020年代", analysis: "天空和海面占据绝大部分画面，两个人被压成海堤上的微小形状。构图没有让他们互相依靠，反而保留了一道能看见海的缝隙，这段负空间成为关系尚未说破的部分。逆光把衣物颜色漂白，细节被湿润空气软化，夏日因此不像明亮假期，更像正在褪色的记忆。温暖来自共同停留，而非画面色彩的直接暗示。" }),
  frame({ slug: "summer-fan", filmSlug: "humid-summer", title: "风扇重新启动", image: "/images/frames/summer-fan.png", alt: "旧餐厅里旋转的台扇吹动纸条，两名虚构少年在背景笑着", palette: ["#D6B77B", "#879A77", "#506157", "#9D6048"], colors: ["暖黄", "绿色"], compositions: ["中心", "纵深"], shotSize: "中景", lights: ["自然光", "侧光"], lightDirection: "左侧敞开窗户", lightQuality: "傍晚柔光", subjectPosition: "人物在后景两侧", visualFocus: "前景旋转风扇与飞起的纸条", scenes: ["餐厅"], moods: ["温暖", "怀旧"], time: "黄昏", region: "中国沿海", decade: "2020年代", analysis: "前景风扇的运动模糊第一次打破影片持续的闷滞感，飞起的纸条把看不见的风变成可见轨迹。两名人物位于后景并稍微失焦，笑容不是画面唯一的信息，空间重新流动才是情绪转折。暖黄傍晚光和褪绿室内不再互相压制，而在风扇周围混合。短暂恢复的电力因而被拍成青春关系中难得的同步时刻。" }),

  frame({ slug: "hill-stairs", filmSlug: "letters-from-hill-city", title: "九十九级台阶", image: "/images/frames/hill-stairs.png", alt: "雾灰山城中陡峭台阶层层上升，一名虚构邮差攀行其间", palette: ["#788281", "#A46D55", "#57514C", "#BAB5A8"], colors: ["低饱和", "红色"], compositions: ["倾斜", "纵深"], shotSize: "远景", lights: ["自然光", "侧光"], lightDirection: "左上方雾天光", lightQuality: "均匀柔光", subjectPosition: "中央偏左，位于台阶中段", visualFocus: "红褐色邮包与交错阶梯", scenes: ["街道"], moods: ["怀旧", "压抑"], time: "清晨", region: "中国西南", decade: "2010年代", analysis: "多组倾斜台阶没有汇向同一个消失点，而像在平面上互相叠压，城市因此显得难以被一次看懂。邮差位于中段，既看不见出发处也看不见终点，红褐色邮包成为雾灰环境里唯一稳定识别点。柔光削弱阴影，却没有减轻坡度带来的重量；人物每向上一步，周围建筑仍在更高处继续生长，劳动被空间结构延长成日常命运。" }),
  frame({ slug: "hill-letter", filmSlug: "letters-from-hill-city", title: "没有门牌的信", image: "/images/frames/hill-letter.png", alt: "粗糙砖墙前，一只虚构人物的手举着无文字信封寻找门牌", palette: ["#A36A53", "#C0B299", "#606665", "#342F2D"], colors: ["暖黄", "红色", "低饱和"], compositions: ["三分法", "倾斜"], shotSize: "特写", lights: ["侧光", "自然光"], lightDirection: "右上方巷口", lightQuality: "柔中带硬的斜侧光", subjectPosition: "手与信在右侧", visualFocus: "信封直线与斑驳墙纹的冲突", scenes: ["街道"], moods: ["神秘", "怀旧"], time: "白天", region: "中国西南", decade: "2010年代", analysis: "平整信封贴近粗糙砖墙，两种材质把制度化地址与无序城市并置。画面刻意不显示文字，观众只能跟随手的迟疑判断寻找是否正确。斜侧光强调墙面裂缝，却让本应提供答案的门牌位置沉入暗处；信封边缘保持近乎水平，周围线条却不断倾斜。这种视觉不一致让一封普通邮件变成对空间记忆的测试。" }),
  frame({ slug: "hill-fog", filmSlug: "letters-from-hill-city", title: "雾中投递", image: "/images/frames/hill-fog.png", alt: "层叠山城建筑隐入浓雾，虚构邮差站在前景栏杆旁", palette: ["#AEB6B2", "#788481", "#9A705D", "#3E4646"], colors: ["黑白", "低饱和"], compositions: ["留白", "纵深"], shotSize: "全景", lights: ["自然光", "逆光"], lightDirection: "雾后方天空", lightQuality: "极柔漫射光", subjectPosition: "左下前景", visualFocus: "人物深色轮廓与逐层消失的楼群", scenes: ["自然景观", "街道"], moods: ["孤独", "神秘"], time: "清晨", region: "中国西南", decade: "2010年代", analysis: "雾把远处楼群逐层擦除，城市不再是一张可以抵达的地图，而是一组随距离减弱的灰色痕迹。人物站在左下前景，深色轮廓明确，却面对几乎没有信息的大片留白。栏杆提供一条可依靠的水平线，山势和建筑仍向不同方向倾斜。画面把投递行为从寻找具体门牌，提升为把消息送进未知时间的隐喻。" }),

  frame({ slug: "cinema-seats", filmSlug: "empty-cinema", title: "为缺席者放映", image: "/images/frames/cinema-seats.png", alt: "暗红空座椅整齐排列，银幕微亮，一名虚构放映员站在中央过道", palette: ["#792F2B", "#4B2825", "#B48A58", "#0B0A0C"], colors: ["红色", "高对比"], compositions: ["对称", "中心"], shotSize: "全景", lights: ["低调光", "逆光"], lightDirection: "银幕正前方", lightQuality: "大面积柔光与深暗部", subjectPosition: "中央过道中景", visualFocus: "人物头部与银幕下缘的交点", scenes: ["放映厅"], moods: ["怀旧", "压抑"], time: "夜晚", region: "中国内陆", decade: "2020年代", analysis: "座椅的严格重复把空缺变成一种有秩序的存在，人物虽然站在正中央，却像被两侧暗红色浪潮夹住。银幕只提供灰白柔光，没有出现任何影像，观看行为因此指向缺席本身。红色被压低明度后失去热烈，转而接近旧木与干涸血迹的色感；对称构图制造仪式，却也暗示这场私人告别无法被打断。" }),
  frame({ slug: "cinema-booth", filmSlug: "empty-cinema", title: "尘埃穿过光束", image: "/images/frames/cinema-booth.png", alt: "旧放映机投出金色光束，尘埃清晰可见，虚构放映员在侧面操作", palette: ["#C28B4F", "#6A4930", "#2B2525", "#0C0B0D"], colors: ["暖黄", "高对比"], compositions: ["三分法", "纵深"], shotSize: "中景", lights: ["轮廓光", "低调光"], lightDirection: "放映机向右前方", lightQuality: "集中硬光束", subjectPosition: "左侧三分区", visualFocus: "光束中的尘埃与胶片轮盘", scenes: ["放映厅"], moods: ["怀旧", "神秘"], time: "夜晚", region: "中国内陆", decade: "2020年代", analysis: "放映光束是画面中最具实体感的部分，尘埃让光从照明条件变成可被观看的对象。人物处在左侧暗部，只由机器反光勾勒手背与额头，操作动作因此像一场秘密仪式。暖金色通常关联怀旧和温度，此处却被四周深黑截断，显得短促而脆弱；胶片转动不断，空间里真正被保存下来的却只是漂浮颗粒。" }),
  frame({ slug: "cinema-screen", filmSlug: "empty-cinema", title: "最后一格白光", image: "/images/frames/cinema-screen.png", alt: "空放映厅里白色银幕逐渐熄灭，前景只见一排暗红座椅", palette: ["#D3CEC0", "#7A3B35", "#332628", "#08080A"], colors: ["黑白", "红色", "高对比"], compositions: ["对称", "留白"], shotSize: "远景", lights: ["逆光", "低调光"], lightDirection: "正面银幕", lightQuality: "均匀柔光，向四周衰减", subjectPosition: "无人", visualFocus: "白色银幕中央与前景空座", scenes: ["放映厅"], moods: ["孤独", "怀旧"], time: "夜晚", region: "中国内陆", decade: "2020年代", analysis: "人物完全退出后，银幕成为没有内容的最大留白。它位于严格对称中心，却不再承担叙事窗口的功能，只剩逐渐下降的亮度。前景座椅压成暗红剪影，像一群保持沉默的观看者，也像被时间留下的刻度。高反差使空间边界快速消失，观众最后看到的不是电影结束，而是承载电影的房间正在失去被看见的条件。" }),
  ...extendedFrames,
  ...cinematicExpansionFrames,
];

export const publicFrames = frames.filter((item) => item.copyright.reviewStatus === "审核通过" && item.copyright.copyrightStatus !== "待版权审核");

export const topics: Topic[] = [
  { slug: "warm-yellow", title: "电影里的暖黄色为什么不一定温暖", excerpt: "色温只是起点。空间分割、明度关系与人物距离，才决定暖黄最终通向亲密、陈旧还是窒息。", author: "镜间编辑部", publishedAt: "2026-08-28", readTime: "8 分钟", coverFrameId: "teahouse-window", relatedTopicIds: ["framing-relationships", "teahouse-space"], sections: [
    { heading: "色彩从不单独叙事", paragraphs: ["暖黄色常被快速理解为家庭、回忆与安全感，但色相并不直接等于情绪。它需要和明度、饱和度、材质以及人物所处的位置共同工作。低饱和、低照度的黄更接近旧纸和积尘，能够把温度转化为时间留下的痕迹。"], frameId: "teahouse-window" },
    { heading: "当暖光只照亮空位", paragraphs: ["如果最亮区域落在空桌、空椅或人物之间，暖光会强化缺席。观看者先被亮处吸引，随后才发现那里没有动作，温馨符号便转化成关系中没有被填满的位置。"], frameId: "teahouse-table" },
    { heading: "让色彩服从空间", paragraphs: ["分析暖色画面时，不妨先遮住色相，只观察人物比例、框架和阴影。若空间本身封闭，恢复色彩后，暖黄往往不会解除压迫，只会让它更具生活经验和怀旧质感。"] },
  ]},
  { slug: "framing-relationships", title: "框架构图如何表现人物关系", excerpt: "门、窗、镜面与座椅都能成为第二层画框，把人物之间不可见的边界变成清楚的视觉事实。", author: "梁序", publishedAt: "2026-08-20", readTime: "10 分钟", coverFrameId: "train-window", relatedTopicIds: ["warm-yellow", "negative-space"], sections: [
    { heading: "框中框是一种关系判断", paragraphs: ["天然框架不只是装饰。它决定人物是否共享同一视觉单元：两人处于同一个门框时更容易被理解为共同体，被不同竖线切开时，即使身体靠近，也会显得心理距离遥远。"], frameId: "teahouse-window" },
    { heading: "反射制造不稳定身份", paragraphs: ["玻璃与镜面提供的框架会同时容纳人物和环境。倒影略微错位时，观众会感到自我认知与现实位置之间存在延迟，这种视觉分裂尤其适合表现犹疑、隐瞒和记忆。"], frameId: "train-window" },
    { heading: "框架也能引导时间", paragraphs: ["前景框架要求视线穿越空间才能抵达人物，因此观看本身变得缓慢。距离被体验出来，关系的阻隔也就不必依赖对白解释。"] },
  ]},
  { slug: "rain-night-light", title: "雨夜镜头的五种光线设计", excerpt: "雨丝本身不会发光。逆光、路面反射、色温分层和雾化控制，才让雨夜拥有可读的空间。", author: "周岚", publishedAt: "2026-08-12", readTime: "9 分钟", coverFrameId: "lane-neon", relatedTopicIds: ["red-danger", "negative-space"], sections: [
    { heading: "先让雨被看见", paragraphs: ["最有效的基础方式是把光源放在雨幕后方，让细小水滴获得亮边。光位越接近镜头轴线，雨丝越密；角度偏离后，人物轮廓会更清楚。"], frameId: "lane-umbrella" },
    { heading: "利用地面完成第二次照明", paragraphs: ["湿地面会把店招和车灯拉成长条色块。它既能填补人物下半身的暗部，也能创造与现实光源方向不同的视觉运动。"], frameId: "lane-neon" },
    { heading: "控制颜色，而不是堆满颜色", paragraphs: ["雨夜容易陷入无目的霓虹。保留一个主环境色与一个叙事强调色，通常更能让观众理解危险来自哪里、人物正在朝哪一处移动。"] },
  ]},
  { slug: "teahouse-space", title: "茶馆空间中的市井生活", excerpt: "桌椅、屏风、蒸汽和来往路径如何把一个日常场所变成关系密度极高的叙事空间。", author: "林雾", publishedAt: "2026-07-30", readTime: "7 分钟", coverFrameId: "teahouse-table", relatedTopicIds: ["warm-yellow", "framing-relationships"], sections: [
    { heading: "桌子决定交谈的距离", paragraphs: ["方桌建立明确阵营，圆桌看似平等，却可以通过空位和茶具排列制造微妙偏向。机位略低于桌面时，器物会成为人物之间难以绕开的前景。"], frameId: "teahouse-table" },
    { heading: "半透明隔断保留生活流动", paragraphs: ["竹帘、蒸汽和磨砂玻璃不会完全阻断视线，它们让背景活动以模糊形态持续存在。私人谈话因此始终暴露在公共空间的声响与人流之中。"], frameId: "teahouse-rain" },
    { heading: "打烊是空间的角色转变", paragraphs: ["客人离开后，重复桌椅不再服务社交，而开始显露维护、劳动和时间痕迹。同一机位可以从热闹转为寂静，空间由背景变为叙事主体。"] },
  ]},
  { slug: "negative-space", title: "留白如何制造孤独感", excerpt: "留白不是简单地让画面变空，而是让人物面对一个没有回应、没有尺度或没有明确出口的区域。", author: "顾桥", publishedAt: "2026-07-18", readTime: "8 分钟", coverFrameId: "hill-fog", relatedTopicIds: ["framing-relationships", "rain-night-light"], sections: [
    { heading: "空白必须与人物发生关系", paragraphs: ["真正有效的留白有方向。人物的脸、身体或行动线指向空处时，观众会期待那里出现回应；持续没有回应，空白才转化为孤独。"], frameId: "lane-umbrella" },
    { heading: "雾让留白失去尺度", paragraphs: ["纯色墙面仍能被估计距离，雾却会同时消除边界与深度。人物面对雾时，空白不只是空，而是不知道还剩多少路。"], frameId: "hill-fog" },
    { heading: "不要把主体自动放在中心", paragraphs: ["把人物压向边缘，可以让空间获得更强重量。但边缘化必须与目光、运动方向和光线配合，否则只会变成形式化的不平衡。"] },
  ]},
  { slug: "red-danger", title: "红色在电影中的危险与欲望", excerpt: "红色为何能在同一画面里既吸引视线，又发出警告？关键在于它出现的位置、面积和材质。", author: "白栩", publishedAt: "2026-07-05", readTime: "9 分钟", coverFrameId: "cinema-seats", relatedTopicIds: ["warm-yellow", "rain-night-light"], sections: [
    { heading: "小面积红色像一个动词", paragraphs: ["当整体由冷色或中性色控制，小面积红色会立刻产生方向性。它不只说明物体颜色，还像一个动作，要求视线靠近、停留或警觉。"], frameId: "lane-neon" },
    { heading: "降低明度，改变红色的语气", paragraphs: ["明亮红色接近即时欲望，暗红则更容易关联历史、身体记忆与被压抑的冲动。材质同样重要：霓虹红流动不定，绒布红吸收光线，两者讲述完全不同的危险。"], frameId: "cinema-seats" },
    { heading: "让红色有退出的时刻", paragraphs: ["如果红色始终占据画面，它会很快成为普通环境色。通过暂时消失再重新出现，可以让色彩像叙事线索一样积累意义。"] },
  ]},
  { slug: "centered-composition", title: "中心构图不只是稳定：秩序、凝视与困境", excerpt: "当主体被放在正中央，画面可能显得安定，也可能像审讯、仪式或无法逃开的命运。差别来自周围空间。", author: "梁序", publishedAt: "2026-09-02", readTime: "11 分钟", coverFrameId: "cinema-seats", relatedTopicIds: ["framing-relationships", "negative-space"], sections: [
    { heading: "中心是一种强制观看", paragraphs: ["中心位置缩短了视线寻找主体的时间。观众几乎在进入画面的同时就被要求面对人物或物体，因此中心构图天然具有陈述语气。它适合建立仪式、权力与不可回避的决定，但并不自动意味着平静。", "判断中心构图时，应把主体尺寸和周围边界一起考虑。主体足够大时，中心带来支配感；主体很小且四周封闭时，同一位置反而像被空间锁定。"], frameId: "cinema-seats" },
    { heading: "对称与中心并不是同一件事", paragraphs: ["主体可以位于中心，但左右两侧的光线、人物或物体并不对称。此时中心提供稳定坐标，不对称元素则持续制造偏移。反过来，空画面可以严格对称，却没有一个具体中心主体。", "把两者分开分析，能避免用“很工整”概括所有效果。对称关心两侧重量如何回应，中心构图关心注意力是否被钉在几何核心。"], frameId: "teahouse-closing" },
    { heading: "中心人物为什么仍会显得孤独", paragraphs: ["孤独并不只来自人物靠近边缘。如果中心人物与其他座位、门窗或路径保持同等距离，却没有任何方向给予回应，中心会让这种无回应变得更公开。人物不是被忽略，而是被整个空间共同注视。"] },
    { heading: "创作练习：先搭秩序，再制造一个偏差", paragraphs: ["先用门框、座椅或建筑线条建立严格中心，再只改变一个元素：让人物偏半步、熄灭一侧灯、留下一个空位。比较偏差出现前后，画面的叙事问题如何变化。不要同时改变太多条件，否则观众无法辨认真正的冲突来源。"] },
  ]},
  { slug: "depth-and-blocking", title: "纵深如何让观众走进空间", excerpt: "前景、中景与后景不是三层布景，而是一条观看所需经过的时间路径。纵深决定目标看起来有多远。", author: "周岚", publishedAt: "2026-08-31", readTime: "12 分钟", coverFrameId: "teahouse-closing", relatedTopicIds: ["framing-relationships", "centered-composition"], sections: [
    { heading: "纵深首先是一种时间感", paragraphs: ["当视线需要越过前景桌椅、穿过中景门框，最后才抵达人物，观看就拥有了先后顺序。人物即使静止，观众也完成了一次视觉移动。纵深因此特别适合表现追寻、等待和难以靠近的关系。", "透视线只是方法之一。明暗递进、清晰度变化和重复物体的尺寸缩小，同样可以建立距离。重要的不是空间看起来多大，而是视线是否被有目的地接力。"], frameId: "teahouse-closing" },
    { heading: "前景遮挡让观众意识到自己的位置", paragraphs: ["干净的全景让空间像地图，前景遮挡则把观看变成从某个具体位置偷看或旁观。窗框、椅背和半透明帘幕提醒观众：我们并不拥有完整视角。", "遮挡过多会让信息失去层级。有效的前景应当既阻止直接抵达，又留下足够路径，引导视线绕过它。"], frameId: "teahouse-window" },
    { heading: "让人物运动与纵深发生关系", paragraphs: ["横向移动展示人物经过空间，向镜头靠近或离开则直接改变心理距离。人物走向后景亮处时，观众常把它理解为目标；如果后景没有信息，运动会带上未知和失去控制的意味。"], frameId: "lane-dawn" },
    { heading: "分镜练习：画出三种可达性", paragraphs: ["为同一个人物和目标画三版分镜：第一版之间没有遮挡，第二版隔着门框，第三版让目标位于深暗后景。保持对白和人物动作不变，比较观众对“能否抵达”的判断。纵深设计真正改变的是行动的难度。"] },
  ]},
  { slug: "natural-light-time", title: "自然光如何让时间参与叙事", excerpt: "清晨、正午、阴天和黄昏不仅提供不同色温，也改变空间边界、人物动作与观众对时间流逝的感受。", author: "季青", publishedAt: "2026-08-25", readTime: "10 分钟", coverFrameId: "summer-bedroom", relatedTopicIds: ["warm-yellow", "rain-night-light"], sections: [
    { heading: "自然光的核心是可理解的来源", paragraphs: ["所谓自然，不等于完全不控制。观众只需要相信光来自窗户、天空或真实环境，画面便会保留具体时间感。柔光箱也能模拟阴天窗光，关键是方向、衰减和色温是否与空间一致。", "自然光设计首先回答“现在是什么时候”，其次才回答“人物是否好看”。当光线变化与剧情时间同步，空间会像人物一样经历过程。"], frameId: "summer-bedroom" },
    { heading: "阴天光不是没有方向", paragraphs: ["云层会降低反差，但门窗仍决定室内亮度从哪一侧进入。靠近窗户的位置拥有细腻层次，远离窗口的区域则逐渐失去色彩。利用这种缓慢衰减，可以表现人物正在靠近现实，或退回不愿被看见的位置。"], frameId: "teahouse-window" },
    { heading: "黄昏的意义来自持续时间很短", paragraphs: ["黄昏光柔和而温暖，却很快消失。画面之所以带有怀旧，不只因为颜色，也是因为观众知道这种平衡无法维持。让人物在光线将尽时完成一次停顿，时间本身就会成为潜台词。"], frameId: "summer-seawall" },
    { heading: "观察练习：记录一扇窗的四个时刻", paragraphs: ["固定机位拍摄清晨、正午、黄昏与阴天的同一扇窗，不移动人物，只记录阴影边缘、背景明度和肤色变化。随后为四张画面分别写一句叙事判断。练习目标不是找到最美光线，而是理解时间如何改变关系。"] },
  ]},
  { slug: "low-key-information", title: "低调光如何控制信息，而不只是制造黑暗", excerpt: "好的暗部仍然有层次、有方向、有叙事目的。低调光的关键，是决定观众此刻被允许知道多少。", author: "白栩", publishedAt: "2026-08-16", readTime: "11 分钟", coverFrameId: "train-aisle", relatedTopicIds: ["rain-night-light", "red-danger"], sections: [
    { heading: "暗部必须保留结构", paragraphs: ["低调光并不是把曝光压低。即使大部分画面接近黑色，座椅边缘、墙面反光和人物轮廓仍需要帮助观众理解空间。完全没有层次的黑只会切断信息，而有层次的暗部会让观众主动寻找。", "可以先决定必须可读的三件事，再为其余部分保留不同程度的未知。光线越少，每一个亮点承担的叙事责任越大。"], frameId: "train-aisle" },
    { heading: "最亮处不一定是人物脸", paragraphs: ["把亮度交给一只茶杯、一道门缝或机器光束，可以让物体代替人物说话。观众会先读取亮处，再回到暗处寻找人物反应，叙事顺序因此被重新组织。"], frameId: "teahouse-table" },
    { heading: "轮廓光只证明存在，不解释身份", paragraphs: ["人物被轮廓光从背景中分离时，身体方向清晰，表情却仍不可见。它适合表现角色已经来到现场，但动机尚未被揭示。轮廓完整会显得图形化，适当中断则能保留空间真实感。"], frameId: "cinema-booth" },
    { heading: "布光练习：只允许一个亮区", paragraphs: ["选择一处室内场景，规定画面只能有一个明显亮区。分别让亮区落在人物、人物之间和空位上，保持机位不变，比较叙事中心如何改变。随后再添加最低限度的轮廓，确保暗部仍能说明空间。"] },
  ]},
  { slug: "close-up-without-dialogue", title: "特写何时比台词更有效", excerpt: "特写并不天然等于情绪强烈。只有当材质、动作和前后镜头共同准备好，它才会成为真正的信息转折。", author: "许澄", publishedAt: "2026-08-08", readTime: "9 分钟", coverFrameId: "lane-letter", relatedTopicIds: ["depth-and-blocking", "negative-space"], sections: [
    { heading: "特写是一次信息取舍", paragraphs: ["镜头靠近后，环境会被大量排除。观众获得纸张纤维、手指压力或眼神变化，却暂时失去人物所在的位置。特写有效，是因为被放大的细节值得用环境信息交换。", "如果前一个镜头没有建立空间和动作，特写很容易只剩漂亮质感。先让观众知道角色面对什么，再靠近观察他如何触碰、回避或确认。"], frameId: "lane-letter" },
    { heading: "手部动作可以替代表情", paragraphs: ["握得太紧、停在半空、反复折叠，这些动作拥有明确节奏，并且比面部更少限定情绪答案。手与物体接触时，材质变化也会进入叙事：湿纸变软、旧墙粗糙、金属表面冰冷。"], frameId: "hill-letter" },
    { heading: "让焦点落在关系之间", paragraphs: ["特写的视觉中心不一定是单个物体。信封边缘与雨丝的交叉、真实眼睛与倒影之间的空隙，都能成为关系性的焦点。观众阅读的不是物，而是两个视觉信息如何冲突。"], frameId: "train-window" },
    { heading: "剪辑练习：同一特写接三种全景", paragraphs: ["把同一个手握信封特写分别接在空巷、拥挤车站和家庭餐桌之后。记录特写意义如何改变。这个练习说明，特写的情绪并不封存在画面内部，而由前后空间共同定义。"] },
  ]},
  { slug: "warm-cool-attention", title: "冷暖对比如何组织注意力", excerpt: "冷暖对比最有价值的不是让画面更“电影感”，而是把人物、空间与时间分配到不同色温区域。", author: "程泊", publishedAt: "2026-08-01", readTime: "10 分钟", coverFrameId: "lane-letter", relatedTopicIds: ["warm-yellow", "red-danger"], sections: [
    { heading: "先决定谁是环境色", paragraphs: ["冷暖并置需要主次。大面积冷蓝可以定义夜雨环境，小面积暖黄再指出人物手中的线索；如果两种颜色面积、亮度和饱和度都相等，视线会失去明确顺序。", "环境色负责让世界成立，强调色负责让事件发生。分析时先忽略小面积亮色，确认主色是否已经建立空间，再观察强调色改变了什么。"], frameId: "lane-letter" },
    { heading: "色温边界可以代替门槛", paragraphs: ["人物从冷色街道走进暖色室内，即使画面没有门，观众也能理解空间身份发生变化。反过来，让人物停在冷暖交界处，可以表现迟疑、归属不明或两个时间层相遇。"], frameId: "teahouse-rain" },
    { heading: "反射让强调色脱离真实物体", paragraphs: ["霓虹在积水中的倒影可以比光源本身占据更大面积。强调色于是拥有第二条路径：它不直接照亮人物，却在人物脚下改变方向和危险感。利用反射时，需要控制哪一个版本更清晰。"], frameId: "lane-neon" },
    { heading: "调色练习：固定明度，只改变色温", paragraphs: ["为同一张画面制作三版：统一冷色、统一暖色、冷暖分区。尽量保持各区域明度不变，只比较色温变化。写下每一版中观众最先看的位置和对人物关系的判断，避免把结果简单归纳为“冷=悲伤、暖=幸福”。"] },
  ]},
];

export const filterGroups: { key: FilterKey; label: string; options: string[] }[] = [
  { key: "colors", label: "色彩", options: ["暖黄", "冷蓝", "红色", "绿色", "黑白", "低饱和", "高对比"] },
  { key: "compositions", label: "构图", options: ["中心", "对称", "三分法", "框架", "留白", "纵深", "倾斜"] },
  { key: "shotSize", label: "景别", options: ["特写", "近景", "中景", "全景", "远景"] },
  { key: "lights", label: "光线", options: ["自然光", "侧光", "逆光", "轮廓光", "霓虹", "烛光", "低调光"] },
  { key: "scenes", label: "场景", options: ["街道", "卧室", "茶馆", "餐厅", "车站", "列车", "汽车", "雨夜", "自然景观", "放映厅"] },
  { key: "moods", label: "情绪", options: ["孤独", "浪漫", "温暖", "压抑", "神秘", "怀旧", "紧张"] },
  { key: "time", label: "时间", options: ["清晨", "白天", "黄昏", "夜晚"] },
  { key: "region", label: "地区", options: ["中国南方", "中国东部", "中国北方", "中国沿海", "中国西南", "中国内陆"] },
  { key: "decade", label: "年代", options: ["2010年代", "2020年代"] },
];

export const getFilm = (slug: string) => films.find((item) => item.slug === slug);
export const getFrame = (slug: string) => publicFrames.find((item) => item.slug === slug);
export const getTopic = (slug: string) => topics.find((item) => item.slug === slug);
export const getFilmFrames = (filmSlug: string) => publicFrames.filter((item) => item.filmSlug === filmSlug);
export const getFrameFilm = (frame: Frame) => getFilm(frame.filmSlug);
