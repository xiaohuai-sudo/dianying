import type { CopyrightInfo, Frame } from "./types";

type TechniqueKey = "frame" | "compression" | "detail" | "symmetry" | "reflection" | "diagonal" | "group" | "silhouette" | "negative" | "pattern";

interface FrameSpec {
  slug: string;
  title: string;
  description: string;
  focus: string;
  technique: TechniqueKey;
  shotSize?: Frame["shotSize"];
}

interface FilmDefaults {
  filmSlug: string;
  palette: string[];
  colors: string[];
  scenes: string[];
  moods: string[];
  time: string;
  region: string;
  decade: string;
}

const copyrightFor = (title: string): CopyrightInfo => ({
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
  addedDate: "2026-09-06",
  reviewStatus: "审核通过",
});

const techniques: Record<TechniqueKey, Pick<Frame, "compositions" | "shotSize" | "lights" | "lightDirection" | "lightQuality" | "subjectPosition"> & { analysis: string }> = {
  frame: {
    compositions: ["框架", "纵深"], shotSize: "全景", lights: ["侧光", "低调光"], lightDirection: "画外侧后方穿过门窗", lightQuality: "有明确来源的柔侧光，暗部保留层次", subjectPosition: "中后景，被前景结构包围",
    analysis: "门、窗或前景物形成第二层画框，视线必须穿过遮挡才能抵达动作；这种延迟把人物之间的心理边界变成可见的空间距离。",
  },
  compression: {
    compositions: ["三分法", "留白"], shotSize: "远景", lights: ["逆光", "轮廓光"], lightDirection: "人物或物体后方朝向镜头", lightQuality: "经雨雾或空气软化的背光", subjectPosition: "偏离中心的三分线附近",
    analysis: "长焦压缩让前后景看似靠近，却保留行动上的间隔；背光只勾出边缘，不替人物解释表情，使靠近与疏离能够同时存在。",
  },
  detail: {
    compositions: ["三分法", "倾斜"], shotSize: "特写", lights: ["侧光", "低调光"], lightDirection: "画面左上或右上方斜入", lightQuality: "集中而克制的擦边侧光", subjectPosition: "手或关键物位于三分交点",
    analysis: "近距离机位切断了环境说明，让材质、手势与微小位移承担叙事；斜侧光强化触感，也把动作之外的信息留在暗处。",
  },
  symmetry: {
    compositions: ["对称", "中心"], shotSize: "全景", lights: ["低调光", "自然光"], lightDirection: "画面轴线前后两端", lightQuality: "中心较亮、两侧缓慢衰减的柔光", subjectPosition: "靠近中央轴线，局部打破对称",
    analysis: "稳定轴线先建立秩序，人物或器物的轻微偏移随后成为最醒目的变化；对称不是装饰，而是用来衡量关系是否仍然同步。",
  },
  reflection: {
    compositions: ["框架", "三分法"], shotSize: "中景", lights: ["侧光", "低调光"], lightDirection: "画外实景与反射面形成交叉方向", lightQuality: "反射补光叠加局部实景光", subjectPosition: "实景与倒影分处画面两层",
    analysis: "玻璃或积水把同一动作拆成实景与倒影，两层信息略微错位；观众会在辨认真实位置的同时感到人物记忆和当下并不完全重合。",
  },
  diagonal: {
    compositions: ["倾斜", "纵深"], shotSize: "全景", lights: ["侧光", "自然光"], lightDirection: "顺着建筑或路径从侧上方进入", lightQuality: "方向清晰、亮暗过渡受控的侧光", subjectPosition: "沿斜线方向分布在中景",
    analysis: "台阶、道路或运动轨迹形成连续斜线，让身体必须对抗画面的方向；侧光进一步强调坡度和材质，使行动的难度能够被观看者直接感到。",
  },
  group: {
    compositions: ["三分法", "纵深"], shotSize: "中景", lights: ["自然光", "侧光"], lightDirection: "人物共同面对的侧后方", lightQuality: "柔和包裹的自然光与暖色反射光", subjectPosition: "两人或多人形成稳定三角关系",
    analysis: "人物不是并排摆放，而是由递、扶、等候等动作连成同一几何关系；共享光区把情感落在身体距离和动作节奏上，而非依赖清晰表情。",
  },
  silhouette: {
    compositions: ["中心", "留白"], shotSize: "远景", lights: ["逆光", "轮廓光"], lightDirection: "主体正后方朝向镜头", lightQuality: "柔和环境背光配合窄轮廓亮边", subjectPosition: "留白中的小尺度主体",
    analysis: "逆光主动放弃面部信息，只保留身体方向和人与人之间的距离；大片留白扩大了动作的余韵，让情绪先于身份被观看者感知。",
  },
  negative: {
    compositions: ["留白", "三分法"], shotSize: "全景", lights: ["自然光", "低调光"], lightDirection: "空间边缘向主体缓慢铺开", lightQuality: "低反差漫射光，局部暖色作为视觉锚点", subjectPosition: "画面边缘或下方，占比较小",
    analysis: "大面积低信息区域没有被当作背景浪费，而是成为等待和未回应的可见尺度；唯一较亮处负责引导视线，却不急于给出答案。",
  },
  pattern: {
    compositions: ["对称", "纵深"], shotSize: "中景", lights: ["侧光", "低调光"], lightDirection: "沿重复物体侧面掠过", lightQuality: "能显出材质起伏的擦边光", subjectPosition: "重复序列中的断点位置",
    analysis: "座椅、窗格或器物的重复先制造日常秩序，缺口与错位便因此被放大；擦边光让每一次重复都有细微差别，避免画面沦为平面图案。",
  },
};

