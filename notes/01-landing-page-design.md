# 01 · landing-page-design

- **清单原文（不改写）**：`1 AI 编码与设计 Skills | landing-page-design | 从零构建落地页的 AI 设计 Skill（包含页面结构、视觉系统等）。`
- **检索时间**：2026-11-13 16:22（Asia/Shanghai）
- **许可证**：MIT（仓库 `elayadesign/ai-design-skills`；该 skill 的 Credits 另注明部分章节改编自 MIT 的 `Leonxlnx/taste-skill`）

## 是什么

一份给 AI 编码代理用的落地页设计 Skill：把「一页只赢一个意图」拆成可执行的两半。Part A 是策略与结构（目标动作、受众、版式选择、转化文案、SEO/AEO），Part B 是不留发挥空间的视觉系统（字体、字号阶、间距阶、圆角、背景、hero、图标、动效、状态、上线清单）。它不是组件库，也不是模板；它要求先回答「这一页让谁做什么」，再动 CSS。

来源：<https://github.com/elayadesign/ai-design-skills>（仓库根目录 `skills/landing-page-design/SKILL.md`）。本次读的是仓库 MIT 版本，工作区副本在 `.skills/landing-page-design/SKILL.md`。

## 关键技法

1. **一页一个主动作**：首屏只有一个 CTA，不允许竞争动作；布局从 A 经典 hero、B 长故事、C 极简转化、D 对比页里明确选一个并写理由。
2. **两半顺序**：先 A 后 B。文案没定之前不选字体，版式没定之前不做动效。
3. **数值化视觉系统**：字号只落在 Tailwind 的 12/14/16/18/20/24/30/36/48/60/72/96/128 阶；间距只用 0/2/4/8/12/16/24/32/40/48/64/80/96；圆角只用固定阶，并遵守 `inner = outer − gap`（差值 >2 才用）。
4. **背景纯平**：禁止背景渐变；唯一允许的渐变是 hero 标题文字的左到右明度渐变。
5. **Hero 约束**：标题与副标题最大宽度 680px，按语义断行；标题不许出现孤字（`text-wrap: balance`）。
6. **动效曲线固定**：`cubic-bezier(0.22,1,0.36,1)`，布局位移 500ms，颜色/透明度 300ms（不低于 200ms）；只动 `transform` 与 `opacity`，滚动进场只触发一次，用 IntersectionObserver，不用未节流的 scroll 监听。
7. **Tagline reveal（强制节）**：独立于 hero 的一节大字，最少两行，文字从 25–35% 明度按词逐字激活，词过触发线才变色。
8. **内容真实感**：写真实句子，不写占位拉丁文；人名、公司名、数字要像真实产品；禁 `revolutionize`、`effortless` 一类空词；标题与按钮用句首大写。
9. **状态齐全**：hover / active / focus / loading / empty / error 六态；按钮指向 `#` 要么真链要么视觉禁用。
10. **上线清单**：法务链接、404、表单校验、跳转正文链接、favicon、title/meta/og、alt、语义标签。

## 如何复用到我们的制作管线

- 这页本身就是复用：`pages/01-landing-page-design/index.html` 用它的 A2 结构（hero → 三段收益 → 三步执行 → 技能解剖 → FAQ → 收尾 CTA），B11 词级 reveal，B7 的进场曲线与一次性触发。
- 之后所有「一页讲清一个能力」的网页，都可以套这份骨架：先写一句话主动作，再填 3 个收益与 3 步执行，最后用 FAQ 处理反对意见。
- 视觉数值可以直接抄成 CSS 变量：字号阶、8px 间距、680px 文本宽度、`--ease-out: cubic-bezier(.22,1,.36,1)`。
- 不适用：需要多意图导航的官网首页；这时应换 `redesign-existing-projects` 或站点信息架构方法，而不是把落地页规则硬套。

## 核实记录

- 仓库 API（2026-11-13 16:23）：`full_name=elayadesign/ai-design-skills`，`stargazers_count=15420`，`forks_count=1183`，`license=MIT`，`created_at=2026-07-29T06:43:16Z`，`updated_at=2026-11-13T08:26:50Z`。
- README/许可：仓库根 `LICENSE` 为 MIT；skill 文件末尾附 taste-skill 的 MIT 全文。
- 没有把任何星标数写进页面文案；笔记里的数字只作来源核对记录。

## 来源 URL

- 仓库：<https://github.com/elayadesign/ai-design-skills>
- Skill 原文（raw，main 分支）：<https://raw.githubusercontent.com/elayadesign/ai-design-skills/main/skills/landing-page-design/SKILL.md>
- 姊妹 skill：<https://github.com/elayadesign/ai-design-skills/tree/main/skills/design-to-motion>
