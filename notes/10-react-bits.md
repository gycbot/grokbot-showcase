# 10 · React Bits

- 清单原文：网页设计灵感与参考 | React Bits | 提供动效组件与设计灵感。
- 本批编号：10 / 16
- 检索时间：2026-11-13 16:28–16:36（Asia/Shanghai）
- 核实来源：https://reactbits.dev/ 、https://github.com/DavidHDev/react-bits 、https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md
- 结论：已核实。GitHub API 在检索时返回 51,846 stars、最后 push 2026-11-10；这是仓库读数，不是主人清单里的数字。

## 是什么

React Bits 是一个开源的 React / Next.js 动效组件库，首页写的是 “React components for creative developers”。它把内容分成 Text Animations、Animations、Components、Backgrounds、Micro Interactions 五类；组件以源码形式交付，可以选 JavaScript 或 TypeScript，样式可以选纯 CSS 或 Tailwind，也可以直接用 CLI 装某一个组件。

它的定位不是“装一个包、黑盒调用”，而是“把源码装进你的项目，你自己拥有并可以改每一个参数”。首页也明确写了 “Built for humans and AI agents”，并提供 Pro 层；本笔记只读公开文档与仓库，没有使用 Pro 内容。

## 关键技法

1. **遮罩式文字入场**：每行文字外面套一层 `overflow:hidden`，内部整行从下方 100% 推到 0，按行错开 60–120ms。比逐个字符跳动更稳，中文长句也不会散。
2. **聚光卡片（Spotlight）**：卡片监听指针位置，把 `--mx/--my` 写到 CSS 变量，伪元素用 `radial-gradient` 在指针处提亮；离开后淡出。成本低，适合三到四张并排的能力卡。
3. **按阅读顺序错开**：卡片、标题、说明的入场延迟按阅读顺序排，不整块同时淡入。
4. **组件即源码**：每个组件可单独取用、改参数；不引入整套设计系统。
5. **背景与前景分离**：Backgrounds 类组件只做环境，文字和交互仍在普通 DOM 里，便于响应式和可访问性。

## 如何复用到我们的管线

- 第 10 页把“遮罩式文字入场”用在三行主标题上：外层 `overflow:hidden`，内层 `yPercent:112 → 0`，`power4.out`，行间 90ms。
- 三张“来源 / 尺寸 / 缺口”检查卡用了聚光效果：指针移动写 CSS 变量，径向高光只在一张卡内出现；触屏不依赖 hover，静态也完整。
- 例程时间轴用“按阅读顺序错开”的节奏：进度线先画，四个节点再依次点亮，和 React Bits 的分段入场同一思路。
- 没有复制任何组件源码；页面是原生 HTML/CSS/GSAP 重写，只保留方法。

## 许可证与使用限制

- LICENSE.md 写的是 **MIT + Commons Clause License Condition v1.0**，Copyright (c) 2026 David Haz。
- 允许：把组件作为应用、网站或产品的一部分使用，包括商业用途；修改、分发（作为产品的一部分）。
- 禁止：单独、打包或作为移植版本**转售、再授权、再分发组件本身**；也禁止把 Background Studio、Texture Lab、Shape Magic、Center Stage、Sound Lab 等工具或音库本身转售、再授权、再分发，或做成实质相同的托管服务。
- 用工具导出的代码、图片、视频、音频可以用在个人或商业项目里，但不能把导出物本身当产品卖（例如单独卖音效包、纹理包、背景包、模板包）。
- 需保留版权与许可声明（作为软件的一部分分发时）。
- 本站没有使用 Pro 付费内容，也没有复制组件源码。

## 核实记录

- 2026-11-13 16:28 打开 https://reactbits.dev/，HTTP 200；读到五个分类、源码交付方式、Pro 入口。
- 2026-11-13 16:29 调用 GitHub API `repos/DavidHDev/react-bits`：`stargazers_count=51846`、`pushed_at=2026-11-10T08:14:01Z`、`license=Other/NOASSERTION`、`homepage=https://reactbits.dev`。
- 2026-11-13 16:30 读取 `LICENSE.md` 原文，确认 MIT + Commons Clause 的具体限制。
- 站点的 star 数只作为仓库活跃度读数，不写成“全网第一”或排名。

## evidence_gap

- Pro 层内容未购买、未访问；本页只使用公开免费文档与仓库信息。
- 没有可核实的点赞、收藏、播放量；不写互动量。
