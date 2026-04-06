# SudokuTaro

**说明**：本仓库除 Taro 多端应用外，还包含一个独立的 **微信小游戏**（原生 Canvas 数独）。**小游戏全部文件在目录 [`minigame-wechat/`](./minigame-wechat/)** 内（含 `game.json`、`game.js`、源码 `src/` 与编译产物 `js/`）；用微信开发者工具「导入小游戏」时请选择 **`minigame-wechat` 文件夹**为项目根目录，不要与仓库根目录的 Taro 小程序工程混淆。

数独游戏 — 基于 [Taro 4](https://taro.zone/) + React 18 + TypeScript，一套代码可编译为 **H5**、**微信小程序**、**抖音小程序**。  
另提供 **微信小游戏**（原生 Canvas，与 Taro 并行，见 `minigame-wechat/`）：Taro **不能**编译为微信小游戏，需单独用开发者工具打开该目录。

[![GitHub](https://img.shields.io/badge/GitHub-yuqiuqi%2FSudokuTaro-181717?logo=github)](https://github.com/yuqiuqi/SudokuTaro)
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
| `npm run dev:h5` | H5 开发（默认 webpack-dev-server，常见端口 `10086`） |
| `npm run build:h5` | H5 生产构建，输出 `dist/` |
| `npm run dev:weapp` | 微信小程序开发（watch） |
| `npm run build:weapp` | 微信小程序构建 |
| `npm run dev:tt` | 抖音小程序开发（watch） |
| `npm run build:tt` | 抖音小程序构建 |
| `npm run build:minigame` | 编译 `minigame-wechat/src/*.ts` → `minigame-wechat/js/`（改小游戏源码后执行） |

H5 本地预览：执行 `npm run dev:h5` 后，在浏览器打开终端里提示的地址（如 `http://localhost:10086/`）。

### 微信小游戏（与小程序不同）

| 项目 | 说明 |
|------|------|
| **产物** | 仓库内 **`minigame-wechat/`**：`game.json` + `game.js` + Canvas 逻辑（`js/main.js`），数独规则与 `src/utils/sudokuEngine.ts` 同步维护 |
| **开发者工具** | **导入项目 → 小游戏**（不要选「小程序」），目录选 **`minigame-wechat`** 根路径（该文件夹内含 `game.json`） |
| **AppID** | 在[微信公众平台](https://mp.weixin.qq.com/)注册 **小游戏** 后，把 `minigame-wechat/project.config.json` 里的 `appid` 换成你的小游戏 AppID（与 Taro 微信小程序 AppID 不是同一个应用类型时需分别注册） |
| **文档** | 流程与类目见[小游戏接入指南](https://developers.weixin.qq.com/minigame/introduction/guide/) |

## 微信小程序 / 抖音小程序 自动上传（CI）

使用 Taro 官方插件 [`@tarojs/plugin-mini-ci`](https://docs.taro.zone/docs/plugin-mini-ci)：在**本地构建完成后**，将 `dist/` 上传到微信后台 / 抖音后台（体验版/开发版流程以各平台后台为准）。

### 1. 准备授权信息（由你本人完成）

| 平台 | 你需要准备 |
|------|------------|
| **微信** | 小程序 **AppID**；在[微信公众平台](https://mp.weixin.qq.com/) → 开发 → 开发设置 → **小程序代码上传密钥**，下载 **私钥文件** 放到仓库 `key/` 目录（勿提交私钥）。 |
| **抖音** | 开发者账号 **邮箱 + 密码**（与抖音开放平台一致，插件文档要求）。 |

### 2. 配置环境变量

```bash
# Windows（cmd/PowerShell）
copy .env.upload.example .env.upload

# macOS / Linux
# cp .env.upload.example .env.upload
```

编辑 `.env.upload`，填写 `WECHAT_*`、`TT_*` 等（见文件内注释）。

将 `project.config.json` 里的 `appid` 改为你的**正式微信小程序 AppID**（与 `WECHAT_APPID` 一致）。

### 3. 一键上传命令

| 命令 | 说明 |
|------|------|
| `npm run upload:weapp` | 构建微信小程序并 **上传体验版** |
| `npm run upload:tt` | 构建抖音小程序并 **上传** |
| `npm run upload:mini` | 先微信后抖音（会依次覆盖 `dist/`，两次完整构建） |
| `npm run preview:weapp` | 构建并 **预览**（开发版二维码，微信） |
| `npm run preview:tt` | 构建并 **预览**（抖音） |

上传的版本号与说明默认读取 `package.json` 的 `version` 与 `taroConfig`；也可在 `.env.upload` 里设置 `CI_VERSION`、`CI_DESC`。

**说明**：`dotenv-cli` 会读取项目根目录的 **`.env.upload`**；若文件不存在，请先复制示例文件。私钥与密码**不要**提交到 Git（已在 `.gitignore` 中忽略）。

Windows 也可在项目根目录执行：`.\scripts\release-mini.ps1`（会检查 `.env.upload` 是否存在，再执行 `npm run upload:mini`）。

## 项目结构（摘要）

```
SudokuTaro/
├── minigame-wechat/      # 微信小游戏（Canvas），与根目录 Taro 并行；用开发者工具「小游戏」打开
│   ├── game.json
│   ├── game.js
│   ├── project.config.json
│   └── js/
│       ├── main.js           # 绘制与触摸
│       └── sudokuEngine.js   # 与 src/utils/sudokuEngine.ts 逻辑对齐
├── config/
│   └── index.ts          # Taro、@tarojs/plugin-mini-ci（上传）等配置
├── scripts/
│   ├── setup-git-github.ps1   # Windows：安装 Git / gh 提示
│   └── release-mini.ps1       # 上传微信+抖音前检查 .env.upload
├── key/                  # 微信上传私钥放此处（见 key/README.md，勿提交私钥）
├── .env.upload.example   # 复制为 .env.upload 填写凭据
├── CONTEXT.md            # AI/协作者上下文交接（可选阅读）
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

本仓库远程示例：**https://github.com/yuqiuqi/SudokuTaro**。若你已在本地 `git clone` 并配置好 `origin`，只需「日常推送代码」一节即可。

下面说明 **从零** 使用 **GitHub CLI (`gh`)** 登录与建库推送。若尚未安装，可执行仓库内脚本（需管理员 PowerShell）：

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
- **`npm run upload:*` 提示找不到 `.env.upload`**：先复制 `.env.upload.example` 为 `.env.upload` 并填写凭据。
- **小程序 CI 依赖较多**：`npm install` 后若仅开发 H5，可不配置 `.env.upload`；上传前再配置即可。

## 许可证

本项目可按需自行添加许可证文件（如 MIT）。若未指定，默认保留所有权利，上传前请自行决定开源协议。

---

**说明**：`node_modules/`、`dist/`、`.taro/` 等已通过 `.gitignore` 忽略，勿提交到 Git。
