# GitHub Pages 在线试玩部署

此仓库构建 **H5 网页**，GitHub Pages 已启用。在线试玩：[方寸数独](https://yuqiuqi.github.io/SudokuTaro/)。

## 当前部署与后续更新

2026-10-20，含彩虹波浪和青柠缝隙光的提交 `8fb93f373e2edb98c42a8e77ff28b3ea78153e47` 已通过 [主分支 CI](https://github.com/yuqiuqi/SudokuTaro/actions/runs/39383720380)，[Pages 工作流](https://github.com/yuqiuqi/SudokuTaro/actions/runs/39383720348)的构建与 `Publish website` 均成功。部署包含 [PR #10](https://github.com/yuqiuqi/SudokuTaro/pull/10) 和 [PR #11](https://github.com/yuqiuqi/SudokuTaro/pull/11)。

后续通过正常 PR 审查、CI 与合并流程更新 `main`，自动触发部署；必要时使用工作流的 `workflow_dispatch`。仓库迁移或新建副本时，在 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。每次都应核对目标提交与实际发布步骤，单独的 PR 构建成功不代表网站已更新。

## 本次发布资源功能验证

系统 curl 使用正常 TLS 校验取得实际线上资源（18 次请求），经本地转接交给 Chromium 渲染，验证 81 格棋盘、彩虹 3D 抬升、落平后青柠缝隙光、光结束后成绩及刷新胜场只计一次，运行时错误为空。直接云端 Chromium HTTPS 导航受代理证书信任限制，未修改信任库或关闭 TLS 校验。此方式验证线上资源的功能，不等同于直接在线浏览器导航；真实手机、Safari 与折叠设备仍需验证。

## 构建路径

普通 `npm run dev:h5` 和 `npm run build:h5` 继续使用根路径 `/`。
Pages 部署使用：

```bash
GITHUB_PAGES=true npm run build:h5
```

此时 `h5.publicPath` 为 `/SudokuTaro/`，以便静态资源在 GitHub Pages **项目站点子路径**正确加载。
Taro H5 默认使用 hash 路由，避免浏览器 history 路由在静态托管环境刷新后产生子页面 404；详见 [Taro H5 路由文档](https://docs.taro.zone/docs/config-detail#h5router)。

## 限制

- 此流程是公开静态站点部署，不包括服务器端功能。
- 部署通过不等于浏览器功能验证成功；应另行验证实际发布资源及目标设备。
- 正式标签及 Release 状态见 [GitHub Releases](https://github.com/yuqiuqi/SudokuTaro/releases)，不能仅凭 Pages 成功推断版本已发布。
