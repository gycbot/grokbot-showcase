# 16 · Thrine

- 编号：16
- 分类：网页设计灵感与参考
- 状态：**unresolved-closest**（Thrine 本体未核实；技法取自最近的已核实替代来源 Httpster）
- 核实后的替代来源：https://httpster.net/
- 检索时间：2026-11-13 16:33（Asia/Shanghai）
- 页面：`pages/16-thrine/index.html`

## evidence_gap：为什么没确认 Thrine

主人清单只写 “Thrine / 网页设计灵感网站”，没有域名、没有链接。我按这个名字和分类做了以下核实，均未得到可确认的设计灵感站：

| 候选 | 结果 | 判断 |
|---|---|---|
| `https://thrine.design` | 本地 TLS 连接被重置；Jina Reader 返回 `Domain 'thrine.design' could not be resolved` | 域名不存在或不可解析 |
| `https://www.thrine.design` | 同上 | 同上 |
| `https://thrine.studio` / `https://thrine.xyz` | TLS 失败 | 无法核实 |
| `https://thrine.com` | TLS 失败 | 无法核实 |
| `https://thrine.co` | HTTP 200，但页面是印尼语 “KAKEK WANGI” 的 Themeforest 模板/推广页 | 不是设计灵感站，不采用 |
| `https://www.thryne.com` | HTTP 200，页面只有 “Thryne / battle-ready hardware / contact@thryne.com / © 2026 Thryne” | 硬件公司，不是灵感站；名字差一个字母，不能当同一对象 |
| `https://thrive.design` | HTTP 200，西雅图网页设计公司 | 是 agency，不是灵感索引；不采用 |

搜索侧也做了尝试：Bing RSS（英文/中文多组 query）没有返回 “Thrine” 的相关结果；DuckDuckGo 触发人机验证；Brave 429；Google 返回跳转页；GitHub 仓库搜索只有同名个人项目/硬件项目。**没有找到任何可核实的 Thrine 设计灵感站。**

所以本项按 INSTRUCTIONS 的兜底规则处理：写 `evidence_gap`，选一个**已核实的最接近来源**，不编造域名、不照抄主人清单里不存在的数字。

## 为什么选 Httpster 作为最近替代

Httpster 是一个长期维护的网页设计灵感索引（页脚写 “© Copyright 2012—2026 httpster”，位于塔斯马尼亚）。它和清单里 “网页设计灵感网站” 的定位一致，而且和本批另外三项的视觉机制不重复：

- 不是 Showreel 的视频墙
- 不是 Recent 的混合比例 masonry
- 不是 Anime 的动效引擎
- 它用**字体排印 + 编号分类 + 列表索引**来组织灵感

首页可核实：标题 “Website design inspiration”，副标题 “3116 websites featured”。导航分 Styles（Colourful 923、Brutalist 5、Dark 259、Minimal 847、Typographic 1193 等）与 Types（Advertising 35、Application / Software 77、Portfolio、E-commerce 456 等），并且有 light/dark 切换。每个条目用带浏览器框的预览图 + 站点名 + “Visit”。

## 关键技法

1. **分类带计数，且分两套轴**：Styles（视觉风格）和 Types（站点类型）。用户可以先按“我要什么感觉”或“我在做什么行业”进入，不用面对一长排无差别 tag。
2. **索引是列表，不是瀑布流**：每条一行/一格，预览图有统一的浏览器 chrome，信息密度稳定；扫读比大图瀑布更快。
3. **明暗双主题是同一套排印**：切换只换底色/字色/边框，不换布局，不换强调色逻辑。
4. **编号即层级**：`sup` 小数字贴在分类名后，既有信息量又不抢标题。
5. **克制的强调色**：整页近乎黑白，只在 hover/选中用一点色；灵感站的主角是作品，不是站点自己。
6. **页脚承担信任**：关于、隐私、版权年份、所在地，一句话讲清楚谁在维护。

## 怎么复用到管线

- **委派/并行会话页**：四条会话做成一份“排印索引”，不是四张彩色卡。每行：编号、批次、负责项、状态；hover/focus 在右侧换预览，移动端改为行内展开。
- **总索引**：16 项用同样的“编号 + 名称 + 状态 + 路径”行式结构，比 16 张大 card 更容易检查完整性。
- **状态语言**：`done` / `制作中` / `evidence_gap` 用等宽小字，不用彩色胶囊。
- **诚实标记**：Thrine 页在“来源”一行明确写“原始站点未核实，技法参照 Httpster”，不让读者误以为已确认。

## 许可证与使用限制

- Httpster 未提供开源许可证；页脚版权 “© Copyright 2012—2026 httpster”，收录网站的截图与商标归各站所有。
- 可学习：双轴分类、带计数的索引、浏览器框预览、明暗主题、页脚信任结构。
- 不可做：批量抓取或再分发预览图、把 Httpster 的名称/标识当本页品牌、把“3116 websites”写成本页的收录量。
- 本页不使用 Httpster 的任何截图、logo 或字体；只吸收索引结构。

## 核实记录

- 2026-11-13 16:33 CST：https://httpster.net/ HTTP 200；标题 `Website Design Inspiration | Httpster`；副标题 `3116 websites featured`；Styles/Types 计数与页脚版权年份均从 HTML 读取。
- 同日对 `thrine.design` / `thrine.studio` / `thrine.xyz` / `thrine.com` / `thrine.co` / `thryne.com` / `thrive.design` 逐一探测，结果见上表。
- 未把 `thrine.co` 的 Themeforest 推广页当作 Thrine；未编造 Thrine 的 URL、收录量或排名。
