# SudokuTaro

数独 — 基于 [Taro 4](https://taro.zone/) + React 18 + TypeScript，**仅输出 H5**（浏览器），已移除微信/抖音小程序与微信小游戏子工程。  
（若你需要 **React Native** 或原生 App，需另起 RN/Expo 工程；本仓不是 RN 项目。）

[![GitHub](https://img.shields.io/badge/GitHub-yuqiuqi%2FSudokuTaro-181717?logo=github)](https://github.com/yuqiuqi/SudokuTaro)
![Taro](https://img.shields.io/badge/Taro-4.3.0-07c160)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178c6?logo=typescript&logoColor=white)

## v1.2.1 手机整体布局与只读题面

[在线试玩](https://yuqiuqi.github.io/SudokuTaro/)

手机标题、状态、棋盘、工具与数字面板共享同一主列。棋盘优先占据主要空间，数字保持 5/4 两排并紧接工具；较高屏幕把留白均匀分配到完整内容块上下。高度不足时整列一起收窄，保留全部操作。

黑色题面数字保持清晰，不能选中、修改或进入键盘焦点。方向键在当前行／列内跳过题面；玩家填写的数字仍可修改。同数及同行、列、宫的辅助高亮继续保留，当前可编辑格用独立选中框标识。

| 393×650 · 常规手机 | 430×932 · 高屏手机 |
|---|---|
| ![共享主列与两排数字区](docs/screenshots/coherent-phone-393x650.png) | ![完整游戏区居中](docs/screenshots/coherent-tall-430x932.png) |

截图来自本轮最终 GitHub Pages 子路径生产构建的 Chromium 指定视口渲染，不是直接在线导航或小米 17／移动 Edge 真机截图。

本轮功能已部署，发布与验证证据见 [v1.2.1 更新说明](docs/releases/v1.2.1.md)，现行适配规则见 [自适应设计](docs/RESPONSIVE_DESIGN.md)。正式标签／Release 的后续状态见 [公开执行记录](https://github.com/yuqiuqi/SudokuTaro/pull/16#issuecomment-6335382360)。此前移动布局、提示舒适度与胜利动效交付记录归档于 [v1.2.0](docs/releases/v1.2.0.md)。

## 功能概览

- **界面与适配**：雾蓝与浅青光晕、悬浮棋盘、玻璃工具栏与数字底座；按浏览器实际可用宽高适配手机、横屏与分区，旋转和分屏保留进度。
- **输入**：选可编辑格后点击常驻 1～9，不唤起系统键盘。支持物理数字键、方向键、Delete／Backspace、N 切换笔记、Escape 关闭弹层。
- **笔记与撤销**：每格可记录多个候选数；填数清理相关候选，撤销恢复数字与笔记。擦除、撤销免费，无体力限制。
- **分层提示**：观察位置 → 排除思考 → 推理解释；全文显示在棋盘外，按钮位置稳定，答案由玩家亲手填写。
- **规则与出题**：中英文分页教学，简单／中等／困难按留空数量区分，题目检查唯一解。
- **通关**：约 2.4 秒彩虹立体波浪 → 约 650ms 青柠缝隙光 → 成绩与个人纪录；支持减少动态效果、跳过、欣赏棋盘与再挑战，刷新不重复记胜场。
- **保存**：进度、纪录、语言与振动偏好保存在当前浏览器；存储不可用时仍可游玩。

## 技术栈

| 类别 | 选用 |
|------|------|
| 框架 | Taro 4.3.0、React 18.3.1 |
| 语言 | TypeScript 7.0.2 |
| 样式 | Sass、CSS 变量、实际 CSS 像素（H5 关闭 pxtransform） |
| 构建 | Webpack 5（`@tarojs/webpack5-runner`） |

## 环境要求

- **Node.js** 22+（CI 使用 22；建议使用受支持的 LTS）
- **npm** 或 **cnpm** / **pnpm** / **yarn**
- 现代浏览器（H5）

## 安装依赖

```bash
cd SudokuTaro
npm install
```

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

## 验证与协作

首次运行浏览器测试需安装 Chromium；每轮代码修改后按顺序执行：

```bash
npm run typecheck
npm test
npm run build:h5
npx playwright install --with-deps chromium
npm run test:browser
```

GitHub Pages 使用子路径构建与对应测试，不能与根路径产物混用：

```bash
GITHUB_PAGES=true npm run build:h5
PAGES_BUILD=true npm run test:browser
```

`SCREENSHOT_DIR=/tmp/sudoku-ui npm run test:browser` 可保存真实浏览器截图。浏览器模拟不代替真实 iOS Safari、移动 Edge、屏幕阅读器及折叠硬件测试；线上资源验证方式与未验证范围见更新说明。

协作者先阅读 [AGENTS.md](AGENTS.md) 和 [CONTEXT.md](CONTEXT.md)。依赖维护与 Taro 兼容约束见 [依赖升级记录](docs/DEPENDENCY_UPGRADE.md)。

## 常见问题

- **PowerShell 无法运行 npm**：确认 Node 已加入 PATH，或使用 `npm.cmd`；执行策略限制 `.ps1` 时可使用 cmd。
- **H5 根路径显示目录列表**：检查 `src/index.html` 与 `h5.devServer.static: false`，本仓库已配置。
- **依赖或 Babel 构建错误**：先使用锁文件执行 `npm ci`，并核对 Node.js 22+ 与 [依赖兼容记录](docs/DEPENDENCY_UPGRADE.md)。

## 许可证

本仓库采用 [**CC BY-NC-ND 4.0**](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-Hans)（署名-非商业性使用-禁止演绎）：允许在保留署名的前提下**非商业地分享**；**禁止**改编、衍生（二次编辑）及**商业使用/贩卖**。完整条款见仓库根目录 [`LICENSE`](./LICENSE)。

> 说明：CC 许可常用于作品与文档；若你需将代码以典型「开源软件」方式再分发，请自行评估是否与本许可兼容，必要时咨询法律专业人士。

---

**说明**：`node_modules/`、`dist/`、`.taro/` 等已通过 `.gitignore` 忽略，勿提交到 Git。
