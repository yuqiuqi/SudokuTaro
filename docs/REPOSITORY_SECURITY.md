# 仓库安全与 main 保护

[中文 README](../README.md) · [English README](../README.en.md)

## 公开访问的边界

本仓库按维护者选择保持公开，现有 GitHub Pages 游戏继续公开访问。GitHub 公开仓库不能禁止他人 `git clone`、Download ZIP、通过 Raw/API 读取文件或复制可见内容；主分支保护只约束写入和合并。网站发布的浏览器资源也会发送到访问者设备，不能保证不可复制。

[CC BY-NC-ND 4.0 许可证](../LICENSE)规定使用和分享条件，不是阻止下载的技术措施。改为私有可以限制未授权人员读取源码，但授权人员仍可复制，已有副本不会被收回；还需重新评估 Pages 套餐和部署。本次不改变可见性或许可证。

## 本次状态与配置

2026-10-23 审计时，GitHub 返回 `main.protected=false`，规则集为空。当前云连接读取／写入分支保护及修改仓库简介均返回 `403 Resource not accessible by integration`；账号显示仓库管理员权限，不代表该连接拥有 Administration 权限。下列 JSON 是待应用方案，不能作为已启用证据。实际写入结果及后续核验记录在本次 PR 中。

可复用配置：[main-protection.json](security/main-protection.json)。只针对 `main`：

| 规则 | 配置与理由 |
|---|---|
| 经 PR 合并 | 必须通过 PR 修改 main，避免直接推送 |
| 必需检查 | `Build H5` 与 `Verify Pages H5 build`，绑定 GitHub Actions（app ID `15368`） |
| 保持最新 | 合并前必须基于最新 main 通过检查 |
| 讨论处理 | 所有审阅讨论必须解决 |
| 禁止强推／删除 | 保留 main 历史和分支 |
| 管理员适用 | `enforce_admins=true`，不配置绕过账号 |
| 单人维护审批 | GitHub 强制的他人批准数为 `0`，仍要求 PR 和检查；独立审阅按交付流程记录，不冒充另一位真人的 GitHub 批准 |

JSON 按 GitHub 官方 OpenAPI 保留仍必填的兼容字段 `contexts: []`；具体必需检查及来源由 `checks` 中的两个对象明确指定。空的兼容数组不代表取消检查。

多人维护后，可将必需批准数改为 `1` 或更多。当前不强制另一账号批准，避免唯一维护者无法合并自己的 PR；不要求线性历史或签名，保留现有正常 merge commit 流程。

不要将 `Publish website` 设为 PR 的必需检查：该任务只在 main 部署，PR 中会跳过。重命名或移除 CI 任务时，必须同步更新必需检查名称，否则正常 PR 也会被阻塞。

## 管理员如何应用

可以直接用仓库管理员账号打开 [分支设置](https://github.com/yuqiuqi/SudokuTaro/settings/branches)，为精确分支名 `main` 添加经典保护规则，按上表启用 PR、状态检查、最新分支、讨论解决和管理员适用，保持允许强推／允许删除关闭。单人维护时不勾选强制他人批准。

也可以在具有本仓库 **Administration: write** 权限的已登录 GitHub CLI 中，从仓库根目录执行：

```bash
gh api --method PUT repos/yuqiuqi/SudokuTaro/branches/main/protection \
  --input docs/security/main-protection.json
```

现有连接若返回 403，需要为连接授予该仓库的 Administration 权限，或由管理员在 GitHub 网页完成。不要在 Issue、聊天或文档中粘贴访问令牌；`Contents: write` 或 PR 合并权限不等同于 Administration 权限。

## 仓库简介的品牌更新

审计时 GitHub About 简介仍显示旧产品名称和已移除的小程序说明。准备的[仓库简介配置](security/repository-metadata.json)将其统一为「方寸数独 · Fangcun Sudoku」，主页指向现有在线游戏；不重命名技术仓库或改变可见性。

当前连接的正式 PATCH 同样返回 403，仓库内品牌更新不会自动改掉远端 About。管理员可以在仓库首页 About 的编辑入口手动更新简介和主页，或用具有 Administration 权限的 CLI 执行：

```bash
gh api --method PATCH repos/yuqiuqi/SudokuTaro \
  --input docs/security/repository-metadata.json
```

核验远端展示值：

```bash
gh api repos/yuqiuqi/SudokuTaro --jq '{description,homepage,visibility}'
```

## 应用后核验

```bash
gh api repos/yuqiuqi/SudokuTaro/branches/main --jq '{name,protected}'
gh api repos/yuqiuqi/SudokuTaro/branches/main/protection \
  --jq '{required_status_checks,enforce_admins,required_pull_request_reviews,required_conversation_resolution,allow_force_pushes,allow_deletions}'
```

应看到 `protected=true`，并确认两项检查、严格最新、管理员适用、PR 要求及禁止强推／删除均与配置相符。不要仅凭 JSON 已提交或页面提示消失认定安全配置正确，也无需通过真实强推或删除进行破坏性试验。

公开仓库的克隆／下载能力不会因这组保护而关闭。维护者仍有修改保护规则的管理能力，主分支保护不能替代账号安全和凭据管理。

参考：[GitHub 受保护分支](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) · [更新分支保护 API](https://docs.github.com/en/rest/branches/branch-protection#update-branch-protection) · [仓库可见性](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
