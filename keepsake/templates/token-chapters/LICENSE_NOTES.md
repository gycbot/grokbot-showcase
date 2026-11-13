# LICENSE NOTES · 盒里的一句（三维信物）

可商用，自托管，无 CDN、无运行时请求。

## 代码与库

| 名称 | 版本 | 许可 | 包内路径 | 来源 |
| --- | --- | --- | --- | --- |
| three.js | r149（UMD） | MIT | `assets/vendor/three.min.js` | https://threejs.org |
| GSAP core | 3.13.0 | GSAP Standard License | `assets/vendor/gsap.min.js` | https://gsap.com |
| ScrollTrigger | 3.13.0 | GSAP Standard License | `assets/vendor/ScrollTrigger.min.js` | https://gsap.com |

只使用 GSAP 核心与 ScrollTrigger，未使用 Club / 付费插件。three.js 使用 MIT 的 UMD 版本（经典 `<script>`），保证 `file://` 下不需要 ES module 相对导入。

## 三维模型

盒形信物为**本任务内原创几何**：椭圆截面挤出（`ExtrudeGeometry`）、铰链、内衬、搭扣、顶环、刻字纹理，全部在 `assets/js/scene.js` 中程序生成。**没有**使用任何外部 3D 模型、Shopify 模型、Rive 文件或收费模型。刻字由 CanvasTexture 在运行时绘制，字体为包内 OFL 字体。

## 字体（SIL OFL 1.1）

| 包内文件 | 字体 | 版权 |
| --- | --- | --- |
| `assets/fonts/Fraunces-Variable.woff2` | Fraunces | Copyright 2018 The Fraunces Project Authors |
| `assets/fonts/NotoSerifSC-Regular.woff2`、`Bold.woff2` | Noto Serif CJK SC | Copyright 2014-2021 Adobe，Reserved Font Name "Source"；Noto 为 Google 商标 |
| `assets/fonts/IBMPlexSans-Variable.woff2` | IBM Plex Sans | Copyright 2017 IBM Corp. |
| `assets/fonts/IBMPlexMono-Regular.woff2` | IBM Plex Mono | Copyright 2017 IBM Corp. |

许可全文：`assets/LICENSES/OFL-1.1.txt`；逐字体来源：`assets/LICENSES/FONTS.md`。three.js 许可见 `assets/LICENSES/three.txt`。

## 图片

`photos/01.jpg` 为任务内程序绘制的雨夜候车亭插画，无真人、无明星脸；桌面端用在收尾章节，手机端为构图不显示。买家可替换。

## 未使用

- 未使用 Shopify 的 3D 模型、Rive、品牌图形、文案、产品名、配色。
- 未使用任何未授权字体。
- 未使用 anything2explainer 或非商用协议工具。
- 未使用 HTML-in-Canvas / Chrome 150 实验 API；可用性不依赖任何实验特性。
