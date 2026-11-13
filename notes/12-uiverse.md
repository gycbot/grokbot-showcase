# 12 · Uiverse

- 清单原文：网页设计灵感与参考 | Uiverse | 提供丰富的 UI 组件与设计灵感。
- 本批编号：12 / 16
- 检索时间：2026-11-13 16:29–16:38（Asia/Shanghai）
- 核实来源：https://uiverse.io/ 、https://github.com/uiverse-io/galaxy
- 结论：已核实。站点页脚与仓库都写 MIT；GitHub API 在检索时返回 14,996 stars、最后 push 2024-09-02（仓库较久未更新，站点仍在运营）。

## 是什么

Uiverse 是一个社区共建的开源 UI 元素库，首页写 “The Largest Library of Open-Source UI”。元素以 HTML/CSS 为主，也可以复制成 Tailwind、React 和 Figma。分类包括 Buttons、Checkboxes、Toggle switches、Cards、Loaders、Inputs、Radio buttons、Forms、Patterns、Tooltips。

它的单位很小：一个按钮、一个开关、一个加载器、一个复选框。每个元素由社区作者提交，页面提供 “Get code” 与作者链接。价值不在一个大而全的设计系统，而在大量可拆开看的最小实现。

## 关键技法

1. **单元素自包含**：一个按钮的 HTML 加 CSS 就能独立运行，不依赖整套框架；适合做小范围试错。
2. **状态写全**：hover、active、focus、checked、disabled 都有明确样式；按压用 `translateY(1px)` 或 `scale(.98)` 给触感，不靠阴影堆叠。
3. **方角与细边**：大量元素用 1px 边、直角或小圆角，靠底色和位移区分状态；比大圆角加渐变更耐看。
4. **加载器作为节奏**：三根柱、几个点、一条线的循环，周期 1–1.5s；只在一个动作等待时出现，不常驻。
5. **开关的可读性**：轨道与滑块必须有明暗差，打开/关闭不能只靠颜色，最好同时有位置变化。

## 如何复用到我们的管线

- 第 12 页的“口味台”是一组手写的小组件：三组分段按钮、一个方形开关、一个复选框、一个三柱加载器、一个按压按钮。全部原生 CSS，没有引入组件库。
- 开关用“轨道反色 + 滑块位移”表达状态：关是纸色轨道加墨色滑块，开是墨色轨道加纸色滑块；不只靠颜色。
- 加载器只在写入记忆的 520ms 内出现，结束就隐藏；不常驻、不假装一直在忙。
- 分段按钮的 active 用底色反白，hover 只改边色，按压 `scale(.97)`；三种状态分开写。
- 口味选择写入 `localStorage`，刷新后还在；页面明确写“只写本机，不上传”，不把它说成云端记忆。

## 许可证与使用限制

- 站点页脚原文：“MIT License — All content (UI elements) on this site are published under the MIT License.”
- GitHub 仓库 `uiverse-io/galaxy` 的 API 返回 `license: MIT License`。
- MIT 允许使用、复制、修改、合并、发布、分发、再授权和/或出售软件的副本，条件是保留版权声明与许可声明。也就是说，若直接复用某个元素的代码，应保留其作者/许可信息；本站页面是手写实现，没有复制具体元素，因此没有额外的署名负担。
- 站点是社区投稿，单个元素的作者与提交时间在元素页可见；本次没有逐个下载元素，无法给出逐元素作者清单。

## 核实记录

- 2026-11-13 16:29 打开 https://uiverse.io/，HTTP 200；读到首页定位、分类、复制格式与 “Star on GitHub”。
- 2026-11-13 16:31 打开 https://uiverse.io/about（404 页），页脚仍显示 MIT License 声明；说明该声明是全站页脚，不依赖 about 路由。
- 2026-11-13 16:32 调用 GitHub API `repos/uiverse-io/galaxy`：`stargazers_count=14996`、`pushed_at=2024-09-02T14:32:05Z`、`license=MIT`、`homepage=https://Uiverse.io`。
- 仓库最后 push 时间与站点 2026 年仍在更新是两件事，笔记里分开写，不混为“项目停更”。

## evidence_gap

- 没有逐个核对元素页的作者、提交时间与是否有额外说明；只使用站点级 MIT 声明与仓库许可证。
- 没有可核实的点赞、收藏、播放量；不写互动量。
- 站点首页动态加载的元素列表未完整抓取，分类以导航与页面文案为准。
