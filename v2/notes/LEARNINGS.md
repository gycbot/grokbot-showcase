# LEARNINGS.md · 第二批动效加字效（合并）

日期：2026-11-13 · Asia/Shanghai
来源：两个并行 dsh 会话先学习、后做页。本文件由宿主合并，未改写学习结论。

- 01–02（电影感深金 / 明亮 bento）：见下方第一部分，原文 `LEARNINGS-01-02.md`
- 03–04（纸感编辑台 / 抖动实验室）：见下方第二部分，原文 `LEARNINGS-03-04.md`

---

# 第一部分 · 01–02 会话学习笔记

# LEARNINGS · t2913u 第二批 01–02 站

【草稿·待主人审】内部 SAMPLE，不发布。

> 写于做页之前。记录实际读过的 skill、standing、演示与样片，第一批 16 页的具体弱项，以及本批四站的分色 / 分技法计划。本文不代表发布授权；所有页面均为内部 SAMPLE 草稿。

时间：2026-11-13 · Asia/Shanghai · 新开 dsh 会话（workspace `prod-20261113-t2913-webcraft-motion-a`）

## 0. 一句话结论

第一批 16 页的问题不是「不好看」，是**同一套排印脸 + 同一套 6px 淡入**：奶油纸底、衬线大标题、珊瑚/橙色小点缀，动效只在「进入视口时淡一下」，没有字效家族，也没有能让人停下来的 UI 事件。第二批必须先把**色盘**和**英雄技法**拆开，再把 blur-slide 真正落到「同一进度三通道」，而不是换个颜色重做一遍。

## 1. 必读 skill：各自教了什么，本批怎么用

| Skill | 实际读到的要点 | 本批落地 |
|---|---|---|
| `skill-first-task` | 先锁一个主 skill，再开工；production start gate 要参考、可复用组件、可观察质量条；每种介质先做最小证明（静帧 / 短片 / 手机首屏） | 01 以 `motion-house-style` + `kinetic-typefx-sell-short` 为主，02 以 `surface-web-craft-kit` + `user-taste-transfer` 为主；先出静帧和手机首屏，再补全页 |
| `user-taste-transfer` | 主人偏好：无小字免责（本任务只留一句必要非官方声明）、衔接不断、先找站外对标、精致优先、纠错要迁移 | 每站只保留页脚一句「非官方」；章节之间用同一套色/字/动势承接；外网检索失败写 evidence_gap，不编互动量 |
| `de-ai-zh` | 去宏大空开头、首先其次、三段排比、假互动结尾、过密破折号；保留事实与不确定度；禁「赋能/闭环/打造/深度/沉浸/一站式/引领/开启新篇章」 | 页面文案改成人话：短句、具体动作、可指认的物；不写「重塑生产力」这类句子；未核实数字不进页面 |
| `surface-web-craft-kit` | 一个门户一个英雄 craft，禁四站同骨架；亮/骨/纸可以，但禁 acid yellow；移动优先 720/480、≥44px、无横向溢出；页内禁团队黑话 | 02 的底是冷白而非奶油，英雄 craft 是「可点开的 bento 板 + 三步拆解」；不用 acid yellow，改用钴蓝/橘/薄荷 |
| `viral-copy-zh` | 标题要有真实利益或张力；3–5 个变体；合规自检；不编收益、排名、评价；平台原生改写 | 每站标题写 3 个变体后选一个；只讲能力，不写「最强/第一/官方」；索引短文案按网页而非帖子口吻 |
| `motion-house-style` | 2–4 秒屏幕必须有新东西；静音可读、手机可读；禁渐变居中标题、全员同淡入、角标、UI 发光、粒子、bounce、空白停顿；morph 内文字独立 enter/exit | 01 的「场景播放器」3.4s 一换，02 的「三步拆解」3.6s 一轮；所有循环在末帧 settle，不无限抽动；无粒子、无 bounce |
| `kinetic-typefx-sell-short` | 字效卡菜单：type-assembly 裂升、pill-slot 词槽、outline-fill 描边填色、marker-underline 马克笔、card-stack 卡堆、blur-slide；前 2 秒要有钩；每 2–4 秒新字事件 | 01 用 type-assembly + gradient-word-sweep + blur-slide；02 用 pill-slot + gradient-word-sweep + blur-slide；不把「整句淡入」当默认 |
| `grokbot-chat-demo-sop` | 对话演示要「需求 → 制作 → 结果」闭环，禁 orphan showcase；开链要有 press→expand；不伪造官方 UI | 01 的现场记录按「你说 → 它做 → 结果」三段；02 的三步拆解同样从一句需求出发；不做假聊天气泡、不假装是官方 App |
| `gsap-core` | timeline 优于 delay；transform/opacity 优先；`autoAlpha`；`matchMedia` 处理 reduced-motion；同一属性多个 from 要 `immediateRender:false` | 所有入场用 timeline + 位置参数；blur 用 `filter`（不可避免的 paint，但只在小面积文字上）；`prefers-reduced-motion` 直接给终态 |
| `gsap-timeline` | 位置参数、label、defaults、嵌套 timeline；ScrollTrigger 只挂顶层 | 01 的 hero 用一个 master timeline；场景播放器用可复用的 paused timeline；02 的拆解循环用嵌套 timeline |
| `gsap-scrolltrigger` | start/end、scrub、pin、batch、refresh、cleanup；pin 只 pin 必要元素；`ease:"none"` 用于 containerAnimation | 01 用 scrub 做胶片横移，但不 pin 整页；02 用 batch 做 bento 入场；两站都避免同一套 Lenis+pin |
| `gsap-plugins` | 插件全部免费；SplitText / Flip / Draggable 可按需注册；不要用未注册插件 | 本批只用 core + ScrollTrigger，字效自己包 span，避免额外依赖；不假装用了 SplitText/Flip |
| `gsap-performance` | 优先 transform/opacity；will-change 只给真的会动的元素；长列表 stagger；离屏暂停 | 胶片条只动 x；卡片只动 x/y/opacity；场景播放器用 `IntersectionObserver` 离屏暂停；不 animate width/height |
| `gsap-utils` | clamp / mapRange / normalize / toArray / selector；函数形式复用 | 01 用 `mapRange` 把滚动进度映射到胶片 x 和当前场次；02 用 `toArray` + `selector` 管 bento 卡片 |
| `dsh-executor` | 只在 workspace 内写；不发布/不登录；先参考与设计决策再写页；交付 `asset_manifest.json` / `self_check.md` / `run.jsonl`；commercial_use=false | 本批只写内部 SAMPLE；`output/` 完整暂存，共享目录可写则同步；不发布、不读密钥 |

