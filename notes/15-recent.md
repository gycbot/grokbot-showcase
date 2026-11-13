# 15 · Recent

- 编号：15
- 分类：网页设计灵感与参考
- 核实后的来源：https://recent.design/
- 检索时间：2026-11-13 16:33（Asia/Shanghai）
- 页面：`pages/15-recent/index.html`
- 状态：done

## 它是什么

Recent 是一个设计灵感流（design inspiration feed）。页面标题 “Recent — Design Inspiration”，meta description 只有一句 “The best design inspiration on the Internet.”。它把网页、界面、品牌、动效、插画、海报、印刷等作品混在一条持续更新的流里，而不是按“最佳网站”做排行榜。

首页可见的一级分类：All、Web、Interface、Branding、Motion、Illustration、Posters、Print。导航里另有 Design、Launch Videos（标了 new）、Websites、OG Images、App Screenshots、App Icons、Resources、Tools、Skills、Jobs。也就是说它不只做“网页截图”，还把发布视频、OG 图、应用截图、图标、工具和技能都当成设计样本。

页面是应用式前端（React/Vite，资源文件名带 hash），信息密度很高：混合宽高比的卡片、来源与作者、赞助位、职位位，全部在同一条流里。它没有把“灵感”做成一张张等大的白卡。

## 关键技法

1. **真 masonry，不是等高网格**。每条作品保留自己的宽高比（1.33、1.89、0.90、1.77、0.70 都在首页出现），列与列之间错位，眼睛会继续往下扫。
2. **分类是横向短标签，不是侧边大菜单**。All / Web / Interface / Branding / Motion / Illustration / Posters / Print 一排就够，选中态用字重和颜色，不用大色块。
3. **“新”是一个小徽标**。Launch Videos 旁边一个 `new`，不抢主内容。
4. **元数据贴在作品边缘**。作者头像、来源、标题、保存/外链，都在卡片下沿，字号很小，不遮挡画面。
5. **商业位与内容位同构**。Sponsor / Jobs 也用卡片语言，不另做一条突兀的横幅。
6. **深色模式不是反色**。页面用近黑底 + 暖白字 + 一个低饱和强调色，卡片本身仍然是作品的颜色。

## 怎么复用到管线

- **会话记忆页**：把本次会话的真实事件（读 brief、抓参考、写笔记、建页、截图）做成一条混合宽高比的流；每条保留自己的“形状”，不要全裁成 16:9。
- **筛选**：按“检索 / 写作 / 构建 / 校验”分组，而不是按时间倒序堆。
- **元数据**：每条只留三个字段——产物路径、动作、状态；不写“圆满完成”这类空话。
- **索引**：总索引不要做成营销首页，做成一条可扫的目录流；编号、名称、状态、链接四列足够。
- **性能**：图片用 `loading="lazy"`、固定宽高比防跳动；本页不加载外部图片，全部用 CSS 图形和文字。

## 许可证与使用限制

- 站点未提供开源许可证；页面版权声明为 `© 2026`，作品版权归各创作者/品牌。
- 可学习：masonry 布局、分类标签、元数据层级、商业位与内容位的关系。
- 不可做：批量抓取或再分发作品图、把 Recent 的标识/版式当本页品牌、伪造“编辑推荐”或互动量。
- 本页不使用其任何作品图、头像、logo 或字体。

## 核实记录

- 2026-11-13 16:33 CST：https://recent.design/ HTTP 200。
- `<title>Recent — Design Inspiration`；meta description “The best design inspiration on the Internet.”。
- 首页可见分类与导航文本、`© 2026`、`new` 徽标均已核对。
- 首页卡片 `data-slot="feed-media-card"` 上可见不同 `aspect-ratio` 值（1.333…、1.894…、0.909…、1.772…、0.706…），据此判断为混合比例 masonry，而不是等高网格。
- 未采信任何未在页面出现的“收录 4 万+ / 排名 / 播放量”数字。
