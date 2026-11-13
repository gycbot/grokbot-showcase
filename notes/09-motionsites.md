# 09 · motionsites

- 清单原文：网页设计灵感与参考 | motionsites | 提供 3D 首屏、滚动动画、液态玻璃等交互灵感。
- 本批编号：09 / 16
- 检索时间：2026-11-13 16:27–16:33（Asia/Shanghai）
- 核实来源：https://motionsites.ai/ 、https://motionsites.ai/terms
- 结论：已核实站点与定位；清单里的“液态玻璃”未在公开首页文本中单独核实，标为 evidence_gap，不当作已核事实。

## 是什么

MotionSites AI 是一个面向 AI 建站工具的**付费 prompt 库**，公开首页把自己写成 “AI Website Prompts & Design Inspiration”，主标题是 “Unlock your AI Design Superpowers”。导航里有 Sites、Dashboards、Social、MCP、Backgrounds、Academy、3D；作品分类包含 Hero、Landing Page、SaaS、3D、Interactive、Travel、Dashboard、Fashion、Ecommerce、Fintech 等。公开文案写的是：选一个 prompt，复制到 Lovable、Bolt、Cursor 一类工具里生成页面。

它不是组件代码库，也不是免费素材站。公开页能看到的是一张张 prompt/案例卡的入口；具体 prompt 正文、模板与 Academy 内容需要订阅或单次购买才能看。页面由 Viktor Odainyi（sole trader）运营。

## 关键技法（从公开首页与分类结构观察）

1. **超大字做首屏主体**：品牌词被拆成多行、重复出现，靠字距和错位制造纵深，不靠插画。
2. **分层排版**：同一组词用不同大小、不同透明度叠放，形成前后景；滚动时层与层之间产生位移差。
3. **玻璃/半透明面板**：案例卡和导航用半透明底加模糊，让背后的字与色块透出来，边界只留一条细线。
4. **分类即导航**：Hero、3D、Landing Page、Interactive 这些词既是筛选，也是内容目录；用户先认类型，再点案例。
5. **Prompt 作为交付物**：页面最终给你的是一段可粘贴的指令，不是可下载的源码；这决定了它的排版必须像“说明书卡片”。

## 如何复用到我们的管线

- 第 09 页用了“三层卡片 + 滚动展开 + 玻璃规格卡”的结构：桌面端三张卡在 0.8 屏内从叠放展开，玻璃卡压在一塊深色底上，`backdrop-filter` 才有东西可模糊；窄屏去掉 3D，改成平面卡片。
- 这套做法已写成页面里的 `skill / 3d-hero-stack` 示例：触发条件、参数、断点降级、验收标准四段。下次做首屏可以直接调用，不用重新想。
- 只学版式与材质处理，不复制它的 prompt 文本、案例图、品牌字或配色。页面的骨白、朱砂、宋体是另起的系统。

## 许可证与使用限制

- 站点内容（prompt 库、文本、视频背景、设计、品牌）归 MotionSites AI 所有，受版权与商标保护。
- Terms of Use（最后更新 2026-09-30）写明：付费后可以把 prompt 文本与源码复制进自己的项目、修改、发布或出售用它们做出来的网站/应用；**禁止**转售、再分发、分享 prompt 文本或源码本身，禁止在网络上重新发布 prompt 库，禁止抓取或绕过付费墙。
- 本站没有购买会员，也没有复制任何 prompt 或素材。只读公开首页与条款页，用于技法观察。
- 结论：**proprietary / paid**。我们的页面不包含其内容，不存在再分发。

## 核实记录

- 2026-11-13 16:27 打开 https://motionsites.ai/，HTTP 200；提取到首页标题、导航、分类与页脚运营者信息。
- 2026-11-13 16:33 打开 https://motionsites.ai/terms，HTTP 200；读到 “Your licence — what you can and can't do” 一段。
- 公开首页没有出现“liquid glass”字样；清单里的“液态玻璃”归入 evidence_gap，页面只把它当作一种可观察的材质方向，不写成已核事实。

## evidence_gap

- 付费墙内的 prompt 正文、模板、Academy 内容未访问，无法核实具体 prompt 的写法与质量。
- “液态玻璃”不是公开首页的原文，未单独核实；本页的玻璃处理来自通用 CSS 技法，不声称是站点的原样复刻。
- 站点没有公开 star 数、播放量或用户评价；本笔记不写任何互动量。