## 2. standing：读到的硬钉

- `STANDING_MOTION_HOUSE_STYLE_T2496.md`：2–4s 新东西；静音/手机可读；BANNED 清单；SAMPLE≠授发只留在内部交接，不进页面。
- `STANDING_TEXT_MOTION_BLUR_SLIDE_T133.md`：blur-slide ≥2 处，**opacity / blur / translateY 同一个进度 p**；中文按语义切段，不无脑逐字；另至少一族字效；HANDOFF 附模糊显影参数表。本批把参数表直接写进 `REPORT.md`。
- `STANDING_KINETIC_TYPEFX_SELL_T5.md`：金样五卡 + blur-slide；炭黑+珊瑚是视频默认，不适用于本批四站分色；本批借「卡菜单」不借「炭黑珊瑚」。
- `STANDING_USER_TASTE_TRANSFER_T2530.md`：无小字免责、衔接顺、先对标、精致优先；t50u 明确禁页内团队黑话，四站英雄手法不能撞。
- `STANDING_HANDOFF_MOTION_TRIPLE.md`：**文件不存在**。这是 evidence_gap，不能假装读过；以 motion-house + T133 + T5 三份 standing 为准。

## 3. 实际打开过的演示与样片（不是只抄路径）

### 3.1 yc-sites（2026-11-08）

