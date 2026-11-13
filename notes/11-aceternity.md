# 11 · Aceternity

- 清单原文：网页设计灵感与参考 | Aceternity | 提供前端设计灵感与炫酷组件。
- 本批编号：11 / 16
- 检索时间：2026-11-13 16:28–16:40（Asia/Shanghai）
- 核实来源：https://ui.aceternity.com/ 、https://ui.aceternity.com/pricing
- 结论：已核实站点、免费层与付费层；授权说明来自站点 FAQ，不是 SPDX 许可证文件，引用时按“站点条款”处理。

## 是什么

Aceternity UI 是一个面向 React / Next.js 的动效组件库，技术栈写明是 Tailwind CSS 与 Motion（原 Framer Motion）。它分三层：

- **免费层**：100+ 个可复制粘贴的组件，官方 FAQ 说可用于个人与商业项目。
- **付费 All-Access**：200+ premium Blocks、15+ 模板、5 个完整落地页、18 个 Interactions（微交互）；定价页写 169 美元一年授权（常规价 249 美元），一次性付款，不是订阅；含一年更新。
- **AI 工具接入**：提供 MCP / registry，支持 Claude Code、Codex、Cursor 等按名字找组件。

公开组件目录里能直接看到 3D Card Effect、3D Pin、Animated Tooltip、Aurora Background、Background Beams、Bento Grid、Card Hover Effect、Floating Dock、Globe、Hero Parallax、Infinite Moving Cards、Lamp Effect、Macbook Scroll、Moving Border、Parallax Scroll、Sparkles、Text Generate Effect、Timeline、Tracing Beam、Wavy Background 等。

## 关键技法

1. **Lamp Effect（灯罩光束）**：从顶部一个点向下打出一束锥形光，页面主体在光里出现；光本身是装饰层，不承载信息。
2. **Background Beams / Tracing Beam**：用 SVG 路径或渐变线做“能量流”，沿着连接关系走，强调方向与路径。
3. **Moving Border（移动边框）**：卡片外圈用旋转的 conic-gradient 露出一段高亮，内部用不透明底盖住，只留 1px 的边在动。
4. **Text Generate Effect**：文案按词从模糊、低透明到清晰，像逐词生成；适合一段短说明，不适合长正文。
5. **Bento / Hero Parallax**：把能力拆成大小不一的格子，滚动时前后层速度不同；信息密度高但不靠堆卡片边框。

## 如何复用到我们的管线

- 第 11 页把“灯罩光束”放在路由面板左上：一个低透明度的锥形色块加 38px 模糊，从顶部照到 bot 节点；不抢文字，只交代“谁在发指令”。
- “移动边框”用在 `BRIEF / LOCKED` 卡片：外层 1px 容器里放一个旋转的 conic-gradient，内层纸色底盖住，只有边在走。没有用发光，也没有用紫色。
- “逐词生成”用在导语：每个短语从 `opacity:0 + blur(4px)` 到清晰，间隔 28ms；只用于这一句，正文保持静态。
- 路由面板的四条 lane 用“同一节点向下分叉”的结构，替代 Aceternity 的 Background Beams：一条主线、四条横枝、四个编号，方向清楚，移动端改成单列。
- 没有复制它的任何组件源码、模板或付费素材；页面是原生 HTML/CSS/GSAP 重写。

## 许可证与使用限制

- 站点 FAQ 原文（2026-11-13 读取）：“Yes. You can use Aceternity UI components in unlimited personal and commercial client projects. The only restriction is that you cannot resell or redistribute the components themselves as a competing template or component library.”
- 免费层：可用于个人与商业客户项目；不能把组件本身当作竞品模板/组件库转售或再分发。
- 付费层：需要购买 All-Access 授权；定价页写明 169 美元一年授权、一次性付款、含一年更新；退款政策写明不退款（购买即获得完整源码与下载）。
- 站点没有给出 SPDX 标识的 LICENSE 文件；以上是产品 FAQ 的口径，不等同于 OSI 许可证。商用前应按具体组件页与购买条款复核。
- 本站没有购买付费层，也没有复制 premium block、模板或页面。

## 核实记录

- 2026-11-13 16:28 打开 https://ui.aceternity.com/，HTTP 200；读到组件目录与“100+ free components / 200+ premium Blocks”等文案。
- 2026-11-13 16:31 打开 https://ui.aceternity.com/pricing，HTTP 200；读到 Free 与 1-Year License 的权益、价格、FAQ。
- FAQ 的“Can I use Aceternity UI components in commercial projects?”用页面内嵌 JSON-LD 与折叠面板两处对照，文本一致。
- 没有把“100+ / 200+”当作排名或质量证明，只当作站点自述的规模。

## evidence_gap

- 免费层的具体组件是否每一个都允许商用，FAQ 给的是整体口径；单个组件页若有额外说明，未逐页核对。
- 付费层的完整条款、退款细则只读到定价页摘要，未购买因而未读到购买后的完整授权文本。
- 没有可核实的点赞、收藏、播放量；不写互动量。
