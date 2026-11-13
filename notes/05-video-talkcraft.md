# 05 · video-talkcraft

检索时间：2026-11-13 16:30（Asia/Shanghai）
核实状态：来源已打开，许可证已读原文；主人清单里的「排行榜第 5 名」未核实，记为 evidence_gap。

## 是什么

一个面向口播 / 解说视频的 agent skill，装进 Claude Code 或 Codex 之后，把「口播稿 + 成品配音」变成一条带动效的解说片。它自己不生成配音（可选接 Fish Audio），核心工作是三件：把稿子对齐到字级时间戳、把语义拍写成 SHOTBOOK 分镜、用 Remotion 把分镜渲成视频。

仓库把能力拆成四块：

- **管线**：配音预剪 → 字级时间戳 → SHOTBOOK → Remotion 渲染 → 三重验收。
- **词汇**：100 多张动效配方卡，每张带意图、参数、已知坑、可直接复制的 Remotion 组件和可跑的 HTML demo。
- **镜头**：七层反 PPT 系统，每个场景只保留一条极缓的推拉相机曲线，再给主体让位。
- **视觉语言**：一套默认的排版与色彩纪律，进入具体片子前先按稿件判定领域、派生风格档。

## 关键技法

1. **字级时间戳是时间轴的真值。** 先把稿子对到音频的每个字，再让动效节拍锚在确切的字上。README 自报 110 秒中英混合口播的字级偏差中位 20–40ms、最差 200ms；这是项目自测，不是第三方复核。
2. **按语义拍切镜，不按句切。** SKILL.md 明确反对「一句一个新元素」，新元素只在语义段落边界进场；一个节拍只有一个主角，说完让位。这条直接治「堆积型凌乱」。
3. **相机做减法。** 每场一条极缓推进或拉出，idle 微动、环境呼吸、脉冲默认关闭。静止帧在结构上不成立，但不是靠加动效，而是靠一条持续的相机曲线。
4. **配方卡是「词汇」不是模板。** 卡进入片子要按风格档改皮（颜色、字体、圆角、图表样式），不改运动命门（时序、缓动、几何比例、层级）。这比整页套模板稳。
5. **依赖只留一份。** 所有工程的 `node_modules` 软链到 skill 根部的 `runtime/node_modules`，版本只钉一处；工程目录里永远不跑 `npm install`。README 记录：一份依赖约 760MB，之前六个工程各装一份合 3.9GB。这条对我们「不把磁盘撑满」是直接可借的做法。
6. **验三层。** 画面健康（静止段 + 并发光栅抖动）、纯音效轨逐 cue 能量、带锚点帧的评审拼图。评审材料先拼 3×4 网格再给模型看，省 token。

## 如何复用到我们的管线

- 做任何口播片：先落一份 `script + timing.json`，把每句话的首字和末字时间写死；分镜表只填「语义拍 / 主角 / 进场元素 / 退场元素 / 相机」五列，避免一句一卡。
- 做展示页：把「字级同步」变成页面上的可交互节拍条——用户按下播放，字逐个亮、分镜卡按字位切换。这比放一张分镜截图更能说明能力。
- 做工程管理：所有页共用 `vendor/` 一份 GSAP，不在每页目录装 `node_modules`；本批页面已经这样做。
- 做验收：先出关键帧，再出片；页面先出 1440×900 与 390×844 静帧，再谈动效。

## 许可证与使用限制

- **PolyForm Noncommercial License 1.0.0**。LICENSE 原文写明：非商业用途免费；**工具本身的任何商业使用须先获作者授权**（联系 Vincent Wei）。用该工具做出的视频归创作者所有，许可证只管工具本身。
- 本任务 `commercial_use: false`，且我们只学技法、不复制其代码或配方卡源文件，风险可控。若将来商用，需要换自研管线或取得授权。
- 内嵌音效另有 `demos/_lib/sfx/ATTRIBUTION.md`；B-roll 指南只收免署名源。我们没有搬运这些素材。

## 核实后的来源

- 仓库：https://github.com/Vincentwei1021/video-talkcraft （打开于 2026-11-13 16:29 CST）
- README 原文：https://raw.githubusercontent.com/Vincentwei1021/video-talkcraft/main/README.md
- LICENSE 原文：https://raw.githubusercontent.com/Vincentwei1021/video-talkcraft/main/LICENSE
- SKILL.md 原文：https://raw.githubusercontent.com/Vincentwei1021/video-talkcraft/main/SKILL.md
- GitHub API 元数据：https://api.github.com/repos/Vincentwei1021/video-talkcraft （2026-11-13 16:30 CST 读到 2301 stars / 235 forks，`pushed_at` 2026-11-09T02:29:30Z；星数会变，引用时注明时间）

## evidence_gap

- **「排行榜第 5 名」**：没有找到任何榜单页或评选说明能支撑这个名次。不写进页面，不当作已核事实。
- **卡数口径不一**：README 多处写 108 张，仓库简介写 109 张。页面统一写「100 多张」，不写死具体数字。
- **字级偏差 20–40ms**：项目自报，未见第三方复测；页面只写「字级对齐」，不引用毫秒数当独立结论。
- 仓库 LICENSE 在 GitHub API 里显示 `Other / NOASSERTION`，但 LICENSE 正文是 PolyForm Noncommercial 1.0.0；以正文为准。