- **B-cinematic**：深棕黑底、白字、橙色小 accent，超大无衬线标题，Lenis + ScrollTrigger 的整页叙事。优点是「电影感」的暗场和留白；弱点是暗色 Agency 长滚 + 巨字 + pin 的通用骨架，和第一批 16 页的「衬线大标题」只是换了个肤色。→ 01 保留暗场与电影画幅，但改用**暖金 + 衬线 + 胶片场景播放器**，不做整页 pin。
- **E-bento-bright**：冷白偏紫底、粉/黄/绿/蓝 pastel bento、浮动小卡、右侧产品 mock。主人喜欢它的「一块一色 / 任务可见」。实际预览里右栏浮卡对比度太低、hero 右侧出现大片空白（截帧时浮卡未显影），bento 卡的信息密度也偏均匀。→ 02 学「bento 任务板」的结构，不学它的淡紫底和低对比浮卡；改成冷白 + 高对比墨线 + 钴蓝/橘/薄荷，hero 右侧必须有真实可点的板。
- **H-paper-studio**：骨纸、黑字、橙红按钮、超大粗黑标题 + 细线表格；强在排印层级和「编辑室」气质。但它和 16 页的骨纸+橙红是同一家族。→ 03 才用紙感；02 不碰奶油/骨色。
- **I-console-lab**：网格纸、黑字、荧光黄绿 accent、控制台 mock；强在「产品可见」，弱在 acid yellow 和偏工程黑话。→ 04 可借控制台结构，但改用 signal green/amber，不用 acid yellow。
- **J-liquid-glass / K-liquid-metal**：桌面端材质和折射很强，移动端内容薄、字号/热区弱。→ 本批不碰 WebGL 液体；02 的移动端必须内容完整、每块可点。
- **A-editorial / C-dither-laser / D-awwwards / F-cream-studio**：A 的移动端衬线标题和编辑感、C 的黑底珊瑚 dither、D 的巨字错位、F 的奶油编辑室，都看了。它们的共同问题是「一种气质铺满全页」，没有 2–4 秒的 UI 事件。→ 本批每站至少一个会自己演、会停的 UI 段。

### 3.2 surface-kit / threeui / polyfork

- `surface-kit/portals/board`：亮色 bento 技能碎片板，彩色卡片 + 浮动标签；可学「板式」，但它仍是「hero 左文右浮卡 + 下方卡片墙」。→ 02 改为「整块板就是首屏」，hero 不是左文右图。
- `surface-kit/portals/atlas/lens/ingot`：每个门户一个英雄 craft（索引 / 折射 / 流金），互相不撞。这条规则直接用于本批四站分技法。
- `threeui-labs`：空间 UI / holo 的实验，桌面强、移动端成本高；本批不引入 three.js，避免移动端崩。
- `motion-polyfork-pages`：极简编辑风 + 双卡对照 + 参数化 demo；学到「小体量也能高级」，以及「页脚只留一句来源说明」。→ 01/02 的页脚控制在一行非官方说明 + 一条返回索引。

### 3.3 t109u SAMPLE-REV4（blur-slide 基线）

实际抽了 2 秒间隔的 contact sheet，并读了 HANDOFF 参数表：

| 片段 | blur | dy | stagger | 同一进度 |
|---|---|---|---|---|
| 钩子「平台又在 / 替你 / 立人设 / ？」 | 10px | 30px | 4f | 是（quint-out） |
| 收束「替你 / 说清楚」 | 12px | 36px | 4f | 是 |
| 副行 | 5–6px | 12–16px | ≈2.5f | 是 |

另用了 gradient-word-sweep（L→R mask 揭开，15–20f）、list-reveal（stagger 9f、scale .82→1、blur 7→0）、scan-bracket（四角 L 臂 30px、stagger 3f）。→ 网页版把「帧」换成「秒」：blur 10–14px、y 28–40px、duration .9–1.2s、power3.out；同一条 tween 同时改 opacity/filter/y，绝不拆成三段。

### 3.4 t5u 字效卖货 SOP

金样五卡：type-assembly → pill-slot → outline-fill → marker-underline → card-stack，段间 blur-slide。学到「一张卡只演一件事」「2–4 秒一个新字事件」「尾段落回交付物」。→ 01 的场景播放器借「卡堆」的结果墙；02 借「词槽」和「三步拆解」。

## 4. 第一批 16 页：具体弱在哪

实际读了 16 个 `index.html` 的 CSS 变量和脚本，并截了 01/02 等页：

1. **底色同族**：多数页面用 `#F3F0E8 / #F1EEE4 / #f3eee3 / #f2efe8` 一类奶油/骨纸，视觉上像同一本书的不同章节。
2. ** accent 同族**：`#C64A2C / #E2542C / #e0492e / #ff5a1f / #d23a26 / #e2552f / #ff4b2b` 密集出现，基本是珊瑚/橘红；少数蓝/绿/金是例外，不构成系统。
3. **排印同族**：衬线大标题 + 无衬线正文 + mono 小标签，几乎每页同一套；标题多为「能力名 + 一句解释」的两行结构。
4. **动效同族且弱**：15 页引了 GSAP，但首屏基本是 `opacity 0→1 + y 6px + blur 2px`、0.6–0.9s、同一 timeline 顺序推完；没有按字符/词/行的字效家族，也没有滚动驱动的字效。6px 的位移在 1440 宽下几乎看不出来。
5. **没有 UI 事件**：页面是「读」的，不是「看它做」的；没有 2–4 秒会自己变化、又会停下来的演示段。
6. **收尾同构**：页脚都是「非官方 + 来源 + 前后页」，每页重复，缺少各自的气质收束。
7. **移动端**：多数只是把两栏改一栏，热区偏小；没有为 390 宽单独设计字效节奏。

