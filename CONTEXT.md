# SudokuTaro — 上下文交接文档

> 由对话整理，便于在新会话中恢复背景。  
> 生成日期：以本机为准。

---

## 一、本会话中的用户诉求（Prompt 摘要）

| 顺序 | 用户意图 |
|------|----------|
| 1 | 「分析并启动」— 分析 Taro 项目并启动开发环境 |
| 2 | 「npm 却换 cmpn」— 理解为切换/使用 cnpm 与国内镜像 |
| 3 | 「你打开浏览器自己先玩…」— 代码审查、修复数独逻辑与体验 |
| 4 | 「重新在终端运行 npm run dev:h5」— 启动 H5 dev server |
| 5 | 页面显示 `listing directory` / 非游戏界面 — 修复 devServer 与 `index.html` |
| 6 | PowerShell 找不到 `npm` / PATH |
| 7 | PowerShell 禁止运行 `npm.ps1`（Execution Policy） |
| 8 | 终端日志是否报错 — 确认为成功 |
| 9 | `@Browser` / HTTP 404 — 排查并加控制台诊断 |
| 10 | 「上下文快超了写一个 md…包括 prompt 和 skills」— **本文档** |

---

## 二、项目概览

- **名称**：SudokuTaro  
- **描述**：数独 — Taro 微信小程序 / 抖音小程序（含 H5）  
- **栈**：Taro **4.0.9** + React 18 + TypeScript + Sass + Webpack 5  
- **路径**：`c:\Users\yuqiu\SudokuTaro`

### 常用脚本（`package.json`）

- `npm run dev:h5` — H5 开发（watch）  
- `npm run build:h5` — H5 生产构建  
- `npm run dev:weapp` / `build:weapp` — 微信小程序  
- `npm run dev:tt` / `build:tt` — 抖音小程序  

### 仓库内辅助

- `dev-h5.cmd` — 使用 `npm.cmd` 调用，减轻 PowerShell 对 `npm.ps1` 的策略拦截（若仍存在可双击试）。

---

## 三、关键配置与文件

| 项 | 说明 |
|----|------|
| `config/index.ts` | `h5.publicPath: '/'`，`h5.devServer.static: false`（避免空 `dist` 下列目录页） |
| `src/index.html` | **必须存在**，否则不生成 `HtmlWebpackPlugin`，`dist` 可能无 `index.html` |
| `src/app.config.js` | CommonJS，避免 `defineAppConfig` 在 Node 读配置时拉 `@tarojs/taro` 触发 `window` |
| `src/pages/index/index.config.js` | 同上 |
| `src/utils/devDiagnostics.ts` | 控制台诊断 `[SudokuTaro:diag]`，便于排查 404 / 路由 |
| `src/utils/sudokuEngine.ts` | 生成、挖洞、冲突检测；`digHoles` 已改为洗牌位置遍历 |

### 已知的游戏逻辑修复（摘要）

- 允许覆盖非题面格；冲突回退到**上一格值**而非恒为 0。  
- `digHoles`：洗牌 81 格再挖，避免随机重试过慢。  
- H5：`formatSeconds`、`Taro.getEnv()===WEB` 时键盘 1–9 / Esc。

---

## 四、Windows 环境备忘

### PATH 中需包含

- `C:\Program Files\nodejs`（`node` / `npm.cmd`）  
- 若用全局 cnpm：`%AppData%\npm`（或 `$env:APPDATA\npm`）

**当前会话临时设置：**

```powershell
$env:Path = "C:\Program Files\nodejs;$env:APPDATA\npm;" + $env:Path
```

### PowerShell 执行策略（`npm.ps1` 被拦截）

- 临时：使用 **`npm.cmd run dev:h5`** 代替 `npm`。  
- 长期（当前用户）：`Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`  
- 说明见：[about_Execution_Policies](https://learn.microsoft.com/zh-cn/powershell/module/microsoft.powershell.core/about/about_execution_policies)

### 预览地址

- 以终端为准，例如 `http://localhost:10086/`；端口被占用时会自动换端口。  
- Hash 路由若白屏可试：`#/pages/index/index`。

---

## 五、HTTP 404 / 浏览器问题排查

1. **整页 404、控制台无日志**：多半是 **文档请求**失败（错端口、非 dev server）。  
2. **有 `[SudokuTaro:boot]`**：HTML 已到；若仍白屏，看 **Network** 里 `*.js` 是否 404（`publicPath`）。  
3. 复制控制台里 **`复制下面整行给开发者 →`** 后的 JSON 便于继续分析。

---

## 六、Cursor Skills（本机路径，按需阅读）

以下为 **用户环境中曾列出的 Skills** 路径；新会话若需遵循，请用 Read 打开对应 `SKILL.md`：

| Skill | 路径 |
|-------|------|
| babysit（PR/CI） | `C:\Users\yuqiu\.cursor\skills-cursor\babysit\SKILL.md` |
| create-rule | `C:\Users\yuqiu\.cursor\skills-cursor\create-rule\SKILL.md` |
| create-skill | `C:\Users\yuqiu\.cursor\skills-cursor\create-skill\SKILL.md` |
| update-cursor-settings | `C:\Users\yuqiu\.cursor\skills-cursor\update-cursor-settings\SKILL.md` |

---

## 七、工作区规则（路径，勿全文贴入）

- PUA / 能动性：`C:\Users\yuqiu\.cursor\rules\pua.mdc`  
- 提问前读 PUA：`read-pua-before-questions.mdc`  
- Awesome DESIGN.md 资源：`awesome-design-md.mdc`（本地 `design-md\<品牌>\DESIGN.md`）

---

## 八、依赖与锁文件

- 曾删除损坏的 `package-lock.json` 后重装；若再次 `Invalid Version`，检查 lock 中是否出现 **无 `version` 字段** 的包条目。  
- `devDependencies` 含 `@babel/plugin-proposal-class-properties`（`babel-preset-taro` 引用）。

---

## 九、后续可做事项（可选）

- 小程序端真机再验 `app.config` 的 `window` 字段（H5 用纯 `*.config.js` 规避 Node 侧 `window`）。  
- 需要唯一解题目时，可再实现挖洞后求解计数。  
- 体积：`EntrypointsOverSizeLimitWarning` 仅为 webpack 提示，非错误。

---

*文档用途：交接上下文；具体代码以仓库为准。*
