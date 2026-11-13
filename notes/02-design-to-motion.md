# 02 · design-to-motion

- **清单原文（不改写）**：`2 AI 编码与设计 Skills | design-to-motion | 将静态设计转化为像素级动画的 AI 设计 Skill（可导出 MP4 和 GIF）。`
- **检索时间**：2026-11-13 16:24（Asia/Shanghai）
- **许可证**：MIT（仓库 `elayadesign/ai-design-skills`）

## 是什么

把一张静态设计（Figma 帧、截图、仪表盘、卡片组、App 屏）复刻成像素级 HTML，然后从空态演一遍「装载 → 每个视觉演自己的故事 → 无缝循环」，最后导出 X 用 MP4、网站 GIF、800×500 GIF。它不是「给设计加一点动效」，而是一套有验收阈值的动效复刻流程：先保证静止帧和设计一致，再谈动。

来源：原在 <https://github.com/elayadesign/ai-design-skills> 的 `skills/design-to-motion/SKILL.md`；2026-10-27 的提交 `ded7efc9d5` 把它移出，提交说明写「now lives at elayadesign/Design-to-motion」。**evidence_gap**：该独立仓库地址 2026-11-13 打开为 404（`api.github.com/repos/elayadesign/Design-to-motion` 返回 Not Found），所以本文以仍可打开的固定提交为准，不把 404 仓库当来源。工作区副本 `.skills/design-to-motion/SKILL.md`。

## 关键技法

1. **先分上下文**：Showcase（整帧动画、导出三件套、循环后溶解回空态）vs Website（只动 hero 和有视觉的卡片，滚动进场一次，故事循环不停）。同一份 skill，两种开始与结束方式。
2. **空态先行**：第一帧永远是空态，不是完成帧。App frame 保留静态拼合面（侧栏/主体），只让内容装载；独立卡片则连卡片一起升起。背景永不参与动画。
3. **装载编排**：`card` 从 `translateY(24px) scale(.985) blur(6px)` 起来；`up` 10px、`down` -8px、`left` -10px、`pop` 从 .82–.88、`photo` 先骨架后 14px 模糊转清晰；容器按阅读顺序 80–90ms 错开，组内 30–80ms；全帧约 2–2.5s。
4. **故事循环才是主体**：每个视觉写一句话故事，例如「新线索落在顶部，旧的退一格，最后一条离开」；故事 3–8s，卡片之间错峰，起止都要回到设计态；只有计数器与打字可以改文字。
5. **可读性下限**：故事在 800×500 GIF 里仍要看得见；小于约 4px 的脉冲点要放大或换更大的动作。
6. **缓动 token**：进场 `cubic-bezier(.16,1,.3,1)` 1.05s；透明度/模糊 `(.33,1,.68,1)` 0.7–0.8s；擦除/填充 `(.65,0,.35,1)`；线性只给 shimmer/播放这类匀速运动。
7. **只动便宜属性**：`transform/opacity/filter/clip-path`；模糊 ≤14px；`prefers-reduced-motion` 直接给静止帧。
8. **自检量化**：溢出检查（容器真实圆角）、接缝检查（导出窗首帧 = 下一循环同帧）、空拍检查（空态段每帧等于起点）、归位检查（溶解前最后一帧 = 装载完成帧）、接触表（empty/mid/landed/stories/dissolve 拼图看鬼影）。
9. **确定性录制**：用假时钟逐帧步进，不在真实时间录屏；步长取整毫秒、平均 1000/60，`__start()` 与 seek 在同一次 evaluate 里执行。
10. **导出规格**：MP4 H.264 / yuv420p / 60fps / CRF 14–15 / `+faststart`；网站 GIF 960px 宽 15–20fps；800×500 GIF 必交。

## 如何复用到我们的制作管线

- 本批第 2 页 `pages/02-design-to-motion/index.html` 按 Website 上下文做：hero 文字 6px/2px/50–70ms 进场，下方四张例程卡整卡升起，每张卡的视觉各演一个循环故事，离屏暂停。
- 以后做产品页的 bento 区，可直接复用「卡内视觉各自演故事」的做法，而不是全页统一淡入。
- 需要出 GIF/MP4 时，按 Part C 的假时钟截帧 + ffmpeg 参数；本批不出视频，只在页面里做可暂停的循环。
- 这套方法对静态图也适用，但要先向主人说明哪些是 CSS 重建、哪些是裁图、哪些是猜的；不许把整张截图当一块动画。

## 核实记录

- 仓库 API（2026-11-13 16:23）：`stargazers_count=15420`，`license=MIT`。
- skill 文件 Credits：Part of ai-design-skills by Elaya, MIT；部分通用动效规则改编自 `emilkowalski/skills`、`Owl-Listener/designer-skills`、`dylantarre/animation-principles`（均 MIT）。
- 未把星标写进页面。

## 来源 URL

- 仓库：<https://github.com/elayadesign/ai-design-skills>
- Skill 原文（固定提交 `5e578402da`，2026-10-26；已验证 200）：<https://raw.githubusercontent.com/elayadesign/ai-design-skills/5e578402da175cdc539c900e4b09ceecfadcb37c/skills/design-to-motion/SKILL.md>
- 迁出提交（可打开）：<https://github.com/elayadesign/ai-design-skills/commit/ded7efc9d5>
- 迁出后指向的独立仓库（2026-11-13 为 404，evidence_gap）：<https://github.com/elayadesign/Design-to-motion>
- 同仓库姊妹 skill：<https://github.com/elayadesign/ai-design-skills/tree/main/skills/landing-page-design>