## 5. 本批四站分色 / 分技法计划

| 站 | 色盘（主 / 辅 / 强调） | 英雄技法 | 字效家族 | UI 动效 | 明确不做 |
|---|---|---|---|---|---|
| **01 电影感深金** | 深咖啡 `#0B0906` / 香槟金 `#E7C98B` / 象牙 `#F4EAD8` / 黄铜 `#B8893F` | 16:9 电影画幅 + 放映机光斑 + 胶片横移 + 场景播放器 | blur-slide（hero / 章节）、type-assembly（标题逐字）、gradient-word-sweep（关键词） | 6 个能力场景每 3.4s 一轮：需求 → 步骤 → 结果，末帧 settle；可点场景条 | 不做液体金属、不做整页 pin、不做粒子、不做金到发光的「土豪金」 |
| **02 明亮 bento** | 冷白 `#F5F6F3` / 墨 `#101317` / 钴蓝 `#2447FF` / 橘 `#FF5A2A` / 薄荷 `#7FE0C3` | 整屏 bento 任务板 + 可点开的 tile 抽屉 + 三步拆解 | blur-slide（hero / 章节）、pill-slot（轮换词）、gradient-word-sweep（「做事」） | 3.6s 一轮：一句话 → 三步亮起 → 结果卡落位；点 tile 打开抽屉（press→expand，44px+） | 不用奶油底 + 单珊瑚、不用淡紫渐变、不用 acid yellow、不做 E 的低对比浮卡 |
| 03 纸感/骨色编辑向 | 骨纸 / 墨 / 深绿（只留一个强调） | 报纸栏 + 可展开的索引 + 线描 | 线描 + list-reveal + 少量 blur-slide | 横向索引 / 展开式条目 | 不与 01/02 共用暗金或亮 bento |
| 04 控制台/实验室 | 近黑 / signal green / amber / 冷灰 | 可读的 console + dither/scan 元素 | scan-bracket + scramble + blur-slide | live log + 参数滑杆 | 不做移动端薄、不做 acid yellow 大面积 |

四站的「底色」分别是：深咖啡、冷白、骨纸、近黑；「英雄手法」分别是：电影场景播放器、bento 任务板、编辑索引、控制台。任何两站不能互换。

## 6. 本批两站的具体分镜（先定，再写代码）

### 01 深金 · 放映室

- 00–02s：黑场 → 放映机光斑亮起 → 胶片齿孔先入 → 标题第一行 blur-slide（opacity 0 / blur 14 / y 36 同一 tween）→ 第二行逐字 type-assembly。
- 02–06s：副标题 blur-slide；右上「REEL 01 / 06」计数；金色细线从左到右扫过关键词「自己走完」（gradient-word-sweep）。
- 06–14s：胶片横移，6 格对应 6 个能力；滚动 scrub 只动 x，不 pin。
- 14–30s：场景播放器自动演：需求卡 → 三步进度（技能/例程/记忆等）→ 结果卡；每 3.4s 一轮，轮间 0.6s settle。点场景条可手动切换，暂停自动。
- 30–40s：能力清单 list-reveal + 一句「哪些事适合交给它」；页脚一句非官方 + 返回索引。

### 02 亮 bento · 任务板

- 00–02s：冷白底 + 墨线网格 → 标题第一行 blur-slide → 「做事」两字 gradient-word-sweep + 轻微 scale settle。
- 02–05s：副标题 blur-slide；右上「一块一件事」小标签；下方 bento 板逐块落位（batch，stagger 60ms，y 24 / opacity 0，不整句淡入）。
- 05–18s：三步拆解循环：一句话卡 → 三枚步骤 chip 依次点亮（每枚 0.5s）→ 结果卡从下方落位并停 1.2s；3.6s 一轮。
- 18–30s：点任意 tile 打开抽屉：tile press（scale .98）→ 抽屉 x 从 100% 滑入 → 标题 type-assembly → 关闭按钮 48px；移动端抽屉全屏。
- 30–38s：底部「适合 / 不适合」两栏 + 返回索引。

