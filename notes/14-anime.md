# 14 · Anime（已核实为 anime.js）

- 编号：14
- 分类：网页设计灵感与动效参考
- 核实后的来源：https://animejs.com/ · https://github.com/juliangarnier/anime
- 检索时间：2026-11-13 16:33（Asia/Shanghai）
- 页面：`pages/14-anime/index.html`
- 状态：done（名称已核实：不是“动漫素材站”，是 anime.js 动画引擎）

## 它是什么

主人清单只写 “Anime”，没有给域名。我先按字面找“动漫/动画灵感站”，没有可核实的唯一对象；随后按“网页设计灵感与动效参考”这个分类，核实到最匹配的是 **anime.js**：一个用 JavaScript 驱动 CSS、SVG、DOM 属性和普通对象的动画引擎。官网标题 “Anime.js | JavaScript Animation Engine”，GitHub 仓库 `juliangarnier/anime`，MIT 许可。

截至 2026-11-13 打开的版本是 **v4.5.0**（npm `animejs` 的 latest；官网文档默认显示 4.0.0，可选 3.2.2 / 2.1.0）。v4 的 API 与 v3 不同，旧教程里的 `anime({ targets: ... })` 不能直接照抄。

核心能力：

- `animate()`：单条补间，属性可以是 CSS、SVG attribute 或 JS 对象
- `createTimeline()`：把多条动画排到同一条时间轴，用位置参数控制先后
- `stagger()`：按数量、网格、中心/边缘分配延迟
- `createDrawable()`：把 SVG path 变成可“画出来”的目标（`draw: ['0 0', '0 1']`）
- `createSpring()`：弹簧缓动
- `createDraggable()`：拖拽
- `onScroll()`：滚动同步（v4 内置）

## 关键技法

1. **时间轴优先，不用 delay 串**。`createTimeline({ defaults: { duration: 750 } })`，然后 `.add(target, params, position)`。位置参数可以是绝对秒数、`'<`（与上一条同起）、`'<0.2'`（上一条开始后 0.2s）。
2. **入场是“上浮 + 去模糊”**，不是从 0 放大。8–12px 的位移、2–4px 的 blur，按阅读顺序 50–90ms 一条。页面因此像“落位”，不像“表演”。
3. **SVG 线用 draw，不用 dashoffset 手算**。`createDrawable('path')` 之后 `draw: ['0 0', '0 1']`，线按路径长度长出来，和版式共用同一条时间轴。
4. **文字拆分做 stagger**。标题按词/字拆成 span，逐字从 muted 到 full，不整块淡入。
5. **只动 transform / opacity / filter**。位置用 `translate`，进度条用 `scaleX`，避免动 `width/top/left`。
6. **`prefers-reduced-motion` 直接给终态**。不是“动画变快”，而是取消位移和绘制。

## 怎么复用到管线

- **展示页 hero**：6–10px 上浮 + blur 2px，60ms stagger，1.2s 内结束；这是设计落位，不是开场秀。
- **分镜/关键帧预览**：用一条 `createTimeline()` 表示 0–3.6s 的镜头，range input 直接 `timeline.seek()`，可以在没有渲染器的情况下检查节奏。
- **SVG 图表/路径**：用 `createDrawable()` 做“数据线画出来”，比 CSS `stroke-dashoffset` 少算路径长度。
- **技能演示**：只在需要“证明会动”的地方用，不为每个卡片都写一套动画；这与 motion-house-style 的“2–4 秒一个新信息”一致。
- **产出**：页面里保留可读的源码片段，方便下一轮直接改成 Remotion / GSAP 版本。

## 许可证与使用限制

- **MIT**。GitHub `juliangarnier/anime` 的 LICENSE 为 MIT，Copyright (c) 2025 Julian Garnier。可商用、可修改、可再分发，保留版权与许可声明。
- 官网文档与示例代码可学习；示例里的品牌图形/角色不随 MIT 授权，不能当本页素材。
- 本页把 `anime.iife.min.js`（v4.5.0）放在共享 `vendor/`，页面用相对路径加载；不装 node_modules。

## 核实记录

- 2026-11-13 16:33 CST：https://animejs.com/ HTTP 200；`<title>Anime.js | JavaScript Animation Engine`；meta description “A fast, multipurpose and lightweight JavaScript animation library”。
- https://github.com/juliangarnier/anime：`license.spdx_id = MIT`，`pushed_at = 2026-11-02T22:25:55Z`，`stargazers_count = 74550`（GitHub API 当时返回；仅作核实记录，未写进页面当卖点）。
- https://animejs.com/documentation/timeline/：确认 `createTimeline()`、`timeline.add(target, params, position)`、`timeline.seek()`。
- https://animejs.com/documentation/stagger/：确认 `stagger(40)`、`createDrawable()`、`draw: ['0 0', '0 1']` 的用法。
- 未把 v3 教程里的旧 API 写进页面。