const buildFrames = (defaults: FilmDefaults, specs: FrameSpec[]): Frame[] => specs.map((spec) => {
  const technique = techniques[spec.technique];
  return {
    slug: spec.slug,
    filmSlug: defaults.filmSlug,
    title: spec.title,
    image: `/images/frames/${spec.slug}.png`,
    alt: `${spec.description}，画面不出现清晰可辨的真实人物面容`,
    palette: defaults.palette,
    colors: defaults.colors,
    compositions: technique.compositions,
    shotSize: spec.shotSize ?? technique.shotSize,
    lights: technique.lights,
    lightDirection: technique.lightDirection,
    lightQuality: technique.lightQuality,
    subjectPosition: technique.subjectPosition,
    visualFocus: spec.focus,
    scenes: defaults.scenes,
    moods: defaults.moods,
    time: defaults.time,
    region: defaults.region,
    decade: defaults.decade,
    analysis: `${spec.description}。${technique.analysis}镜头把“${spec.focus}”设为第一视觉重心，并让光线沿动作方向完成明暗过渡。这样的安排不是只为制造气氛：构图先提示人物处境，光线再决定哪些信息被看见，最终把一个日常瞬间转化为具有前因与余韵的叙事停顿。`,
    copyright: copyrightFor(spec.title),
  };
});

const teahouseDefaults: FilmDefaults = { filmSlug: "southern-teahouse", palette: ["#C69A5B", "#806B4E", "#35544C", "#1A1A17"], colors: ["暖黄", "绿色", "低饱和"], scenes: ["茶馆", "雨夜"], moods: ["怀旧", "温暖"], time: "黄昏", region: "中国南方", decade: "2010年代" };
const teahouseSpecs: FrameSpec[] = [
  { slug:"teahouse-porcelain-shelf", title:"缺了一只的杯架", description:"瓷杯在旧木架上排列，中央留下一个深色空位", focus:"重复白瓷中的暗色缺口", technique:"pattern" },
  { slug:"teahouse-tea-leaves", title:"雨水里的茶叶", description:"两双手在竹匾上共同拣选被雨打湿的茶叶", focus:"交叠手势与湿叶高光", technique:"detail" },
  { slug:"teahouse-back-door", title:"半开的后门", description:"茶馆后门只开一半，冷雨巷与室内暖光彼此切开", focus:"门缝尽头的雨巷亮面", technique:"frame" },
  { slug:"teahouse-ledger-book", title:"没有写完的账页", description:"无文字账本、算盘与茶杯停在雨窗旁", focus:"空白纸面和窗上水痕", technique:"detail" },
  { slug:"teahouse-stacked-chairs", title:"叠椅上的斜光", description:"打烊后的木椅高高叠起，窗格光斜落在空地上", focus:"暖色光块与倾斜椅脚", technique:"diagonal" },
  { slug:"teahouse-wet-steps", title:"通向河边的湿阶", description:"石阶向河面延伸，一把遗落的伞停在中段", focus:"伞与水边消失点", technique:"diagonal" },
  { slug:"teahouse-river-ferry", title:"窗外的渡船", description:"空茶桌之外，雨中渡船被两层木窗框包围", focus:"窗格之间的远处渡船", technique:"frame" },
  { slug:"teahouse-empty-counter", title:"无人应答的长柜", description:"长柜上杯盏整齐排开，湿布停在最靠近镜头处", focus:"杯列尽头的空位置", technique:"pattern" },
  { slug:"teahouse-bamboo-shadow", title:"竹影落在两只杯上", description:"两只茶杯靠近摆放，竹帘阴影把桌面分成明暗两侧", focus:"杯缘相接处的细窄亮线", technique:"symmetry" },
  { slug:"teahouse-courtyard-lantern", title:"院灯与雨幕", description:"暖灯占据近景，远处人物隔着竹帘站在雨院中", focus:"灯火与后景轮廓的冷暖距离", technique:"compression" },
  { slug:"teahouse-ceiling-fan", title:"风扇下的停顿", description:"旧吊扇悬在空茶室上方，人物缩在长廊尽头", focus:"扇叶放射线与远端人影", technique:"symmetry" },
  { slug:"teahouse-rain-gutter", title:"檐水之外", description:"雨水从瓦檐倾下，远处门内仍亮着一盏灯", focus:"雨帘后方的暖色门洞", technique:"compression" },
  { slug:"teahouse-kitchen-fire", title:"炉边递过铜壶", description:"两双手在小煤炉旁交接一只冒汽铜壶", focus:"壶把与手指形成的交点", technique:"detail" },
  { slug:"teahouse-bridge-view", title:"两重门外的桥", description:"石桥被茶馆两重门框收进同一条视线", focus:"门框深处共伞过桥的人", technique:"frame" },
  { slug:"teahouse-folded-apron", title:"收起的围裙", description:"折好的围裙和钥匙留在木凳上，湿地映出窄门", focus:"钥匙反光与门的倒影", technique:"reflection" },
  { slug:"teahouse-window-candle", title:"窗边那支蜡烛", description:"雨窗前的蜡烛照着一对相邻座位，后景人物轻轻靠近", focus:"烛火与两道肩线", technique:"compression" },
  { slug:"teahouse-noon-guests", title:"屏风之间的午客", description:"三位茶客分坐屏风之间，却共享同一壶茶", focus:"跨过竖框的递茶动作", technique:"group" },
  { slug:"teahouse-hanging-baskets", title:"茶篮下的走廊", description:"悬挂竹篮形成层层圆框，送水者从尽头走来", focus:"圆形前景与人物手中亮壶", technique:"frame" },
  { slug:"teahouse-floor-reflection", title:"地上的第二个房间", description:"湿地映出窗格和椅子，两双脚从倒影上交错经过", focus:"脚步与倒置窗格的交点", technique:"reflection" },
  { slug:"teahouse-river-mist", title:"两杯茶看向雾河", description:"河雾占满露台之外，两只杯在空桌上彼此靠近", focus:"杯间窄缝与无边雾面", technique:"negative" },
  { slug:"teahouse-broken-screen", title:"裂开的屏风", description:"近乎对称的屏风从中央裂开，暖光由裂缝进入", focus:"破坏秩序的斜向亮缝", technique:"symmetry" },
  { slug:"teahouse-stair-storage", title:"后仓的陡梯", description:"狭窄木梯通向仓房，两人在高低位置传递茶罐", focus:"沿梯级向上的双手", technique:"diagonal" },
  { slug:"teahouse-kettle-row", title:"壶列中的空位", description:"铜壶沿炉台重复排开，中央少了一只", focus:"蒸汽之间的空缺", technique:"pattern" },
  { slug:"teahouse-last-customer", title:"最后一桌客人", description:"店员在近景收椅，远处最后两位客人仍并肩坐着", focus:"收拢椅背后的相邻人影", technique:"compression" },
  { slug:"teahouse-dawn-delivery", title:"清晨第一趟送茶", description:"两人从院门内外接过自行车上的茶篓", focus:"门框中央交接的竹篓", technique:"group" },
];