## 7. Evidence gaps（不编）

- 外网搜索工具当前无 API key，无法打开小红书/X/Behance 热帖并记录可见互动量；因此**没有编造任何点赞/收藏/排名**。本地可打开的参考是 yc-sites、surface-kit、threeui、polyfork、t109u/t5u 样片；这是本轮的对标证据边界。
- `STANDING_HANDOFF_MOTION_TRIPLE.md`（brief.standing_pointers 之一）在磁盘不存在；已用三份存在的 standing 替代，缺口如实记录。
- 第一批 16 页的「互动量」没有核实来源，本批不引用。
- E-bento-bright 的预览图右侧空白是截帧时浮卡未显影，不代表其真实设计；本批只学结构，不复制其淡紫底与低对比浮卡。
- 页面中的能力描述按 brief 给定的能力名做定性说明，不写未核实的版本号、跑分、用户数、排名。

## 8. 复用记录（skill-first-task 要求）

`refs`：yc-sites E/H/I/B + surface-kit board + t109u REV4 + t5u SOP（本地，已打开）｜`skill`：motion-house-style / kinetic-typefx-sell-short / surface-web-craft-kit / gsap-core+timeline+scrolltrigger+performance+utils｜`step/component`：T133 三通道 blur-slide、t5u type-assembly / pill-slot、surface-kit「一站一英雄 craft」｜`proof`：本文件 + 两站 1440/390 截图｜`diff`：网页化字效、每站独立色盘与 UI 演示，不复用 16 页骨架。


---

# 第二部分 · 03–04 会话学习笔记

# 学习笔记 · 第二批 03–04 站（先学后做）

时间：2026-11-13 · 工作区 `prod-20261113-t2913-webcraft-motion-b`
范围：`brief.assets`、`standing_pointers`、`.skills/` 全部 15 份、第一批 16 页源码、SAMPLE-REV4 抽帧。
本文件写于任何页面代码之前。页面产物在同目录 `../pages/03-*`、`../pages/04-*`。

---

## 0. 一句话结论

第一批 16 页的问题不是「没有 GSAP」，而是**把 blur-slide 做成了 2px/6px 的整块淡入**：动作只有一下、没有字级切分、没有第二拍、没有一种能被称为「字效家族」的东西。第二批 03/04 要补的不是更多动画，而是**可指认的排版动作**：字怎么进来、页面怎么换气、用户按一下之后 2–4 秒里看见什么。

---

## 1. 技能逐份：教了什么，本批怎么用

