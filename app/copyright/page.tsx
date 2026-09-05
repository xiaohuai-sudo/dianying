import type { Metadata } from "next";
import Link from "next/link";
import { IS_PLACEHOLDER_EMAIL, SITE } from "@/lib/config";
export const metadata: Metadata = { title: "版权说明" };
export default function CopyrightPage() { return <div className="site-container py-12 sm:py-16"><div className="mx-auto max-w-4xl"><p className="section-kicker">COPYRIGHT · 版权说明</p><h1 className="section-title">版权、许可与内容使用</h1><p className="section-intro">最后更新：2026 年 9 月 5 日</p>
  <div className="prose-jj mt-12">
    <h2>网站内容声明</h2><p>本站是以电影视觉语言、美学教育和学术研究为目的的内容项目。除特别标注外，站内演示图片均为本站原创、经权利人许可使用，或来自已经确认的公有领域及开放许可资源。</p><p>影片名称、人物名称、海报、剧照、商标及其他相关权利归各自权利人所有。本站不会因为标注来源或注明“仅供学习研究”而当然取得相关内容的使用权。未经明确授权的影视画面不提供高清原图下载，也不得作为商业素材使用。</p><p>本站原创文字、页面设计、数据整理及分析内容，未经许可不得进行大规模复制、镜像或商业使用。合理引用时请注明本站名称及原始页面链接。</p>
    <h2 id="original-demo-assets">原创演示资产</h2><p>初版所展示的六部作品和 200 张图片均为虚构内容。图片由镜间视觉实验室创作，不对应真实电影、演员、角色或拍摄现场。每张图片均保存标题、作者、权利人、来源类型、授权类型、版权状态、使用范围、下载权限、授权记录、添加日期与审核状态。</p><p>这些图片只被授权用于镜间网站功能演示与美学分析。网站中的“收藏”仅把画面编号保存在访问者本机浏览器，不构成下载或商业使用授权。</p>
    <h2>公开审核规则</h2><p>图片版权状态只使用“本站原创、已获授权、公有领域、开放许可、待版权审核”。标记为“待版权审核”、待审核或暂时隐藏的图片不会进入公开数据集；“来源不明”“网络素材”不是本站允许的数据选项。</p>
    <h2>权利人通知</h2><p>如果您是相关内容的著作权人或合法授权代表，并认为本站展示的内容侵犯了您的合法权益，请发送通知至：<span className="text-paper">{SITE.rightsEmail}</span>。通知应包含权利人身份信息、权属证明、涉及内容的页面链接、联系方式及具体处理要求。本站将在收到完整材料后进行核验，并对存在争议的内容采取暂时隐藏、补充授权信息或删除等措施。</p>
    {IS_PLACEHOLDER_EMAIL && <p className="border border-gold/40 bg-gold/5 p-4 text-gold">当前邮箱使用 `.example` 演示域名，无法真实收件。正式上线前必须通过 `NEXT_PUBLIC_RIGHTS_EMAIL` 替换为真实可用邮箱，并完成收件测试。</p>}
    <p><Link href="/rights" className="button-primary no-underline">报告版权问题</Link></p>
  </div></div></div>; }