const laneDefaults: FilmDefaults = { filmSlug: "after-the-rain-lane", palette: ["#17384B", "#557A86", "#A74B3F", "#111820"], colors: ["冷蓝", "红色", "高对比"], scenes: ["街道", "雨夜"], moods: ["神秘", "紧张"], time: "夜晚", region: "中国东部", decade: "2020年代" };
const laneSpecs: FrameSpec[] = [
  { slug:"lane-laundry-rain", title:"雨线穿过晾衣巷", description:"湿衣在窄巷前景摇摆，远处人物从布料缝隙经过", focus:"衣料遮挡间的背影", technique:"frame" },
  { slug:"lane-stair-lamp", title:"转角壁灯", description:"陡峭外梯折向暗处，人物停在唯一壁灯下", focus:"斜梯与暖色停顿点", technique:"diagonal" },
  { slug:"lane-doorway-shadow", title:"先抵达的影子", description:"门内人物尚未出现，长影已经越过湿石路", focus:"从门槛延伸的影子尖端", technique:"negative" },
  { slug:"lane-umbrella-rack", title:"红伞留在最后", description:"深色雨伞重复排列，唯一红伞从队列中突出", focus:"暗色重复中的红色断点", technique:"pattern" },
  { slug:"lane-puddle-footsteps", title:"倒影上的脚步", description:"两人的脚步从积水中交错，人物上半身留在画外", focus:"涟漪切开的冷暖倒影", technique:"reflection" },
  { slug:"lane-red-window", title:"雨巷上方的红窗", description:"空巷上方只有一扇红窗亮着，人物在下方等待", focus:"大片冷暗中的小块红光", technique:"negative" },
  { slug:"lane-repair-shop", title:"磨砂玻璃后的修理铺", description:"修伞人的手影隔着磨砂门与门外来客重叠", focus:"玻璃两侧接近的手影", technique:"frame" },
  { slug:"lane-narrow-bridge", title:"桥的两端", description:"两个人分站小桥两端，雨水在中央流过", focus:"人物之间最暗的桥心", technique:"symmetry" },
  { slug:"lane-drain-water", title:"水流带走一只鞋", description:"暴雨水流绕过遗落的鞋卷入街边排水口", focus:"旋转水纹与静止鞋尖", technique:"detail" },
  { slug:"lane-fog-corner", title:"雾里先出现车灯", description:"转角人物尚未露面，单车灯束先切入浓雾", focus:"雾中偏离中心的光锥", technique:"silhouette" },
  { slug:"lane-paper-boat", title:"纸船驶向红光", description:"小纸船沿路缘漂向一段破碎红色倒影", focus:"水沟的弯曲引导线", technique:"detail" },
  { slug:"lane-midnight-taxi", title:"巷口未熄的车灯", description:"无标识车辆停在巷口，司机只留下暗色轮廓", focus:"雨中光束与前景伞缘", technique:"compression" },
  { slug:"lane-handrail", title:"向下的扶手", description:"湿扶手通往地下通道，一只手从画面边缘伸入", focus:"扶手尽头不可见的黑暗", technique:"diagonal" },
  { slug:"lane-blue-stairs", title:"蓝色楼梯间", description:"街门内的蓝色台阶向上延伸，暖光停在门槛", focus:"冷暖边界处的第一阶", technique:"frame" },
  { slug:"lane-street-mirror", title:"街角镜中的来人", description:"凸面镜先映出转角人物，现实街面仍然空着", focus:"圆形镜框里的缩小身影", technique:"reflection" },
  { slug:"lane-raincoat-back", title:"透明雨衣的背面", description:"人物背对镜头离开，雨衣边缘被后方灯光勾亮", focus:"肩部轮廓与密集雨丝", technique:"silhouette" },
  { slug:"lane-empty-cafe", title:"雾窗里的一杯茶", description:"深夜小店无人，唯一茶杯停在暖灯下", focus:"街道倒影覆盖的桌面光区", technique:"reflection" },
  { slug:"lane-wet-newspaper", title:"被水折起的纸页", description:"无字纸页贴在路缘，行人脚步从后景掠过", focus:"湿纸纤维与运动脚影", technique:"detail" },
  { slug:"lane-tunnel-exit", title:"隧道尽头的白雨", description:"人物沿狭长地下通道走向过曝般的雨口", focus:"消失点内的小尺度剪影", technique:"symmetry" },
  { slug:"lane-overhead-wires", title:"雨线与电线", description:"密集电线斜穿屋顶，一扇暖窗压在画面下方", focus:"冷天空中的暖色窗口", technique:"diagonal" },
  { slug:"lane-doorstep-flowers", title:"门槛上的白花", description:"雨打白花留在门前，门内两人正在收伞", focus:"白花与后景暖色手势", technique:"compression" },
  { slug:"lane-dawn-cleaner", title:"扫去最后的霓虹", description:"清晨清洁者把湿地上的彩色反光扫散", focus:"扫帚弧线与消退倒影", technique:"reflection" },
  { slug:"lane-river-underpass", title:"水淹过的桥下", description:"积水复制柱廊，一人扶着单车涉向出口", focus:"水面轴线与出口亮方框", technique:"symmetry" },
  { slug:"lane-tram-reflection", title:"水里的末班车", description:"无标识车辆只以拉长倒影经过，行人脚步横向切入", focus:"倒置车影与现实脚步", technique:"reflection" },
  { slug:"lane-window-condensation", title:"擦开一小块窗雾", description:"手在雾窗上擦出圆形视野，另一人从雨巷走近", focus:"透明圆洞里的来人", technique:"detail" },
];