| 技能 | 真正学到的一条 | 落在哪份产物 |
|---|---|---|
| `skill-first-task` | 生产前先锁参考、技能路径、可观察质量条；每种媒介先做最小证明，再放大。 | 本文件第 5 节的参考与质量条；两站先做 390 宽关键画幅再补桌面。 |
| `user-taste-transfer` | 主人的纠正要泛化到同类问题；默认精致；不主动加免责小字；相邻画面要有承接。 | 03 不用奶油+珊瑚；04 不套 01 深金；全页只保留一句必要非官方声明；段落之间用同一套网格/编号承接。 |
| `de-ai-zh` | 去 AI 腔先删宏大开头、三段排比、平均值式正确；留事实、留具体动词。 | 两站正文重写：删「赋能/打造/闭环/沉浸」，改用「读、跑、停、交、留账」这类动作词。 |
| `viral-copy-zh` | 标题要有真张力，但不能承诺收益、不能编互动量；一个反常识角度要站得住。 | 03 标题「先读说明书，再动手」；04 标题「它不猜，它跑一遍」；不做收益/排名/评价。 |
| `surface-web-craft-kit` | 一站一个英雄手艺；骨纸/亮色都可以，但禁酸性黄、禁「深色 Agency + 巨字 + Lenis pin」万能骨架；移动端优先、热区 44。 | 03 = 活字排版台；04 = 抖动激光实验台。两站英雄技法不同，都没有全套 Lenis+pin。 |
| `motion-house-style` | 2–4 秒必须有新东西；禁全员同淡入、角标边框、UI 发光、粒子爆炸、弹跳；静音/360 宽可读；结束要 settle。 | 03 的「编辑台」与 04 的「跑一遍」都是 2.4–3.2 秒多拍时间轴，最后一拍停稳；无粒子、无 bounce。 |
| `kinetic-typefx-sell-short` | 字效卡要按语义切，不逐字无脑炸；blur-slide 参数 B≈10–12 / dy≈30–36 / 同进度；另选家族（type-assembly、list-reveal、scan-bracket、gradient-word-sweep）。 | 两站各做 2 处真 blur-slide（10–12px、28–34px、同一 tween 同进度），03 另加 type-assembly + list-reveal + 墨扫，04 另加字符解码 + scan-bracket + 数字/状态列揭示。 |
| `gsap-core` | 用 transform/opacity；autoAlpha；同属性多段 from 要 `immediateRender:false`；`matchMedia` 管响应式与 reduced-motion。 | 两个 `main.js` 都用 `gsap.matchMedia()` 分桌面/移动/reduce；所有位移走 x/y/scale；隐藏用 autoAlpha。 |
| `gsap-timeline` | 用位置参数和 label 编排，不用 delay 串；把 ScrollTrigger 放在顶层 timeline。 | 03 的 hero 用 label `set/assemble/lock`；04 的 run 用 `read/plan/make/check/settle` 五段 label。 |
| `gsap-scrolltrigger` | scrub 与 toggleActions 不并用；pin 只钉必要区；创建顺序自上而下；refresh 在字体后。 | 03 只对「校样」一段做 scrub（不 pin）；04 只做进度条与分段进入；字体加载后统一 refresh。 |
| `gsap-plugins` | 插件全免费；本机只有 core + ScrollTrigger，不假装有 SplitText。 | 中文拆字自己用 `Intl.Segmenter`/逐字 span 完成，不引 SplitText；没有 Flip/Draggable，就不写。 |
| `gsap-performance` | 动画只碰 transform/opacity/filter；`quickTo` 给高频指针；离屏暂停。 | 04 的激光跟随用 `gsap.quickTo`；两站滚动进入均 `once:true`；`prefers-reduced-motion` 直接给终态。 |
| `gsap-utils` | `clamp/mapRange/toArray` 把滚动进度映射成版式值，不手写 if。 | 03 的页边批注位置用 `mapRange`；04 的扫描线位置用 `clamp`。 |
| `grokbot-chat-demo-sop` | 每段交付要有「需求→制作→结果」闭环，禁无因秀场；开链要有按压/展开。 | 两站不摆假聊天记录；04 的实验台是「选一项能力 → 跑 → 出结果」的闭环，按钮有按压态。 |
| `dsh-executor` | 只交一份成品；先写参考与设计决策；每写完一个产物立即落盘；发布不是我的动作。 | 本批两站 + 索引；`reference_sources.md`、`design_decisions.md` 先于页面；`self_check.md` 逐条对照。 |

---

## 2. Standing 文件：被钉死的参数

1. **`STANDING_MOTION_HOUSE_STYLE_T2496`**：每 2–4 秒新东西；BANNED 是活清单（全员同淡入、角标边框、UI 发光、粒子爆发、弹跳、空白停顿）。→ 两站所有 hero 与交互序列都按「拍」写，最后一拍必须停稳；不做全屏粒子。
2. **`STANDING_TEXT_MOTION_BLUR_SLIDE_T133`**：blur-slide 的定义是 **opacity + blur + translateY 在同一条进度 p 上**，中文按语义切段；至少两处；另至少一族。→ 我把它落成单个 tween 同时动 `autoAlpha/filter/y`，按短语分组 stagger，而不是整句一起。
3. **`STANDING_KINETIC_TYPEFX_SELL_T5`**：字效卡是菜单，不是每张都上；卖货片的炭黑+珊瑚只属于卖货片语境。→ 03/04 不沿用炭黑+珊瑚。
4. **`STANDING_HANDOFF_MOTION_TRIPLE`**：HANDOFF 三勾（easing / settle / 快移 blur）。→ 本批没有视频 HANDOFF，但在 `design_decisions.md` 为每站记了 easing 名、settle 时刻、blur 值。
5. **SAMPLE-REV4 抽帧**（`output/notes/_refs/f01–f05.png`）：钩子帧里「设？」仍带拖影，下一帧才落定；中段「真正要的是这**三步**」是词级强调，不是整句变色；列表卡是 0.82→1 的 scale + 36px 位移 + 7px 模糊。→ 学到的是**同一屏内先粗后细的层级**：大标题先到，标签/卡片后到，最后停。

