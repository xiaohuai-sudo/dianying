import type { Frame, VisualIndexGroup } from "./types";

export const visualIndex: VisualIndexGroup[] = [
  {
    slug: "color", title: "色彩", english: "COLOR", accent: "#C69A5B",
    overview: "色彩不负责给情绪贴标签，而是安排画面内部的亲疏、温度与注意力。分析时要同时观察色相、明度、饱和度和面积。",
    guidingQuestion: "如果把颜色暂时拿掉，这个画面的关系还成立吗？",
    terms: [
      { name: "暖黄", english: "Warm Amber", definition: "偏向黄、橙的低至中明度色域。", effect: "可以指向生活温度，也可以借旧木、尘埃和暗部表现陈旧与封闭。", watchFor: "观察暖色落在人物、空位还是环境上。", filterKey: "colors", filterValue: "暖黄", frameIds: ["teahouse-window", "cinema-booth"] },
      { name: "冷蓝", english: "Cool Blue", definition: "由蓝、青及其灰阶组成的冷色环境。", effect: "拉开人物与环境的距离，并让湿度、夜色和孤独更容易被感知。", watchFor: "区分冷色是环境主色，还是只存在于阴影。", filterKey: "colors", filterValue: "冷蓝", frameIds: ["lane-neon", "train-tunnel-reflection"] },
      { name: "叙事红", english: "Narrative Red", definition: "在相对克制的画面中作为强调色出现的红。", effect: "同时吸引与警告，让欲望、危险或记忆获得明确方向。", watchFor: "记录红色首次出现、消失和再次出现的位置。", filterKey: "colors", filterValue: "红色", frameIds: ["lane-neon", "cinema-seats"] },
      { name: "低饱和", english: "Low Saturation", definition: "色彩接近灰阶但仍保留色相倾向。", effect: "削弱即时刺激，让材质、时间感和微小色差承担更多叙事。", watchFor: "寻找画面中唯一略微鲜艳的物体。", filterKey: "colors", filterValue: "低饱和", frameIds: ["hill-fog", "summer-bedroom"] },
      { name: "高对比", english: "High Contrast", definition: "亮部与暗部之间存在明显明度落差。", effect: "快速建立视觉中心，也可能切断空间连续性，制造不安或仪式感。", watchFor: "判断暗部隐藏的是信息还是单纯背景。", filterKey: "colors", filterValue: "高对比", frameIds: ["teahouse-closing", "cinema-screen"] },
      { name: "冷暖并置", english: "Warm–Cool Contrast", definition: "同一画面中让冷暖色域保持可辨边界。", effect: "可区分室内外、当下与记忆、人物与环境，形成无需对白的关系线。", watchFor: "观察人物跨过色温边界时，情绪是否改变。", filterKey: "colors", filterValue: "暖黄", frameIds: ["lane-letter", "teahouse-rain"] },
    ],
  },
  {
    slug: "composition", title: "构图", english: "COMPOSITION", accent: "#7A8C84",
    overview: "构图决定观众先看什么、停留多久，以及人物与环境谁拥有更大力量。它不是静态规则，而是注意力的时间设计。",
    guidingQuestion: "视线进入画面后，被哪条线、哪块亮面或哪段距离接走？",
    terms: [
      { name: "中心构图", english: "Centered", definition: "主体或主要消失点接近画面几何中心。", effect: "产生稳定、注视与仪式感；主体过小时也会强化被环境包围的感受。", watchFor: "不要只找中心主体，也要看四周是否真正对称。", filterKey: "compositions", filterValue: "中心", frameIds: ["teahouse-closing", "cinema-seats"] },
      { name: "对称", english: "Symmetry", definition: "画面两侧在形状、重量或节奏上互相回应。", effect: "建立秩序；当人物行为偏离秩序时，冲突会被放大。", watchFor: "寻找破坏对称的唯一物体或动作。", filterKey: "compositions", filterValue: "对称", frameIds: ["train-aisle", "cinema-screen"] },
      { name: "三分法", english: "Rule of Thirds", definition: "把主体安排在横纵三分线及交点附近。", effect: "保留环境信息，并为人物目光或运动方向留下空间。", watchFor: "确认留出的空间是否与人物发生关系。", filterKey: "compositions", filterValue: "三分法", frameIds: ["summer-seawall", "lane-letter"] },
      { name: "框架", english: "Frame within Frame", definition: "利用门、窗、帘或镜面形成第二层画框。", effect: "把心理边界变成可见结构，也能延迟观众接近人物的时间。", watchFor: "比较人物是否共享同一个内部框架。", filterKey: "compositions", filterValue: "框架", frameIds: ["teahouse-window", "train-sleeping-coat"] },
      { name: "留白", english: "Negative Space", definition: "在主体之外保留大面积低信息区域。", effect: "制造等待、失衡与无回应感；方向明确时尤其容易表现孤独。", watchFor: "观察人物的脸或身体是否指向空处。", filterKey: "compositions", filterValue: "留白", frameIds: ["lane-umbrella", "hill-fog"] },
      { name: "倾斜线", english: "Diagonal", definition: "让建筑、地平线或物体边缘偏离稳定水平垂直。", effect: "增加方向冲突和身体感，适合表达不安、坡度与行动阻力。", watchFor: "追踪多组斜线是否汇向同一目标。", filterKey: "compositions", filterValue: "倾斜", frameIds: ["hill-stairs", "hill-letter"] },
    ],
  },
  {
    slug: "light", title: "光影", english: "LIGHT", accent: "#B77752",
    overview: "光线不仅让事物可见，也决定什么暂时不被看见。方向、软硬、反差和动机共同塑造信息出现的顺序。",
    guidingQuestion: "最亮处为什么在这里，而不是在人物脸上？",
    terms: [
      { name: "自然光", english: "Natural Light", definition: "以日光、天光或可被理解为自然来源的光为主。", effect: "保留时间与天气的连续感，让空间显得可居住且具体。", watchFor: "判断日光经过窗帘、雾气或墙面后发生了什么。", filterKey: "lights", filterValue: "自然光", frameIds: ["summer-bedroom", "hill-fog"] },
      { name: "侧光", english: "Side Light", definition: "光线从主体一侧进入，另一侧保留阴影。", effect: "突出体积和材质，并让人物同时拥有显露与隐藏的两面。", watchFor: "比较亮侧和暗侧分别面向谁。", filterKey: "lights", filterValue: "侧光", frameIds: ["teahouse-window", "hill-letter"] },
      { name: "逆光", english: "Backlight", definition: "主要光源位于主体后方并朝向镜头。", effect: "勾勒轮廓、显现雨雾尘埃，也会主动牺牲面部信息。", watchFor: "观察被照亮的是人物，还是人物周围的介质。", filterKey: "lights", filterValue: "逆光", frameIds: ["lane-neon", "summer-seawall"] },
      { name: "轮廓光", english: "Rim Light", definition: "沿主体边缘形成窄而清晰的亮线。", effect: "在深暗背景中证明人物存在，同时保留身份的不确定。", watchFor: "看轮廓在哪一处中断，以及中断隐藏了什么。", filterKey: "lights", filterValue: "轮廓光", frameIds: ["lane-umbrella", "cinema-booth"] },
      { name: "霓虹", english: "Neon", definition: "高色纯度、局部且常伴随反射的人造光。", effect: "将城市信息转化为颜色方向，适合制造诱惑、危险和空间层次。", watchFor: "避免只数颜色，先确定主色与叙事强调色。", filterKey: "lights", filterValue: "霓虹", frameIds: ["lane-neon"] },
      { name: "低调光", english: "Low-key", definition: "画面由暗部主导，只保留有限亮区。", effect: "限制信息、集中注意力，让等待和未知获得实质重量。", watchFor: "判断暗部是否仍保留层次与空间方向。", filterKey: "lights", filterValue: "低调光", frameIds: ["train-aisle", "cinema-booth"] },
    ],
  },
  {
    slug: "shot", title: "景别", english: "SHOT SIZE", accent: "#887B67",
    overview: "景别决定观众与人物的心理距离。它同时控制身体、动作、环境和细节各自能获得多少叙事空间。",
    guidingQuestion: "这个信息为什么必须从现在的距离被看见？",
    terms: [
      { name: "特写", english: "Close-up", definition: "让脸、手或关键物体占据画面主要面积。", effect: "迫使观众读取材质与细微变化，但也会暂时切断环境信息。", watchFor: "问清楚特写揭示了什么，又隐去了什么。", filterKey: "shotSize", filterValue: "特写", frameIds: ["lane-letter", "hill-letter"] },
      { name: "近景", english: "Medium Close-up", definition: "通常容纳人物头肩或与之相当的观察距离。", effect: "兼顾表情与少量空间关系，适合表现犹疑和倾听。", watchFor: "观察背景是否仍在影响人物。", filterKey: "shotSize", filterValue: "近景", frameIds: ["train-passing-field"] },
      { name: "中景", english: "Medium Shot", definition: "让人物动作、姿态和周围关键物体同时可读。", effect: "关系与行为获得平衡，日常空间中的距离变得清晰。", watchFor: "比较手势、视线和桌椅边界。", filterKey: "shotSize", filterValue: "中景", frameIds: ["teahouse-table", "summer-fan"] },
      { name: "全景", english: "Wide Shot", definition: "完整展示人物身体及其主要环境。", effect: "让空间成为叙事力量，人物选择会被路径和建筑条件约束。", watchFor: "先看环境如何安排人物，再看人物做什么。", filterKey: "shotSize", filterValue: "全景", frameIds: ["teahouse-window", "train-aisle"] },
      { name: "远景", english: "Long Shot", definition: "人物在大环境中只占很小比例。", effect: "强调尺度、方向和孤独，也适合交代旅程与命运感。", watchFor: "人物虽小，靠什么仍成为视觉中心？", filterKey: "shotSize", filterValue: "远景", frameIds: ["hill-stairs", "train-platform"] },
      { name: "景别转换", english: "Shot-size Progression", definition: "在一组镜头中有目的地改变观看距离。", effect: "靠近可增加信息压力，拉远则让事件重新归入环境和后果。", watchFor: "记录切近或拉远发生在动作之前还是之后。", filterKey: "shotSize", filterValue: "全景", frameIds: ["lane-letter", "lane-dawn"] },
    ],
  },
  {
    slug: "space", title: "空间", english: "SPACE", accent: "#687C78",
    overview: "空间分析关心人物能否抵达、是否被分隔，以及环境如何把动作变得容易或困难。纵深、遮挡和尺度比地点名称更重要。",
    guidingQuestion: "人物与目标之间，究竟隔着什么？",
    terms: [
      { name: "纵深", english: "Depth", definition: "通过前中后景和透视线建立可穿行的距离。", effect: "让观看成为一次进入过程，并把等待、追寻或离开具体化。", watchFor: "确认视线终点是否也是人物的行动目标。", filterKey: "compositions", filterValue: "纵深", frameIds: ["teahouse-closing", "lane-dawn"] },
      { name: "前景遮挡", english: "Foreground Occlusion", definition: "让门框、座椅或物体部分挡住主体。", effect: "增加窥视和阻隔感，并提醒观众自身的观看位置。", watchFor: "遮挡是稳定存在，还是随镜头运动变化。", filterKey: "compositions", filterValue: "框架", frameIds: ["teahouse-window", "train-aisle"] },
      { name: "重复空间", english: "Repetition", definition: "利用座椅、窗格或台阶形成连续视觉节奏。", effect: "建立制度与日常秩序，人物的微小偏离会因此更醒目。", watchFor: "寻找重复序列中的断点。", filterKey: "compositions", filterValue: "对称", frameIds: ["cinema-seats", "train-aisle"] },
      { name: "内外分层", english: "Interior–Exterior", definition: "用门窗、色温或曝光区分内部与外部。", effect: "把安全、欲望和未知分配到不同空间层。", watchFor: "人物站在哪一侧，又注视哪一侧。", filterKey: "compositions", filterValue: "框架", frameIds: ["teahouse-rain", "summer-bedroom"] },
      { name: "尺度反差", english: "Scale Contrast", definition: "让人物与建筑、天空或雾形成明显大小差异。", effect: "削弱人物控制力，把个人行为放进更长的时间与环境中。", watchFor: "主体依靠颜色、光线还是位置抵抗环境。", filterKey: "shotSize", filterValue: "远景", frameIds: ["hill-fog", "train-platform"] },
      { name: "不可达空间", english: "Inaccessible Space", definition: "画面呈现目标，却用距离、遮挡或暗部阻止抵达。", effect: "把愿望转化为空间问题，让悬念不依赖对白。", watchFor: "目标是否始终处在最亮或最深的位置。", filterKey: "compositions", filterValue: "纵深", frameIds: ["teahouse-closing", "train-platform"] },
    ],
  },
  {
    slug: "emotion", title: "情绪", english: "EMOTION", accent: "#A25448",
    overview: "情绪不是画面元素的固定译名，而是色彩、距离、光线和时间共同作用后的观看结果。同一种形式可以在不同语境中产生相反感受。",
    guidingQuestion: "情绪来自画面里有什么，还是来自它迟迟没有发生什么？",
    terms: [
      { name: "孤独", english: "Solitude", definition: "人物与回应、目标或共同空间之间持续断联。", effect: "常由方向明确的留白、尺度反差和不完整照明共同形成。", watchFor: "区分主动独处与被动隔绝。", filterKey: "moods", filterValue: "孤独", frameIds: ["lane-umbrella", "hill-fog"] },
      { name: "怀旧", english: "Nostalgia", definition: "现在的画面被时间痕迹与不可恢复感覆盖。", effect: "褪色、旧材质和持续运作的器物会让记忆获得触觉。", watchFor: "怀念的是人物、地点，还是一种观看方式。", filterKey: "moods", filterValue: "怀旧", frameIds: ["cinema-booth", "summer-fan"] },
      { name: "压抑", english: "Oppression", definition: "空间、明暗或构图持续限制人物行动与信息。", effect: "让观众感觉出口存在却难以抵达，形成身体性的停滞。", watchFor: "观察画面边界是否在视觉上向人物收紧。", filterKey: "moods", filterValue: "压抑", frameIds: ["teahouse-table", "summer-bedroom"] },
      { name: "神秘", english: "Mystery", definition: "关键因果被遮挡，但仍留下可追踪的视觉线索。", effect: "通过反射、逆光和半透明材质控制信息释放。", watchFor: "神秘感是否有明确问题，而非单纯看不清。", filterKey: "moods", filterValue: "神秘", frameIds: ["train-tunnel-reflection", "teahouse-rain"] },
      { name: "紧张", english: "Tension", definition: "画面内的方向、颜色或等待时间彼此冲突。", effect: "不需要快速动作，也能让观众预期某个变化即将发生。", watchFor: "找出画面中最不稳定的边缘或色块。", filterKey: "moods", filterValue: "紧张", frameIds: ["lane-letter", "train-aisle"] },
      { name: "温暖", english: "Tenderness", definition: "人物、光线与空间暂时形成可共享的节奏。", effect: "温暖可能来自共同动作和空气流动，而不一定依靠暖色。", watchFor: "先判断关系是否同步，再观察色温。", filterKey: "moods", filterValue: "温暖", frameIds: ["summer-fan", "summer-seawall"] },
    ],
  },
];

