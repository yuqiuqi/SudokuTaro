# SudokuTaro

数独游戏 — 基于 [Taro 4](https://taro.zone/) + React 18 + TypeScript，一套代码可编译为 **H5**、**微信小程序**、**抖音小程序**。

![Taro](https://img.shields.io/badge/Taro-4.0.9-07c160)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?logo=typescript&logoColor=white)

## 功能概览

- **难度**：初级 / 中级 / 高级（挖空数量不同）
- **操作**：点选格子输入数字；支持撤销、擦除、新开一局
- **规则**：填入与同行/同列/同宫冲突时会高亮并在约 1.5 秒后回退
- **通关**：完成后弹窗展示用时与步数
- **输入**：H5 下使用系统键盘（隐藏输入框唤起软键盘 + 物理键盘快捷键）；无屏幕数字键盘
- **性能**：棋盘使用 `React.memo`，计时器更新时不重复渲染 81 格；冲突检测与引擎路径做了轻量优化

## 技术栈

| 类别 | 选用 |
|------|------|
| 框架 | Taro 4.0.9、React 18 |
| 语言 | TypeScript |
| 样式 | Sass（`rpx` 设计稿 750） |
| 构建 | Webpack 5（`@tarojs/webpack5-runner`） |

## 环境要求

- **Node.js** 18+（建议 LTS）
- **npm** 或 **cnpm** / **pnpm** / **yarn**
- 开发 **H5**：现代浏览器；**小程序**：对应开发者工具

## 安装依赖

```bash
cd SudokuTaro
npm install
```

若国内网络较慢，可使用镜像或 cnpm，详见下方「常见问题」。

## 开发与构建

| 命令 | 说明 |
|------|------|
| `npm run dev:h5` | H5 开发（默认 webpack-dev-server，常见端口 `10086`） |
| `npm run build:h5` | H5 生产构建，输出 `dist/` |
| `npm run dev:weapp` | 微信小程序开发（watch） |
| `npm run build:weapp` | 微信小程序构建 |
| `npm run dev:tt` | 抖音小程序开发（watch） |
| `npm run build:tt` | 抖音小程序构建 |

H5 本地预览：执行 `npm run dev:h5` 后，在浏览器打开终端里提示的地址（如 `http://localhost:10086/`）。

## 项目结构（摘要）

```
SudokuTaro/
├── config/
│   └── index.ts          # Taro 编译与 H5 devServer 等配置
├── src/
│   ├── app.tsx           # 应用入口
│   ├── app.config.js     # 全局页面路由等（JS，避免配置阶段访问 window）
│   ├── index.html        # H5 模板
│   ├── pages/
│   │   └── index/        # 首页：数独 UI 与交互
│   └── utils/
│       ├── sudokuEngine.ts   # 生成终盘、挖洞、冲突检测等
│       └── devDiagnostics.ts
├── package.json
└── README.md
```

## 配置说明（要点）

- **`config/index.ts`**：`h5.publicPath: '/'`；`h5.devServer.static: false` 避免开发时根路径被当成静态目录列表。
- **页面配置**：`app.config.js`、`pages/index/index.config.js` 使用纯 JS，避免在 Node 读取配置时触发 `window`。

## 首次上传到 GitHub（Git + GitHub CLI）

下面使用 **GitHub CLI (`gh`)** 完成登录与建库推送。若尚未安装，可执行仓库内脚本（需管理员 PowerShell）：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
cd c:\Users\yuqiu\SudokuTaro   # 按你的路径修改
.\scripts\setup-git-github.ps1
```

或用手动命令：`winget install Git.Git`、`winget install GitHub.cli`。安装后**新开一个终端**，确保 `git`、`gh` 在 PATH 中。

**配置提交者信息（建议一次性设置）：**

```powershell
git config --global user.name "你的名字或昵称"
git config --global user.email "你的邮箱@example.com"
```

### 1. 安装 Git 与 GitHub CLI（Windows 推荐）

在 **以管理员身份运行** 的 PowerShell 中执行：

```powershell
winget install --id Git.Git -e --accept-package-agreements --accept-source-agreements
winget install --id GitHub.cli -e --accept-package-agreements --accept-source-agreements
```

安装后**关闭并重新打开**终端，执行：

```powershell
git --version
gh --version
```

### 2. 登录 GitHub（必须在本机交互完成）

```powershell
gh auth login
```

按提示选择：GitHub.com → HTTPS → 浏览器登录（或 Token）。**请勿将 Token 发给他人或贴到公共聊天。**

验证登录：

```powershell
gh auth status
```

### 3. 在项目目录初始化并创建远程仓库后推送

在 `SudokuTaro` 根目录：

```powershell
cd c:\Users\yuqiu\SudokuTaro
git init
git add .
git commit -m "chore: initial commit SudokuTaro"
git branch -M main
```

**方式 A — 用 `gh` 一键创建仓库并推送**（推荐，需已 `gh auth login`）：

```powershell
gh repo create SudokuTaro --public --source=. --remote=origin --push
```

若仓库名已存在，可改名，例如：

```powershell
gh repo create my-sudoku-taro --public --source=. --remote=origin --push
```

**方式 B — 先在网页创建空仓库**，再：

```powershell
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 4. 仅使用 Git、不用 gh

在 GitHub 网站新建空仓库后：

```powershell
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

首次推送时按提示用 **Git Credential Manager** 浏览器登录，或使用 **Personal Access Token**（在 GitHub → Settings → Developer settings 中创建）。

## 常见问题

- **PowerShell 无法运行 `npm`**：将 Node 安装目录加入用户 PATH，或使用 `npm.cmd`；若执行策略限制 `.ps1`，可改用 `cmd` 或对当前用户设置 `RemoteSigned`。
- **H5 根路径显示目录列表**：确保存在 `src/index.html` 且 `h5.devServer.static: false`（本仓库已配置）。
- **构建报 Babel / 依赖错误**：删除 `node_modules` 与锁文件后重新 `npm install`（谨慎操作，团队项目需与负责人确认）。

## 许可证

本项目可按需自行添加许可证文件（如 MIT）。若未指定，默认保留所有权利，上传前请自行决定开源协议。

---

**说明**：`node_modules/`、`dist/`、`.taro/` 等已通过 `.gitignore` 忽略，勿提交到 Git。
