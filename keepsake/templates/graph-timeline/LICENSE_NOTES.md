# LICENSE NOTES · 八年的站与站（关系图谱）

可商用，自托管，无 CDN、无运行时请求。

## 代码与库

| 名称 | 版本 | 许可 | 包内路径 | 来源 |
| --- | --- | --- | --- | --- |
| GSAP core | 3.13.0 | GSAP Standard License | `assets/vendor/gsap.min.js` | https://gsap.com |

图谱绘制为原创 Canvas 2D 代码（`assets/js/graph.js`），无 WebGPU、无 Canvas 第三方库、无 D3、无收费插件。只使用 GSAP 核心（未使用 ScrollTrigger，也未使用任何 Club 插件）。

## 字体（SIL OFL 1.1）

| 包内文件 | 字体 | 版权 |
| --- | --- | --- |
| `assets/fonts/Syne-Variable.woff2` | Syne | Copyright 2017 The Syne Project Authors |
| `assets/fonts/NotoSansSC-Regular.woff2`、`Bold.woff2` | Noto Sans CJK SC | Copyright 2014-2021 Adobe，Reserved Font Name "Source"；Noto 为 Google 商标 |
| `assets/fonts/IBMPlexMono-Regular.woff2`、`Medium.woff2` | IBM Plex Mono | Copyright 2017 IBM Corp. |

许可全文：`assets/LICENSES/OFL-1.1.txt`；逐字体来源：`assets/LICENSES/FONTS.md`。

## 图片

`photos/01.jpg–08.jpg` 为本任务内程序绘制的插画，无真人、无明星脸、无图库素材。作为虚构情侣样张；买家替换为自己的照片。

## 未使用

- 未使用任何 Shopify 素材、模型、文案、配色。
- 未使用未授权字体（Neue Montreal / Söhne 等）。
- 未使用 anything2explainer 或非商用协议工具。
- 未使用 WebGPU（Canvas2D 为完整路径，避免把可用性绑在实验 API 上）。
