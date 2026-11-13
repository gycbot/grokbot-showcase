# 04 · anything2explainer

- **清单原文（不改写）**：`4 DSH 剪辑与动效 | anything2explainer | DSH 热门项目，用于解释类视频生成（排行榜第 4 名）。`
- **检索时间**：2026-11-13 16:28（Asia/Shanghai）
- **许可证**：PolyForm Noncommercial License 1.0.0（非商业免费；商业使用需作者事先授权）。**本任务 `commercial_use: false`，可以使用其方法；若哪天 commercial_use 变 true，必须停用并改走 HyperFrames / dsh 原生。**

## 是什么

给一个主题或一篇文章，产出一条黑底 MG 风格的讲解视频：Remotion 代码逐帧绘制，TTS 配音，逐词对齐字幕，章节卡与底部章节进度条，中文或英文。它不是 CLI，而是一整套给编码代理的方法：可编译模板、图元与光效库、配音/分镜/渲染/QC 工具、风格与动效规范、多 agent 分工协议，外加一条完整样片《RAG 与知识库》当质量标尺。输出规格 1280×720 / 30fps / H.264。

来源：<https://github.com/Vincentwei1021/anything2explainer>。

## 关键技法

1. **固定视觉体系，变化内容**：纯黑画布（星点雾底或点阵波底二选一）、白线条图形 + 紫色重点、超粗黑体标题、44px 白字黑边字幕、底部章节进度条、顶部胶囊 HUD。风格不随主题漂移。
2. **每镜一个主角，光跟主角**：主角高度 ≥170px 或大字 ≥96px，带柔光/光环/硬投影；配角不发光；内容区最大物体 <110px 不得持续超过 45 帧。
3. **持续动作 + 落位停留**：每个字幕块的动词要有动作撑到下一拍（数据流、打字机、逐格点亮、光点沿线跑）；元素入场后不许完全静止 >3 s；每镜末拍落位后留 30–45 帧（1–1.5s）稳定期再离场。
4. **闪烁只给重点**：每镜 ≤1 处 GlitchIn，只给核心术语；其余文字一律 SoftIn。三轮紫光横扫全片 ≤2 处，只给核心概念首次登场。
5. **字幕与进度条安全区**：y637–690 是字幕带、y687–720 是进度条，内容与入场轨迹不得穿过。
6. **镜头按画面单元分，不按句分**：短句（<3s 或单字幕块）并入相邻镜头；单镜 ≥120 帧；能承接同一元素就不清场。
7. **章界要承上启下**：章末解说留钩子，章首先回指上一章成果再开题；章首镜头承接上一章的主角/象征物，不能「讲完就切卡」。
8. **事实有出处**：画面上每个数字、术语、年份、人名都要能在调研文档里找到 URL；没核实的不上画面、配音也不说。
9. **量化自检**：`scripts/motion_check.py` 测最长静止（≤3s）与末拍稳定期（≥30 帧）；QC 用渲染帧对照文字判据，不靠感觉。
10. **四个确认点**：时长与语言 → 解说词定稿 → 配音选择 → 前 30 秒样片。定稿后帧号硬编码，改一个字就全片重排。

## 如何复用到我们的制作管线

- 本批第 4 页 `pages/04-anything2explainer/index.html` 借用它的**讲解片语法**：黑底、白线稿、单一强调色（把紫换成琥珀，避开霓虹紫模板禁令，保留单强调色规则）、顶部 HUD、底部章节进度条、四个章节、每章一个主角（记忆卡）贯穿、线稿随滚动画出、每章末尾留停顿。
- 以后做真正的解释片，先把「调研文档（带 URL）→ 解说词 → 分镜（按画面单元）→ 每镜一个主角 → 量化自检」这条链跑完，再开渲；不要先写代码再找事实。
- 本批不生成视频、不跑 TTS、不装 Remotion；只取视觉语法做网页。没有把样片帧或仓库素材拷进页面，图形全部自绘 SVG。
- 许可证红线写进流程：anything2explainer 只在非商业任务用；商业任务换 HyperFrames（Apache-2.0）或 dsh 原生。

## 核实记录（含与主人清单的差异）

- GitHub API（2026-11-13 16:27）：`full_name=Vincentwei1021/anything2explainer`，`stargazers_count=3270`，`forks_count=420`，`license=Other / NOASSERTION`，`created_at=2026-09-08T17:19:54Z`，`updated_at=2026-11-13T07:48:29Z`。
- 许可证文件正文：PolyForm Noncommercial 1.0.0；README 第 213 行同样写明「free for noncommercial use; commercial use requires prior authorization」。
- 主人清单写「排行榜第 4 名」。**没有找到可打开的榜单页，记 evidence_gap**；页面不引用名次，只写机制。星数 3,270 也不写进页面。

## 来源 URL

- 仓库：<https://github.com/Vincentwei1021/anything2explainer>
- SKILL.md（raw，已验证 200）：<https://raw.githubusercontent.com/Vincentwei1021/anything2explainer/main/SKILL.md>
- README（raw）：<https://raw.githubusercontent.com/Vincentwei1021/anything2explainer/main/README.md>
- 许可证（raw）：<https://raw.githubusercontent.com/Vincentwei1021/anything2explainer/main/LICENSE>
- 本机只读快照：`[local working copy, omitted from this public site]`（commit `735c79c`，2026-09-18）
