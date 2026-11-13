# 03 · HyperFrames

- **清单原文（不改写）**：`3 DSH 剪辑与动效 | HyperFrames | DSH 热门剪辑/动效项目（GitHub 超 4.4 万星，排行榜第 1 名）。`
- **检索时间**：2026-11-13 16:26（Asia/Shanghai）
- **许可证**：Apache License 2.0（仓库根 `LICENSE`）

## 是什么

HyperFrames 是「用 HTML 写视频」的开源框架：一份 composition 就是一个 HTML 文件，DOM 用 `data-start`、`data-duration`、`data-track-index` 这类属性声明时间，动画运行时必须可 seek，媒体播放由框架接管，最后渲染成确定性 MP4。它面向 agent：仓库同时发布 9 个 skill，教编码代理完成「写合规 HTML → 接可 seek 动画 → lint → preview → render」的整条链路。官方一句话是 **Write HTML. Render video. Built for agents.**

来源：<https://github.com/heygen-com/hyperframes>；文档入口 <https://hyperframes.heygen.com/quickstart>。

## 关键技法

1. **HTML 即时间线**：根节点 `data-composition-id` 与 `data-width`/`data-height`/`data-duration` 定义画布与时长；每个片段用 `data-start` + `data-duration` 定位，`data-track-index` 管轨道层级，`class="clip"` 标记可被运行时隐藏的片段。
2. **一条 paused timeline**：每个 composition 只注册一条 `gsap.timeline({ paused: true })` 到 `window.__timelines["<id>"]`，key 必须等于根 `data-composition-id`；子时间线由运行时自动嵌套，不手写嵌套。
3. **确定性优先**：渲染长度看根 `data-duration`，不看时间线自然长度；禁止 `Math.random()`、`Date.now()`、CSS transition、`setTimeout` 驱动画面；所有状态由时间推导，保证逐帧可复现。
4. **轨道/片段模型**：用 `npx hyperframes timeline --json` 读绝对起止时间，而不是人肉翻 HTML；片段之间可以重叠、跨轨、嵌套子 composition。
5. **媒体归框架管**：`<video>`/`<audio>` 由框架 seek 与解码，任意嵌套深度都能找到；但 `<video data-start>` 不能放在另一个也带 `data-start` 的普通元素里（`video_nested_in_timed_element` 会报错）。
6. **先 lint 再渲染**：常见首轮错误包括 CSS 初始 `transform` 与 GSAP 同属性冲突（`gsap_css_transform_conflict`）、standalone 根被 `<template>` 包住、时间线 key 与 root id 不一致。`npx hyperframes check` 先过，再 preview/render。
7. **CLI 工作流**：`npx hyperframes init <project>` → 写 composition → `npx hyperframes preview`（热更新）→ `npx hyperframes render`；依赖 Node 22+ 与 FFmpeg。
8. **技能分层**：`/hyperframes` 是入口与合同，`/hyperframes-core` 是组合契约，`/hyperframes-cli` 是命令，`/hyperframes-animation` 是动画适配器，`/hyperframes-registry` 提供约 450 个可编辑区块。
9. **面向代理的失败前置**：把「首轮必犯的错」写进 skill 正文（如 `gsap_css_transform_conflict`），让代理在写第一版时就避开，而不是渲染失败后猜。
10. **Studio 与开源分层**：CLI/框架开源（Apache-2.0），桌面 Studio 免费，Pro 计划叠加 HeyGen 的模型额度；开源部分不依赖付费即可本地渲染。

## 如何复用到我们的制作管线

- 本批第 3 页 `pages/03-hyperframes/index.html` 用它的**轨道/片段/播放头**模型讲 Grok Bot 的委派能力：三条轨道、带起止时间的片段、一条 paused GSAP timeline、可拖动 seek；页面明说「这是轨道模型预览，不是已渲染 MP4」。
- 以后做真正的短视频，可以按这个合同写 composition：先定画布与总时长，再把每个镜头写成带 `data-start`/`data-duration` 的 clip，所有动画由一条 paused timeline 驱动。
- 本机磁盘只剩约 17G，**没有**安装 `hyperframes` npm 包，也没有渲染 MP4；本批只取它的时间线模型做网页交互，不冒充跑过 CLI。
- 若后续要装：只装到共享 `vendor/`，不每页一套 `node_modules`；Node 22+、FFmpeg 需先确认。

## 核实记录（含与主人清单的差异）

- GitHub API（2026-11-13 16:25）：`full_name=heygen-com/hyperframes`，`stargazers_count=83604`，`forks_count=7715`，`license=Apache-2.0`，`created_at=2026-03-10T01:51:06Z`，`updated_at=2026-11-13T08:26:25Z`，`archived=false`。
- 主人清单写「GitHub 超 4.4 万星，排行榜第 1 名」。复核结果：星数为 **83,604**，不是 4.4 万；**「排行榜第 1」没有找到可打开的榜单页，记 evidence_gap**，页面不引用该名次。
- README 自带 star-history 徽章，但徽章图片不等于可核榜单；不作为名次证据。

## 来源 URL

- 仓库：<https://github.com/heygen-com/hyperframes>
- README（raw，已验证 200）：<https://raw.githubusercontent.com/heygen-com/hyperframes/main/README.md>
- 快速开始：<https://hyperframes.heygen.com/quickstart>
- 组合契约（工作区只读副本）：`[local working copy, omitted from this public site]`
- 入口 skill（同上）：`[local working copy, omitted from this public site]`