export function buildFrameStudy(frame: Frame) {
  return {
    observation: [
      `先定位人物：${frame.subjectPosition}。不要急着判断情绪，先比较人物与环境各自占据的面积。`,
      `再追踪视线：画面的视觉重心落在${frame.visualFocus}。观察构图线和明暗关系如何把注意力送到这里。`,
      `最后比较色彩与光线：${frame.palette.join("、")}构成主要色域，${frame.lightDirection}的${frame.lightQuality}决定哪些信息被保留。`,
    ],
    practice: [
      `分镜转译：保留“${frame.compositions.join("＋")}”的空间关系，先用黑白块面确认视觉重心，再决定色彩。`,
      `布光转译：从“${frame.lightDirection}”建立主光，控制为“${frame.lightQuality}”，避免为了照清人物而破坏暗部逻辑。`,
      `剪辑转译：把这个${frame.shotSize}与更近或更远的镜头配对，测试情绪来自信息增加，还是来自空间被重新看见。`,
    ],
    questions: [
      `如果移除“${frame.compositions[0]}”，人物关系会变得更亲近还是更疏远？`,
      `如果把主色改为互补色，“${frame.moods.join("、")}”是否仍然成立？`,
      `画面之外最可能存在什么声音，它会支持还是反驳当前视觉情绪？`,
    ],
  };
}