const trainDefaults: FilmDefaults = { filmSlug: "night-train", palette: ["#253E45", "#637C76", "#B09B64", "#11151A"], colors: ["冷蓝", "绿色", "低饱和"], scenes: ["列车", "车站"], moods: ["神秘", "孤独"], time: "夜晚", region: "中国北方", decade: "2010年代" };
const trainSpecs: FrameSpec[] = [
  { slug:"train-corridor-curtain", title:"呼吸的车厢帘", description:"走廊帘布随列车摆动，破坏两侧门框的严格重复", focus:"对称轴上偏离的帘角", technique:"symmetry" },
  { slug:"train-compartment-table", title:"窗边两杯热茶", description:"两张相对座椅之间摆着热茶，窗外蓝夜快速后退", focus:"桌面暖光与玻璃冷影", technique:"symmetry" },
  { slug:"train-sleeping-coat", title:"像人影的外套", description:"一件外套悬在卧铺门旁，远看近似沉默旅客", focus:"门框内模糊的人形轮廓", technique:"frame" },
  { slug:"train-brake-light", title:"最后一节车的红灯", description:"红色尾灯在雨夜铁轨上缩成唯一亮点", focus:"蓝黑空间里的红色信号", technique:"compression" },
  { slug:"train-washroom-mirror", title:"镜里空着的走廊", description:"窄镜映出身后空廊，人物肩部停在现实画面边缘", focus:"镜框深处的无人消失点", technique:"reflection" },
  { slug:"train-coupling-gap", title:"车厢连接处", description:"两节车厢之间的金属踏板在速度中持续震动", focus:"斜向轨道与明暗闪动", technique:"diagonal" },
  { slug:"train-passing-field", title:"窗外退去的田野", description:"旅客剪影与月下田野在车窗玻璃中重叠", focus:"侧脸轮廓和横向光带", technique:"reflection", shotSize:"近景" },
  { slug:"train-tea-carriage", title:"摇晃中倒满的茶", description:"列车晃动时，两双手共同扶稳茶杯和水壶", focus:"倾斜水线与相接手指", technique:"detail" },
  { slug:"train-station-bench", title:"短暂停靠的空椅", description:"空站椅隔着车窗出现，车内灯影覆盖其上", focus:"玻璃倒影中的空座", technique:"reflection" },
  { slug:"train-ticket-hand", title:"没有字的车票", description:"一只手把空白票递向走廊深处的另一只手", focus:"手势之间的小段距离", technique:"detail" },
  { slug:"train-window-condensation", title:"玻璃上的两枚手印", description:"两枚手印在雾窗上重叠，站台灯在其后散开", focus:"手印之间未完全重合的边缘", technique:"detail" },
  { slug:"train-overhead-fan", title:"风扇与沉睡者", description:"旧风扇悬在成排旅客剪影上方，灯光间隔闪过", focus:"放射扇叶与重复肩线", technique:"pattern" },
  { slug:"train-empty-berth", title:"上铺仍然空着", description:"上铺床单平整，下铺帘布却完全合拢", focus:"上下两个矩形的明暗反差", technique:"frame" },
  { slug:"train-dining-lamp", title:"一盏灯分开的两人", description:"两位旅客相对而坐，暖灯只照亮桌面中央", focus:"灯下共享却未触碰的手", technique:"symmetry" },
  { slug:"train-suitcase-handle", title:"刹车时握紧的提手", description:"列车减速，一只手在走廊暗处握紧旧箱提手", focus:"发白指节与晃动背景", technique:"detail" },
  { slug:"train-conductor-door", title:"磨砂门后的列车员", description:"列车员轮廓隔着磨砂端门停在光线后方", focus:"玻璃中的人影与门把", technique:"frame" },
  { slug:"train-tunnel-reflection", title:"隧道把窗变成镜子", description:"列车进入隧道后，黑窗突然映出乘客与空座", focus:"倒影中唯一空着的位置", technique:"reflection" },
  { slug:"train-bridge-crossing", title:"钢桥掠过车窗", description:"桥梁竖杆在连续车窗前形成闪动节奏", focus:"冷色竖线切过暖色人物", technique:"pattern" },
  { slug:"train-red-signal", title:"睡梦旁的红色信号", description:"旅客靠窗睡着，远处红灯停在其轮廓旁", focus:"侧脸暗线与红色小点", technique:"compression" },
  { slug:"train-dawn-carriage", title:"灯熄灭后的蓝晨", description:"天光进入空车厢，顶灯沿纵深逐盏暗下", focus:"明暗灯列汇向的远门", technique:"symmetry" },
  { slug:"train-sleeping-passengers", title:"交替亮起的睡脸", description:"旅客成排沉睡，灯光只轮流扫过肩背轮廓", focus:"重复人影中的空座断点", technique:"pattern" },
  { slug:"train-corridor-end", title:"行李停在走廊中央", description:"长廊尽头透出白光，一只旧箱停在半途", focus:"消失点前的孤立箱体", technique:"symmetry" },
  { slug:"train-platform-farewell", title:"玻璃两侧的手", description:"车内外两人隔着玻璃抬手，掌心在倒影中接近", focus:"竖框两侧相对的手势", technique:"reflection" },
  { slug:"train-final-station", title:"终点站的暖门", description:"晨雾站台上只有一扇车门发亮，旅客从远处靠近", focus:"雾中人物与暖门间的距离", technique:"compression" },
  { slug:"train-luggage-shadow", title:"行李架上的影子", description:"车外光带让行李阴影在墙面缓慢移动", focus:"看不见主人却持续移动的暗影", technique:"negative" },
];

