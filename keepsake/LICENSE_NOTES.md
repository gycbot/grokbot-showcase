# LICENSE_NOTES

三套情侣纪念页样张（虚构人物「周予安 / 梁清和」）的第三方资源清单。所有资源均已自托管，运行时无 CDN、无外部请求。三套包内各自的 `LICENSE_NOTES.md` 与 `assets/LICENSES/` 为完整版本。

## 库

| 名称 | 版本 | 许可 | 使用模板 | 包内路径 |
| --- | --- | --- | --- | --- |
| GSAP core | 3.13.0 | GSAP Standard License（免费使用；未使用 Club / 付费插件） | A / B / C | `assets/vendor/gsap.min.js` |
| ScrollTrigger | 3.13.0 | GSAP Standard License | A / C | `assets/vendor/ScrollTrigger.min.js` |
| three.js | r149（UMD 经典脚本，非 ES module） | MIT | C | `assets/vendor/three.min.js` |

- 未使用 SplitText、MorphSVG、MotionPath、ScrollSmoother、Flip、Draggable、GSDevTools 等任何 Club / 付费 GSAP 插件。
- 未使用 anything2explainer（PolyForm Noncommercial）或任何非商用协议工具。
- 未使用 D3、Rive、收费模板、收费模型、密钥或需要登录的服务。
- GSAP 标准许可：https://gsap.com/standard-license ；包内 `assets/LICENSES/GSAP.txt` 为随库分发的版权头与许可指引。

## 字体（全部 SIL OFL 1.1，自托管、已子集化）

| 字体 | 使用模板 | 版权 |
| --- | --- | --- |
| Source Serif 4 | A | Copyright 2014 Adobe，Reserved Font Name "Source" |
| Noto Serif CJK SC | A / C | Copyright 2014-2021 Adobe，Reserved Font Name "Source"；Noto 为 Google 商标 |
| Noto Sans CJK SC | B | Copyright 2014-2021 Adobe，Reserved Font Name "Source"；Noto 为 Google 商标 |
| IBM Plex Mono | A / B / C | Copyright 2017 IBM Corp. |
| IBM Plex Sans | A / C | Copyright 2017 IBM Corp. |
| Fraunces | C | Copyright 2018 The Fraunces Project Authors |
| Syne | B | Copyright 2017 The Syne Project Authors |

- 未使用 PP Neue Montreal、Söhne、Shopify Inter 或任何从 Editions 站点抠取的字体。
- 许可全文：各包 `assets/LICENSES/OFL-1.1.txt`；逐字体来源：`assets/LICENSES/FONTS.md`。
- 字体子集覆盖 GB2312 一级常用字、标点与拉丁字符；生僻字回退系统宋体/黑体。

## 图片

`photos/01.jpg–08.jpg` 为本任务内用程序与绘图库生成的风格化插画：雨夜候车亭、二手书店、冬天的厨房、江桥、窗台的橘子、雨里的红伞、雨停的站台、未署期的信。无真人照片、无明星脸、无可辨认路人、无图库素材、无第三方版权。仅用于虚构情侣样张；买家应替换为自己的照片，不要把真实客户照片放进公开仓库。

## 三维模型

模板 C 的椭圆锁骨盒为本任务内**原创几何**：椭圆截面挤出、铰链、内衬、搭扣、顶环与运行时生成的刻字纹理，全部在 `assets/js/scene.js` 中程序生成（约 1.5 KB 几何定义，无外部模型文件）。**未使用** Shopify 的 3D 模型、Rive 文件、品牌图形、文案、产品名或配色。

## 未使用声明

- 不是 xAI / Grok / Shopify 官方产品，未冒充任何官方。
- 未使用 HTML-in-Canvas、Chrome 150 实验 API 或 WebGPU 作为可用性前提。
- 未使用收费字体、收费库、收费模板、收费模型。
- 页面不含密钥、登录、后台或数据收集；`file://` 可直接打开。
