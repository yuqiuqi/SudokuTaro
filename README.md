# SudokuTaro

数独 — 基于 [Taro 4](https://taro.zone/) + React 18 + TypeScript，**仅输出 H5**（浏览器），已移除微信/抖音小程序与微信小游戏子工程。  
（若你需要 **React Native** 或原生 App，需另起 RN/Expo 工程；本仓不是 RN 项目。）

[![GitHub](https://img.shields.io/badge/GitHub-yuqiuqi%2FSudokuTaro-181717?logo=github)](https://github.com/yuqiuqi/SudokuTaro)
![Taro](https://img.shields.io/badge/Taro-4.0.9-07c160)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?logo=typescript&logoColor=white)

## 功能概览

- **界面**：按已确认的 [Figma 设计](https://www.figma.com/design/AhWwkAjjXti2imJAbhgrTY?node-id=9-173) 实现蓝灰上下渐变、玻璃工具栏与独立数字区。
- **适配**：按浏览器实际可用宽高切换常规、紧凑、极短、宽屏布局。主游戏页无双向滚动；旋转、展开与分屏重排保留进度。
- **输入**：选格后点击常驻 1～9；不使用隐藏输入框，不唤起系统键盘。物理键盘支持数字、方向键、Delete / Backspace、N 切换笔记、Escape 关闭弹层。
- **笔记**：每格可记录多个候选数，重复点击取消；填数后清理相关候选数，撤销同时恢复数字和笔记。
- **提示**：观察位置 → 排除思考 → 推理解释。提示不会自动填答案，无法直接推导时明确提示仍需继续比较。
- **规则**：中英文分步教学；简单 / 中等 / 困难按留空数量区分，生成的题目均检查唯一解。
- **参与感**：完成行、列、宫给予轻量反馈；通关展示用时、落笔、提示次数和个人纪录。撤销、擦除免费，无体力限制。
- **保存**：游戏进度、通关纪录、语言与振动偏好保存在当前浏览器；浏览器禁用存储时仍可正常游玩。

**协作 / AI 上下文**：请先阅读 **[`AGENTS.md`](./AGENTS.md)** 和 **[`CONTEXT.md`](./CONTEXT.md)**。每轮代码修改完成后必须构建并运行浏览器模拟测试，再交付或更新 PR。

## 本次改版与模拟测试（2026-10-19）

本次内容对应 PR #5 的 Liquid Glass 界面改版：蓝灰渐变背景、玻璃工具栏、常驻 1～9 数字区、多候选数笔记、分层推理提示、中英文规则及通关反馈。截图来自当前 PR 的 H5 实际浏览器渲染，未表示线上版本已经更新。

测试使用 Playwright + Chromium，先完成类型检查、7 项逻辑测试及 GitHub Pages 子路径构建，再运行多视口与交互测试。

| 范围 | 本轮结果 |
|---|---|
| 类型检查、7 项逻辑测试、H5 构建 | 通过；构建有入口体积警告 |
| 16 种常规视口 + 2 种极短横屏（568×240、480×240） | 现有测试通过 |
| 填数、笔记、撤销、冲突拒绝、提示不自动填数 | 通过 |
| 旋转与刷新保留进度、中英文规则、通关纪录 | 通过 |
| 模拟折叠分区及浏览器工具栏压缩可视高度 | 通过，含竖屏可视高度缩至 400px 的补充回归 |
| 页面运行异常 | 现有浏览器测试未发现运行异常 |

**本轮审查发现的问题已修复，并通过补充回归测试：**

- 568×240、480×240：工具栏与数字区并排，数字 7～9 均可见且能实际点击。
- 568×320：新局难度按钮横排，底部操作完整显示；同时覆盖 240px 高度的中英文新局、规则及设置弹窗。
- 390×720、实际可视高度缩至 400px：竖屏弹窗按实际可用高度切换紧凑样式，按钮均在可视区域内。
- 方向键分别限制行、列边界，行末向右、行首向左不再错误跨行；正常内部移动保留。
- 通关弹窗补测短横屏：紧凑排版保留全部统计、反馈和操作，覆盖使用笔记和提示后的较长成就文案，中文及英文均通过。

以上回归用例已纳入 `tests/browser.cjs`；弹窗测试同时检查容器、各操作按钮边界和内容溢出。此处为浏览器模拟结果，真实 iOS Safari、系统键盘行为及折叠硬件尚未实测。

### 游戏画面

以下截图使用相同测试局面和测试用中文字体，以便比较布局；字体不属于游戏新增的在线依赖。

| 常规手机 · 390×720 | 小屏手机 · 320×480 |
|---|---|
| ![常规手机游戏画面](docs/screenshots/regular.png) | ![小屏手机游戏画面](docs/screenshots/short.png) |

宽屏布局 · 720×540：

![宽屏游戏画面](docs/screenshots/wide.png)

分层提示：先观察、再思考、最后解释，答案由玩家亲手填写。

![分层提示游戏画面](docs/screenshots/hint.png)

## 技术栈

| 类别 | 选用 |
|------|------|
| 框架 | Taro 4.0.9、React 18 |
| 语言 | TypeScript |
| 样式 | Sass、CSS 变量、实际 CSS 像素（H5 关闭 pxtransform） |
| 构建 | Webpack 5（`@tarojs/webpack5-runner`） |

## 环境要求

- **Node.js** 18+（建议 LTS）
- **npm** 或 **cnpm** / **pnpm** / **yarn**
- 现代浏览器（H5）

## 安装依赖

```bash
cd SudokuTaro
npm install
```

若国内网络较慢，可使用镜像或 cnpm，详见下方「常见问题」。

## 日常推送代码（已有 GitHub 仓库）

```bash
git add .
git status
git commit -m "描述你的修改"
git push origin main
```

若远程分支名不是 `main`，以 `git branch -vv` 与平台显示为准。

## 开发与构建

| 命令 | 说明 |
|------|------|
| `npm run dev:h5` | H5 开发（webpack-dev-server，常见端口 `10086`） |
| `npm run build:h5` | H5 生产构建，输出 `dist/` |
| `npm run typecheck` | TypeScript 检查 |
| `npm test` | 出题、笔记、提示、撤销与存档逻辑测试 |
| `npm run test:browser` | 构建后运行多视口与交互测试（先 `npx playwright install chromium`） |

H5 本地预览：`npm run dev:h5` 后在浏览器打开终端提示地址（如 `http://localhost:10086/`）。

## 项目结构（摘要）

```
SudokuTaro/
├── config/
│   └── index.ts          # Taro（仅 H5）
├── scripts/              # 可选：Git / GitHub 辅助脚本
├── src/
│   ├── app.tsx
│   ├── app.config.js
│   ├── index.html
│   ├── pages/index/      # 数独主界面
│   └── utils/            # 数独引擎、游戏状态、开发诊断
├── package.json
└── README.md
```

## 配置说明（要点）

- **`config/index.ts`**：`h5.publicPath: '/'`；`h5.devServer.static: false` 避免开发时根路径被当成静态目录列表。
- **页面配置**：`app.config.js`、`pages/index/index.config.js` 使用纯 JS，避免在 Node 读取配置时触发 `window`。

## 项目状态与展示

- **部署产物：** 本仓库目前仅维护浏览器 H5 版本，不包含微信/抖音小程序或小游戏构建。
- **本地试玩：** 使用 `npm run dev:h5`，然后打开构建工具输出的本地地址。
- **生产验证：** `npm run build:h5`；建议在 PR 和默认分支上启用 GitHub Actions 检查。
- **在线试玩：** 规划使用 GitHub Pages 托管。**是否已经上线请以仓库 Pages/Actions 状态为准**，避免把尚未发布的链接误写成可用演示。

### 建议的 GitHub Topics

`sudoku` · `taro` · `typescript` · `react` · `web-game`

Topics 属于 GitHub 仓库设置，不能只通过合并 README 生效，需要仓库所有者在仓库首页 **About → Topics** 设置。

### 截图与演示素材

本次改版的布局规则与验证方式见 [自适应设计说明](docs/RESPONSIVE_DESIGN.md)。浏览器测试可通过 `SCREENSHOT_DIR=/tmp/sudoku-ui npm run test:browser` 保存真实页面截图。

每轮代码修改后执行：

```bash
npm run typecheck
npm test
npm run build:h5
# 首次运行安装浏览器：
npx playwright install --with-deps chromium
npm run test:browser
```

若验证 GitHub Pages 产物，构建改用 `GITHUB_PAGES=true npm run build:h5`，测试改用 `PAGES_BUILD=true npm run test:browser`。完整必测项及已知回归场景见 [开发约定](AGENTS.md)。

## 常见问题

- **PowerShell 无法运行 `npm`**：将 Node 安装目录加入用户 PATH，或使用 `npm.cmd`；若执行策略限制 `.ps1`，可改用 `cmd` 或对当前用户设置 `RemoteSigned`。
- **H5 根路径显示目录列表**：确保存在 `src/index.html` 且 `h5.devServer.static: false`（本仓库已配置）。
- **构建报 Babel / 依赖错误**：删除 `node_modules` 与锁文件后重新 `npm install`（谨慎操作，团队项目需与负责人确认）。

## 许可证

本仓库采用 [**CC BY-NC-ND 4.0**](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-Hans)（署名-非商业性使用-禁止演绎）：允许在保留署名的前提下**非商业地分享**；**禁止**改编、衍生（二次编辑）及**商业使用/贩卖**。完整条款见仓库根目录 [`LICENSE`](./LICENSE)。

> 说明：CC 许可常用于作品与文档；若你需将代码以典型「开源软件」方式再分发，请自行评估是否与本许可兼容，必要时咨询法律专业人士。

---

**说明**：`node_modules/`、`dist/`、`.taro/` 等已通过 `.gitignore` 忽略，勿提交到 Git。
