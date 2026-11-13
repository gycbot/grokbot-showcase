# 07 · Framer Gallery

检索时间：2026-11-13 16:34（Asia/Shanghai）
核实状态：画廊页可打开，分类与筛选结构已核；「4 万多个网页」未核实，记为 evidence_gap。

## 是什么

Framer 官方社区里的作品画廊，收录用 Framer 做出来的网站。页面标题是「Framer Gallery: Explore the best websites built with Framer」，说明是给设计者找灵感、再回到 Framer 里做自己的站点。

画廊的组织方式值得学：

- **按行业分类**：Business（Consulting / Finance / Legal）、Agency（Branding / Marketing / Web）、Software（AI / Apps / SaaS）、Ecommerce（Beauty / Fashion / Food）、Portfolio（Art / Design / Film）、Organizations（Education / Nonprofits / Publishing）、Places（Architecture / Real Estate / Hospitality）、Health（Fitness / Medical / Wellness）。
- **按时间与热度切换**：Trending / Recent。
- **缩略图即入口**：卡片大面积给作品截图，底部只留站名、作者和 Open。
- **视频缩略图**：部分卡片用 Mux 视频做 hover 预览，而不是静态图。

## 关键技法

1. **分类是导航，不是标签墙。** 一级按行业，二级按具体场景，用户可以在两步内缩小到「AI 的 SaaS 官网」这种粒度。
2. **缩略图承担 90% 的说服。** 文字只有站名与作者，没有一句介绍；判断发生在图上。
3. **克制的界面。** 没有大标题营销区，没有渐变，没有装饰边框；导航、筛选、网格三层就够。
4. **悬停才给动态。** 静态缩略图保证首屏速度，hover 再播视频或放大；移动端不依赖 hover，所以卡片本身要能读。
5. **作者与作品并列。** 每张卡既是作品入口，也是设计师署名；这比只放截图更像一个可检索的库。
6. **「Open」是唯一动作。** 不塞收藏、点赞、分享，减少决策成本。

## 如何复用到我们的管线

- 做参考库：先定两级分类（行业 → 场景），再收图；不要先堆 200 张再想怎么分。
- 做展示页：本页的「参考墙」用 CSS 画抽象版式，不复制任何真实站点截图；点选卡片会把它收进「记忆」面板，面板把选择归纳成口味标签。这是把「画廊」变成「决策库」的做法。
- 做移动端：卡片单列、筛选条横向滚动、触控目标不小于 44px；不把桌面四列硬压成两列。
- 做版权：只链到原站，不搬运截图；本页所有缩略图都是抽象图形，不使用第三方作品图。

## 许可证与使用限制

- Framer Gallery 是 Framer 的官方站点，画廊里的每个作品归各自作者 / 客户所有；Framer 的商标与界面素材归 Framer。
- 我们没有抓取、下载或再分发画廊里的截图与视频；页面只写公开的分类结构，并链到原站。
- 本站用「Framer Gallery」作为被介绍对象的名称，属于指称；不使用 Framer 的 logo、字体或品牌色作为本页品牌。
- 若要批量抓取画廊做训练或再发布，需要先看 Framer 的服务条款与各作品授权；本任务不做。

## 核实后的来源

- 画廊：https://www.framer.com/community/gallery/ （HTTP 200，打开于 2026-11-13 16:33 CST；`/gallery/` 会跳到这里）
- 页面标题：`Framer Gallery: Explore the best websites built with Framer`
- 页面描述：`Get inspired by the best website design on the internet, then build your own with Framer's agent, directly on the canvas, and submit it to the Framer Website Design Gallery.`
- 分类与 Trending / Recent：同上，页面 HTML 中可见。

## evidence_gap

- **「收录了 4 万多个全球优秀网页」**：画廊页面没有显示总数，也没有找到官方统计页。4 万这个数字不写进页面，不照抄。
- 画廊卡片的确切数量、更新频率、审核标准均未核实；页面只写「持续更新的精选库」。
- 没有核实 Framer 对画廊作品的授权条款细节；页面不声称可商用或可转载。