const summerDefaults: FilmDefaults = { filmSlug: "humid-summer", palette: ["#D9B071", "#E3C795", "#809780", "#4E665F"], colors: ["暖黄", "绿色", "低饱和"], scenes: ["街道", "自然景观"], moods: ["温暖", "浪漫"], time: "黄昏", region: "中国沿海", decade: "2020年代" };
const summerSpecs: FrameSpec[] = [
  { slug:"summer-screen-door", title:"替你扶住纱门", description:"一人扶门、一人端果盘进屋，两只手在门边短暂靠近", focus:"纱网前交错的手势", technique:"group" },
  { slug:"summer-cicada-wall", title:"一起收集蝉蜕", description:"两个孩子背对镜头分享玻璃罐与墙上的蝉蜕", focus:"共同托住的透明小罐", technique:"group" },
  { slug:"summer-water-tank", title:"屋顶接过一桶水", description:"邻居在夕阳下跨过水箱传递水桶", focus:"被逆光照亮的桶沿和手臂", technique:"group" },
  { slug:"summer-bicycle-seawall", title:"沿海堤共骑", description:"两位朋友共乘单车，衣角在暖风中向后扬起", focus:"重叠背影与延伸海岸线", technique:"compression" },
  { slug:"summer-afternoon-nap", title:"蚊帐里的午睡", description:"一老一少在半透明蚊帐后并肩午睡", focus:"轻纱后的两道呼吸轮廓", technique:"frame" },
  { slug:"summer-ice-block", title:"从柜台推来的冰", description:"店主把包好的冰块推向等待者，双手在冷光旁相遇", focus:"暖室中的透明冷色高光", technique:"detail" },
  { slug:"summer-fishing-net", title:"一起补完这张网", description:"两个人在门廊上并肩修补渔网", focus:"网眼之间同步移动的手", technique:"group" },
  { slug:"summer-school-corridor", title:"走廊里的折纸", description:"两名学生在空走廊交换一张没有文字的折纸", focus:"窗光条纹中的递纸动作", technique:"group" },
  { slug:"summer-seaside-arcade", title:"共用一把纸扇", description:"一家人穿过海边骑楼，共享一把轻轻摇动的纸扇", focus:"相互靠近的肩部节奏", technique:"group" },
  { slug:"summer-rain-sandals", title:"门口并排的凉鞋", description:"两双凉鞋留在雨门边，两个人影在暖室内靠近", focus:"前景鞋尖与后景笑影", technique:"compression" },
  { slug:"summer-rooftop-radio", title:"把频道调到一起", description:"两人在屋顶共同调节无标识旧收音机", focus:"旋钮上相邻的两只手", technique:"detail" },
  { slug:"summer-storm-cloud", title:"暴雨前靠近一点", description:"乌云压近海面，檐下人物把身边孩子轻轻揽近", focus:"冷云下的暖色手臂", technique:"negative" },
  { slug:"summer-mango-table", title:"桌上最后一块芒果", description:"家人从不同方向伸手分享一盘切好的芒果", focus:"围成圆形的手与金黄果肉", technique:"group" },
  { slug:"summer-mosquito-net", title:"替你掖好蚊帐", description:"一人俯身替休息者整理半透明蚊帐", focus:"薄纱上暖光包围的手", technique:"frame" },
  { slug:"summer-alley-sprinkler", title:"一起跑过水幕", description:"两个孩子背对镜头跑过庭院水雾", focus:"逆光水滴中的牵手动作", technique:"compression" },
  { slug:"summer-sun-curtain", title:"教你别好窗帘", description:"年长的手带着年轻的手固定被阳光照透的窗帘", focus:"布料斜线上的两只手", technique:"detail" },
  { slug:"summer-sea-bus", title:"靠窗共享一首歌", description:"海边巴士上两名乘客背对镜头分享耳机", focus:"窗光包裹的相邻肩线", technique:"frame" },
  { slug:"summer-rusted-goal", title:"翻过旧球门", description:"三位朋友相互扶持攀过海边生锈球门", focus:"低角度天空中的牵拉手势", technique:"group" },
  { slug:"summer-laundry-roof", title:"一张床单跨过屋顶", description:"邻居隔着屋顶共同展开一张被夕阳照透的白布", focus:"连接两栋房屋的发光布面", technique:"compression" },
  { slug:"summer-tide-pools", title:"跨过潮池的手", description:"大人牵着孩子越过潮池，动作同时落进水中倒影", focus:"真实与倒影重合的双手", technique:"reflection" },
  { slug:"summer-night-balcony", title:"阳台上一起剥果子", description:"两代人肩并肩坐在夜阳台分享水果", focus:"两人之间的小灯与果皮", technique:"group" },
  { slug:"summer-power-return", title:"灯亮起来的时候", description:"停电结束，家人围着重新亮起的灯相互靠近", focus:"中央暖灯外环绕的肩与手", technique:"symmetry" },
  { slug:"summer-dawn-harbor", title:"清晨传上来的鱼篓", description:"船上与岸上的两人协力把鱼篓递上码头", focus:"斜向手臂连接的竹篓", technique:"group" },
  { slug:"summer-farewell-bus", title:"车窗两侧的掌心", description:"离别者与乘客隔着玻璃抬手，掌心在反射里贴近", focus:"玻璃中央几乎重合的手", technique:"reflection" },
  { slug:"summer-taped-window", title:"风暴前一起贴窗", description:"两个人在屋内共同给窗户贴上防风胶带", focus:"交叉斜线之间协作的手", technique:"diagonal" },
];