---

## 3. 演示与样片：打开过的，不是只抄路径

### H-paper-studio（主人喜欢）
- 读的是源码：暖纸 `#efeeea`、Space Grotesk + Inter Tight、圆角 22/36、贴纸色块（molten/jade/sun）、`.reveal` 由 IntersectionObserver 加 class，`translateY(28px)` + 0.85s。
- 可取：纸感不是滤镜，是**留白比例 + 细规则线 + 小号大写标签**；卡片用 1px 边框而不是阴影堆叠。
- 不取：整站仍是「居中 hero + 三竖卡 + 服务四卡 + 深色统计 + FAQ」的通用顺序；动效只有一次性上移；三色贴纸偏装饰。03 改成**书页/校样**结构：左栏页码、右栏正文、页边批注，不用居中大 hero。

### I-console-lab（主人喜欢）
- 读源码：骨白 `#f7f6f2`、lime `#dcf986` 做唯一强调、精密网格、console 里 agent 列表 + 事件流 + 计数。内容是真的在讲五岗，但仍是「控制台 mock」。
- 可取：**状态词**（running / done / gate: human）比形容词有信息量；事件流按时间写。
- 不取：lime 胶囊 + 白底控制台已被 E/I 用过；数字（1.8s、+3、12）没有来源，不能当事实。04 改成深色实验台，只写**可观察状态**，不写没来源的时延/吞吐。

### C-dither-laser
- 读源码：`#070708` + Bayer 8×8 dither + 珊瑚激光线 `#E85A2A` + canvas 粒子 + 命令面板。氛围强，但**珊瑚色和 16 页同一支**，且粒子/扫描是背景装饰，不承载信息。
- 可取：dither 作为**材质**而不是贴图；细线激光只做一条，不铺满。
- 不取：粒子、发光、珊瑚。04 的 dither 只出现在标题字与结果卡的半调网点里，激光线只有一条，颜色换薄荷青。

### K-liquid-metal（已知移动端弱、内容薄）
- 读源码与 `MOBILE.md`：iframe 内 WebGL 按钮、移动端靠 fallback、正文只有五岗五卡 + 四条作品链接。`MOBILE.md` 自己承认 320 宽会裁光晕。
- 学到：重材质只能当**一个 CTA**，不能当整页；移动端必须给固态 fallback。04 不用 WebGL，用 CSS dither + 一条扫描线，390 宽不依赖任何 hover。

### E-bento-bright（主人喜欢）
- 读结构：hero 一句话 + 色块 bento + 进度条 + 作品链接 + 作者注。可取的是**块与块之间有色彩节奏**；不取的是「一块一色」容易变成色卡展示。
- 04 的实验台借「面板 + 状态」的信息密度，但配色只用黑/灰/薄荷青三档，不铺彩色。

### surface-kit / atlas
- 打开 `PORTALS.md` 与 `portals/atlas/index.html`；atlas 的可取处是**目录感**：masthead、卷号、筛选 chip、可展开条目。
- 03 借「目录/卷号/条目」的信息组织，不抄它的筛选交互；03 的交互换成「编辑台三档」。
- `PACK/` 在本机不存在（`ls` 只有 `portals/`、`PORTALS.md`），按 INSTRUCTIONS 不编造 PACK 内容。**evidence_gap**。

### 第一批 16 页（只为避开）
源码审计（`prod-20261113-t2906-webcraft-16/pages/*/index.html`）：
- 15/16 页引了 GSAP，但动效句式高度同构：`gsap.from(el,{opacity:0,y:6,filter:'blur(2px)'})`。全批 `blur(2px)` 出现 21 次，`blur(4px)` 4 次；`y` 多为 6–14px；几乎都是**整块元素**一起动，没有字/词/行级 stagger。
- 只有 1 页用了逐词触发（`.tagline .w`），其余是「一次性进入、不复播」。滚动只负责「出现过」，不负责「正在发生」。
- 字号层级靠 `clamp()` 调，但字效家族单一：没有 type-assembly、没有 list-reveal 的 scale+blur、没有 scan-bracket、没有字符解码；`filter: blur` 只当轻微入场，不构成「同一进度三通道」的显影。
- 配色：01/02/05/06/07/08/10/15/16 都是浅米/骨白/奶油底（`#F3F0E8`、`#FAF8F1`、`#f1ece1`、`#e9e6df`、`#f3eee3`、`#f6f5f0`、`#F2EEE5`、`#f8f6f0`、`#fff8ee`），强调色集中在珊瑚/橙红（`#C64A2C`、`#E0492E`、`#FF5A1F`、`#C5432B`、`#FF4B2B`）。远看是同一本册子。
- 结论：第二批不能只换皮。03 保留「纸」，但把底改成偏冷的骨灰、强调改成**普鲁士蓝**，并把 hero 从「衬线大字居中」改成**活字排版台**；04 直接走到近黑 + 薄荷青 dither，和 01 的深金、02 的亮 bento 分开。

