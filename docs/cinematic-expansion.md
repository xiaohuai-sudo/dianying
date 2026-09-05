# 150 张电影摄影技法扩充记录

## 资产范围

- 生成日期：2026-09-06
- 数量：150 张；与首批 50 张合计 200 张
- 分配：《南方茶馆》《雨巷之后》《夜行列车》《潮湿的夏天》《山城来信》《无人的放映厅》各新增 25 张
- 输出：16:9 横向 PNG，项目文件位于 `public/images/frames/`
- 内容索引与逐图中文标题：`lib/cinematic-expansion.ts`

## 摄影方向

本轮不以“场景换皮”为目标，而让每张画面承担一项可辨认的摄影方法：

- 光线：有动机侧光、逆光、轮廓光、负补光、冷暖分区、玻璃与湿地反射、雨雾和尘埃中的体积光。
- 构图：框中框、前景遮挡、一点透视、对称与破缺、长焦压缩、广角纵深、斜线引导、重复图形与留白。
- 关系：通过递、扶、等待、分享、并肩与隔窗回应等动作表达人物关系，避免把情感只交给表情或文案。
- 色彩：后三部作品增加暖黄、杏色、酒红和柔和肤色附近的反射层次，同时保留冷色环境作为空间分层。

## 共用生成提示框架

> Original 16:9 cinematic narrative still for a fictional film; deliberate blocking; motivated practical lighting; controlled highlight rolloff; deep shadows with readable detail; subtle 35mm grain; realistic lens falloff; restrained color grade; no letterboxing. Entirely fictional; no resemblance to a specific film; no real actor or recognizable face; no brand, logo, poster, protected character, readable text, caption, watermark or border.

每张图在共用框架后补充独立场景、镜头焦段、主光方向、构图目的和情绪目标。完整的逐图语义描述、视觉重心与技法分类保存在 `lib/cinematic-expansion.ts`，与页面展示数据使用同一来源，避免文档与产品内容分离。

## 审核记录

- 所有文件均采用稳定语义化名称，与画面 `slug` 一一对应。
- 公开版权状态统一为“本站原创”，审核状态为“审核通过”，不开放下载。
- 未使用真实电影截图、海报、演员、角色、商标或可读品牌文字。
- 资产使用范围仅限镜间网站功能演示与电影美学分析，不作为商业素材授权。