const hillDefaults: FilmDefaults = { filmSlug: "letters-from-hill-city", palette: ["#B07A58", "#C2A57B", "#6C7775", "#343B3C"], colors: ["暖黄", "低饱和", "红色"], scenes: ["街道", "自然景观"], moods: ["温暖", "怀旧"], time: "黄昏", region: "中国西南", decade: "2010年代" };
const hillSpecs: FrameSpec[] = [
  { slug:"hill-funicular-shadow", title:"缆车窗边的两个人", description:"两位乘客背对镜头靠向同一扇雾窗", focus:"移动缆线影下的相邻肩部", technique:"frame" },
  { slug:"hill-cliff-houses", title:"隔楼递来的菜篮", description:"邻居跨过狭窄楼隙传递竹篮", focus:"建筑负空间中相接的手臂", technique:"compression" },
  { slug:"hill-rooftop-mail", title:"屋顶上的那封信", description:"信件从邮差手中交到等待者手里", focus:"栏杆引向的空白信封", technique:"group" },
  { slug:"hill-tunnel-stairs", title:"牵手走出长梯", description:"一大一小牵手沿隧道台阶走向暖色出口", focus:"暗框中的相连剪影", technique:"silhouette" },
  { slug:"hill-red-door", title:"替淋雨的人开门", description:"居民扶住红门，让湿透的送信者进入暖室", focus:"冷雨与暖门之间的邀请手势", technique:"frame" },
  { slug:"hill-bridge-stairs", title:"隔着栏杆递水", description:"两位朋友在高低不同的桥梯上共享一只水壶", focus:"斜栏之间伸出的双手", technique:"diagonal" },
  { slug:"hill-fog-market", title:"雾来前撑起棚布", description:"摊主们合力在雾中拉开半透明雨棚", focus:"多人手臂形成的稳定三角", technique:"group" },
  { slug:"hill-stair-window", title:"隔窗回应的挥手", description:"孩子从暖窗内挥手，送信者在外梯停下回应", focus:"玻璃两侧方向相反的手", technique:"frame" },
  { slug:"hill-postal-satchel", title:"接过旧邮包", description:"两双手在斜光里传递磨损的邮差包", focus:"连接画面两侧的皮带", technique:"detail" },
  { slug:"hill-rain-gutter", title:"雨里一起修屋檐", description:"两个人在檐下合力扶稳溢水的雨槽", focus:"逆光雨水旁的协作手势", technique:"group" },
  { slug:"hill-stone-arch", title:"石拱下共一把伞", description:"两位行人紧靠在同一把伞下穿过石拱", focus:"拱框内合并的人物轮廓", technique:"frame" },
  { slug:"hill-zigzag-road", title:"弯道上的指引", description:"居民在陡坡弯道给无标识车辆指路", focus:"手势与道路转折的交点", technique:"diagonal" },
  { slug:"hill-rooftop-water", title:"屋顶上的接力", description:"邻居跨越多层屋顶逐个传递水桶", focus:"重复手臂连接的斜向节奏", technique:"group" },
  { slug:"hill-old-elevator", title:"替老人扶住铁门", description:"两位乘客共同为长者扶住旧电梯门", focus:"竖直铁格中的三组手", technique:"pattern" },
  { slug:"hill-alley-laundry", title:"巷子上空的白布", description:"不同阳台的邻居共同折叠一张大床单", focus:"跨过楼隙的明亮布面", technique:"compression" },
  { slug:"hill-wall-number", title:"在旧墙前问路", description:"来客比对无文字墙牌，居民抬手指向坡上", focus:"斜光墙纹与指路动作", technique:"detail" },
  { slug:"hill-terraced-lights", title:"逐层亮起的院灯", description:"家人在层叠院落里依次点亮小灯", focus:"沿台阶上升的暖色光点", technique:"pattern" },
  { slug:"hill-cable-shadow", title:"追着缆车影子跑", description:"两个孩子背对镜头追逐爬上墙面的缆车影", focus:"同步手势与移动斜影", technique:"diagonal" },
  { slug:"hill-fog-bridge", title:"雾桥中央的包裹", description:"两人在雾中桥心交换一只无标识包裹", focus:"水平桥面中央的递交动作", technique:"compression" },
  { slug:"hill-uphill-bus", title:"上车时拉住的手", description:"车内乘客伸手稳住正在登上坡地巴士的朋友", focus:"暖门光里的相握手腕", technique:"group" },
  { slug:"hill-letter-bundle", title:"一起捆好的信", description:"几双手在木桌上把空白信封整理成束", focus:"围绕纸束的圆形手势", technique:"detail" },
  { slug:"hill-empty-bench", title:"靠在一起的两只杯", description:"山城长椅无人，两只保温杯仍紧靠在夕阳里", focus:"空座中央相触的杯壁", technique:"negative" },
  { slug:"hill-dusk-rooftops", title:"屋顶挂起一盏灯", description:"两个人在暮色屋顶共同挂起小灯", focus:"相接手臂顶端的暖光", technique:"group" },
  { slug:"hill-morning-smoke", title:"隔着阳台递早餐", description:"邻居穿过晨炊烟雾传递早餐", focus:"蒸汽里相遇的碗与手", technique:"compression" },
  { slug:"hill-last-delivery", title:"最后一级台阶上喝茶", description:"送信者与收信人并肩坐在高处台阶分享热茶", focus:"两人之间的灯与茶杯", technique:"group" },
];

