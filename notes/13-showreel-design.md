# 13 · Showreel Design

- 编号：13
- 分类：网页设计灵感与参考
- 核实后的来源：https://showreel.design/
- 检索时间：2026-11-13 16:33（Asia/Shanghai）
- 页面：`pages/13-showreel-design/index.html`
- 状态：done

## 它是什么

Showreel.design 是一个动效作品集（motion design showreel）索引站。首页自己写的标题是 “Discover 261 Best Motion Design Showreels”，副标题说收录了来自全球工作室与创作者、每周更新的 261 条精选 showreel。

它不是网页截图库。它收的是 16:9 的动态作品：品牌片、3D/CGI、UI/UX motion、logo 动画、发布片。首页把作品按三类维度切开：

- 行业：Advertising & Commercial、Entertainment & Media、Tech & SaaS、Fashion & Luxury 等
- 风格：Retro/Vintage、3D/CGI、Bold/Vibrant、Minimal/Clean、Hand-drawn、Cinematic/Dramatic 等
- 声音：Electronic/Synth、Orchestral/Classical、Hip-hop/Urban、Sound Design Focused 等

这个“声音”维度很关键。多数灵感站只按视觉分类，它把音轨也变成检索条件，因为它展示的是片子，不是静帧。

## 关键技法

1. **海报先到位，视频后加载**。卡片先把 poster 图铺满 16:9 框，`<video>` 以 `preload="none"` 待命，hover 才把 `data-src` 接上并淡入。这样首屏不会被几十条视频拖死。
2. **一个主筛 + 三条分组**。左侧是行业/风格/声音三组复选，不是一排万能 tag。筛选项带数量，用户知道每类有多少货。
3. **卡片不做圆角糖果**。16:9 直角或极小圆角，信息压在画面下方，标题、行业、风格、声音四行，像片单而不是电商卡。
4. **编辑式大标题 + 紧凑网格**。Hero 只负责一句主张，下面立刻进入作品墙；3 列桌面、2 列平板、1 列手机。
5. **数字是导航的一部分**。261 / 103 / 45 / 68 这些计数直接写在筛选项旁，用户不需要先点进去才知道体量。

## 怎么复用到管线

- **技能库页**：把 `.skills/*/SKILL.md` 当成片单。每个技能一张 16:9 卡，hover 时播放一段 CSS 预览（打字、线条、网格），不加载视频。筛选项按“用途”分组：写作、动效、检索、交付、研究。
- **索引页**：16 项资源用同样的“编号 + 一句功能 + 状态”卡片语言，而不是做成 16 个彩色大 banner。
- **成本控制**：预览只用 CSS/GSAP，避免为每张卡生成视频；真正需要视频时再走 `gen_requests.json`。
- **检索维度**：给技能加“输入/输出/风险”三类元数据，像它的行业/风格/声音一样可筛，不要只按名字排。

## 许可证与使用限制

- 站点本身未提供开源许可证；页面明确写 “All showreel © of their respective owners”。作品版权归各工作室/创作者。
- 可学习：信息架构、筛选维度、卡片比例、加载策略。
- 不可做：下载或再分发 showreel 视频/海报，把他人作品当自己的案例，或把 Showreel.design 的标识当本页品牌。
- 本页只吸收结构，不使用其任何图片、视频、字体或商标。

## 核实记录

- 2026-11-13 16:33 CST 打开 https://showreel.design/，HTTP 200。
- 页面 `<title>`：`Discover 261 Best Motion Design Showreels`；meta description 与标题一致。
- 首页可见计数：All 261、Motion Graphics 103、3D/CGI 45、Studio/Agency 68、UI/UX Motion 30、Branding & Identity 15、Motion Logo 142、Launch 109、Resources 13。
- 卡片结构可见 `data-video-url`、`poster`、`<video preload="none">`，网格为 `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`。
- 未采信任何未在页面出现的“星标/播放量/排名”数字。