---

## 4. 四站分色与分技法（本批只做 03/04）

| 站 | 底色 | 强调 | 英雄技法 | 字效家族 | UI 动效骨架 |
|---|---|---|---|---|---|
| 01（并行会话） | 电影感深色 | 金 | 深色电影感镜头/字幕 | 未定（由 01 负责） | 未定 |
| 02（并行会话） | 亮色 | 高饱和块色 | 明亮 bento | 未定（由 02 负责） | 未定 |
| **03 纸感/骨色编辑向** | 冷骨灰 `#DCD8CD` / 纸白 `#F1EEE5` | **普鲁士蓝 `#1E3F6E`** | 活字排版台：铅字块从字盘吸进 composing stick，压印落定 | type-assembly（hero）+ blur-slide ×2 + 墨扫 gradient-word-sweep + list-reveal | 编辑台三档（语气/长度/证据）切换，2.6s 重排后停稳；校样段 scrub 批注 |
| **04 控制台/实验室（dither-laser）** | 近黑 `#08090B` / 面板 `#101316` | **薄荷青 `#63F0CE`** | 抖动激光实验台：一条扫描线把标题从半调噪点里「显影」出来 | 字符解码（dither-decode）+ blur-slide ×2 + scan-bracket + 状态列揭示 | 「跑一遍」四拍：读技能→拆活→产出→自检，2.8s，结束停在 `settled` |

共同纪律：03 不用 pin，04 不用 pin；两站都不装 Lenis；都用原生滚动 + ScrollTrigger；移动端 390 宽先过。

---

## 5. 参考与质量条

**打开过的参考**
1. https://surface-atlas.deed.page/ （HTTP 200，2026-11-13）：骨纸目录的 masthead/卷号/筛选组织；无可显示的点赞数。
2. https://www.awwwards.com/websites/typography/ （HTTP 200，正文被截断）：只确认了「排版类站点以字级/网格为主」，**看不到点赞/收藏数**。
3. 本机 `H-paper-studio`、`I-console-lab`、`C-dither-laser`、`K-liquid-metal`、`E-bento-bright` 源码与截图（非公开帖，无互动量）。
4. `SAMPLE-REV4.mp4` 抽帧 5 张（`output/notes/_refs/`）。

**evidence_gap**：当前环境无 web_search key，小红书/X 原帖打不开，拿不到「高赞/高收藏」与发布时间；不编造互动量、不虚构帖子 URL。质量条改为对**本机已验证的样片参数 + 主人已点赞的 E/H/I** 执行，而不是对编造的数字执行。

**可观察质量条**
- 前 2 秒：一屏内必须出现「字在组装/显影」的主事件，而不只是标题上移。
- 2–4 秒：出现第二个信息层（标签、编号、状态或批注），且最后一拍完全停稳。
- 390 宽：标题 ≤ 3 行内可读，正文 ≥ 15px，任何卡片不横向溢出，按钮 ≥ 44×44。
- 动效只用 transform/opacity/filter；无 bounce、无粒子、无发光边框。
- 文案：每一句都能对应到一个可指认的动作或文件；没有「赋能/闭环/打造/引领」。

---

## 6. 文案口径（两站共用）

- 只写可核验的能力：读技能文件、按 brief 拆活、并行委派、留 run/asset/self-check 账、产出可打开的页面。不写模型参数、不写榜单、不写「官方」。
- 不把任务号、SAMPLE、授发写进正文。
- 数字只用两类：①页面自身的序号/页码；②可数的动作步数（四道工序、三段委派）。不写时延、吞吐、提升百分比。
- 非官方声明只出现一次，放页脚：「非官方页面，与 xAI / Grok 无隶属关系。」