const cinemaDefaults: FilmDefaults = { filmSlug: "empty-cinema", palette: ["#8A332D", "#C08A4E", "#50312D", "#111014"], colors: ["暖黄", "红色", "高对比"], scenes: ["放映厅"], moods: ["温暖", "怀旧"], time: "夜晚", region: "中国内陆", decade: "2020年代" };
const cinemaSpecs: FrameSpec[] = [
  { slug:"cinema-ticket-stub", title:"票窗里递来的旧票", description:"年长的手把一张空白票根递给年轻的手", focus:"票窗暗框中交接的纸片", technique:"detail" },
  { slug:"cinema-velvet-seat", title:"一起补好红座椅", description:"两位工作人员共同缝补一张磨损座椅", focus:"重复红椅中的四只手", technique:"pattern" },
  { slug:"cinema-booth-window", title:"第一次看见光束", description:"老放映员隔着机房窗向身旁孩子指向放映光", focus:"一大一小两道背影与光束", technique:"frame" },
  { slug:"cinema-film-strip", title:"灯箱上的空白胶片", description:"两双手在暖灯箱上共同检查无图像胶片", focus:"斜向胶片连接的手势", technique:"detail" },
  { slug:"cinema-exit-door", title:"替最后的观众留门", description:"引座员扶住没有标识的门，让观众依次走向暖光", focus:"深蓝走廊里的暖色门洞", technique:"frame" },
  { slug:"cinema-stage-dust", title:"拉幕时扬起的尘", description:"两个人从舞台两侧共同拉开厚重红幕", focus:"幕布之间喷出的金色光尘", technique:"symmetry" },
  { slug:"cinema-ceiling-light", title:"换下最后一只灯泡", description:"一人扶梯、一人在高处更换厅灯", focus:"放射天花线条中央的暖灯", technique:"group" },
  { slug:"cinema-empty-balcony", title:"空楼座里的热茶", description:"两位朋友坐在空楼座后排共享一只保温壶", focus:"相邻背影之间的暖色茶壶", technique:"compression" },
  { slug:"cinema-curtain-rope", title:"一起拉动旧幕", description:"两位成年引座员共同操作深红色幕布拉绳", focus:"斜绳上彼此靠近的手", technique:"detail" },
  { slug:"cinema-projector-lens", title:"光束开始的地方", description:"两位成年技术人员背对镜头观察放映机第一束光", focus:"圆形镜头与肩部暖色轮廓", technique:"frame" },
  { slug:"cinema-lobby-mirror", title:"镜前替你整理衣领", description:"两位离场观众在旧镜前互相整理外套", focus:"镜面内外重复的温柔手势", technique:"reflection" },
  { slug:"cinema-torn-ticket", title:"拼回两半票根", description:"两只成年人的手把无文字票根两半重新合在一起", focus:"纸边即将接合的细缝", technique:"detail" },
  { slug:"cinema-cleaning-bucket", title:"映着廊灯的水桶", description:"两位清洁人员在湿地上交接拖把", focus:"倒影灯列与横向递物动作", technique:"reflection" },
  { slug:"cinema-reel-canister", title:"共同收起片盒", description:"放映员合力把无标识金属片盒叠上旧架", focus:"重复圆形中被托起的一只", technique:"pattern" },
  { slug:"cinema-emergency-light", title:"暗廊里的一盏小灯", description:"两位观众共享一小片暖光穿过空走廊", focus:"大片暗部里的相邻剪影", technique:"silhouette" },
  { slug:"cinema-back-row-coat", title:"后排披上的外套", description:"一位观众把外套轻轻披到身旁人的肩上", focus:"银幕冷光边缘的暖色动作", technique:"compression" },
  { slug:"cinema-usher-flashlight", title:"照亮下一阶台阶", description:"引座员压低手电为年长观众照亮过道", focus:"小光束与两人即将相接的手", technique:"group" },
  { slug:"cinema-screen-shadow", title:"银幕上的双手小鸟", description:"两位成年人用手势在空白银幕上合成小鸟影子", focus:"大面积留白中央的合掌影形", technique:"negative" },
  { slug:"cinema-acoustic-wall", title:"补回一块墙板", description:"两位工作人员合力装回一块吸音墙板", focus:"重复几何中被托住的缺块", technique:"pattern" },
  { slug:"cinema-stair-balcony", title:"一盏灯照两个人", description:"两人沿楼座台阶并肩上行，共同借一盏手灯照路", focus:"斜梯上的共享暖色光池", technique:"diagonal" },
  { slug:"cinema-locked-door", title:"旧钥匙与关上的门", description:"两位旧员工在机房门前一起比对钥匙", focus:"两双手中央的无标识钥匙", technique:"detail" },
  { slug:"cinema-dust-seats", title:"白布盖过红座", description:"两人从两端共同把白布铺过成排座椅", focus:"红色重复上流动的白色斜线", technique:"pattern" },
  { slug:"cinema-red-carpet", title:"把红毯铺到门外", description:"年长与年轻工作人员从两端共同铺平旧红毯", focus:"通向暖门的红色引导线", technique:"diagonal" },
  { slug:"cinema-projector-off", title:"机器停下后的茶", description:"两位放映员坐在关闭的机器旁共享热茶", focus:"黑色轮盘下方的暖灯与茶杯", technique:"group" },
  { slug:"cinema-demolition-dawn", title:"把座椅搬进清晨", description:"邻居们在晨光中合力把保留下来的座椅搬出影院", focus:"冷暗门框外的暖色协作人群", technique:"frame" },
];

export const cinematicExpansionFrames: Frame[] = [
  ...buildFrames(teahouseDefaults, teahouseSpecs),
  ...buildFrames(laneDefaults, laneSpecs),
  ...buildFrames(trainDefaults, trainSpecs),
  ...buildFrames(summerDefaults, summerSpecs),
  ...buildFrames(hillDefaults, hillSpecs),
  ...buildFrames(cinemaDefaults, cinemaSpecs),
];

export const cinematicExpansionFrameIdsByFilm = Object.fromEntries(
  cinematicExpansionFrames.reduce<Map<string, string[]>>((map, item) => {
    const ids = map.get(item.filmSlug) ?? [];
    ids.push(item.slug);
    map.set(item.filmSlug, ids);
    return map;
  }, new Map()),
) as Record<string, string[]>;
