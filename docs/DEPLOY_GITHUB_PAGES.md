# GitHub Pages 在线试玩部署

此仓库当前仅构建 **H5 网页**。本 PR 提供部署配置，但在合并之前不会发布站点。

## 仓库所有者需完成

1. 审核并合并此 PR 到 `main`（**本 PR 不会自动合并**）。
2. 打开 GitHub 仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**（如果尚未启用）。
3. 打开 **Actions → Deploy SudokuTaro to GitHub Pages** 查看自动部署；必要时通过 `workflow_dispatch` 手动触发。
4. 部署成功后访问 **https://yuqiuqi.github.io/SudokuTaro/**，在桌面和手机浏览器分别验证棋盘、输入和刷新。

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
- GitHub Pages 是否已在仓库设置中启用，需要所有者确认。
- 部署通过不等于浏览器功能验证成功；首次上线仍需人工试玩。
