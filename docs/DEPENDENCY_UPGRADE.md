# npm 依赖升级记录（2026-10-19）

目标版本：v1.1.0。范围为全部直接 npm 依赖；版本来自 npm 官方 registry 的稳定版及 peerDependencies。保持 Taro H5 架构、界面、玩法和浏览器存档格式。

## 已升级

| 依赖 | 原锁定版本 | 本轮版本 |
|---|---|---|
| 全部 13 个 Taro 包 | 4.0.9 | 4.3.0 |
| TypeScript | 5.9.3 | 7.0.2 |
| @playwright/test | 1.56.1 | 1.64.1 |
| @pmmmwh/react-refresh-webpack-plugin | 0.5.17 | 0.6.3 |
| @babel/core | 7.29.0 | 7.29.7 |
| @babel/preset-react | 7.28.5 | 7.29.7 |
| @babel/runtime | 7.29.2 | 7.29.10 |
| @types/node | 18.19.130 | 22.20.5 |
| @types/react | 18.3.28 | 18.3.31 |
| postcss | 8.5.8 | 8.5.31 |
| sass | 1.99.0 | 1.105.2 |
| hls.js | 1.6.15 | 1.7.3 |

Taro 包包括 `@tarojs/{cli,components,helper,plugin-framework-react,plugin-platform-h5,react,runtime,shared,taro,taro-loader,webpack5-runner}`、`babel-preset-taro`、`eslint-config-taro`，必须统一版本。

TypeScript 7 迁移：使用 ESNext / bundler 模块解析，移除已经删除的 baseUrl，保留相对 paths 映射；显式声明 Sass 侧效应导入。逻辑测试改为通过官方 tsc 命令编译临时模块，不再调用已移除的 transpileModule，保留原来全部 9 项断言并清理临时目录。

浏览器兼容数据库 caniuse-lite 同时更新；实际目标浏览器集合未改变。

## 保留与清理

| 依赖 | 保留版本 | 最新版 / 原因 |
|---|---|---|
| react / react-dom | 18.3.1 | 19.3.1；Taro 4.3.0 的 React 适配包要求 react ^18 |
| @types/react | 18.3.31 | 19.3.0；与 React 18 对齐 |
| @types/node | 22.20.5 | 26.6.5；与 CI 的 Node 22 对齐 |
| webpack | 5.91.0 | 5.112.0；Taro runner 和 loader 的 peer 精确要求 5.91.0 |
| Babel core / preset-react / runtime | 7.x 最新补丁 | 8.x；Taro runner 和 preset 要求 Babel ^7 |
| eslint | 8.57.1 | 10.13.0；eslint-config-taro@4.3.0 要求 ^8；本仓尚无独立 lint 配置/脚本，不声称通过 lint |
| react-refresh | 0.14.2 | 0.19.0；babel-preset-taro@4.3.0 要求 ^0.14.0 |
| @types/webpack-env | 1.18.8 | 已是稳定最新版 |
| tsconfig-paths-webpack-plugin | 4.2.0 | 已是稳定最新版 |

移除未被配置引用、已经弃用的直接依赖 `@babel/plugin-proposal-class-properties`；Taro preset 自身使用维护中的 transform 插件。`hls.js` 虽未被游戏直接调用，但 Taro H5 Video 组件动态导入它，因此保留并升级。

不使用 `--force`、`--legacy-peer-deps` 或大范围 overrides。上表兼容阻塞属于后续框架迁移条件，不能把“所有依赖已处理”描述成“所有包都已升至最新大版本”。

## 验证与发布门槛

Node.js 要求提升至 22+，GitHub CI 与 Pages 工作流继续使用 Node 22。每次代码改动按 AGENTS.md 执行类型检查、全部逻辑测试、构建与完整浏览器矩阵；根路径和 `/SudokuTaro/` 子路径分别验证。PR 必须经过独立 review 及远端 CI，再合并 main、验证 Pages，最后将 v1.1.0 tag 和正式 Release 指向同一部署提交。

本地新版 Chromium 下载若受环境影响，使用已有 Chromium 153 测试并明确记录；GitHub CI 安装 Playwright 配套 Chromium。真实 iOS Safari、真实折叠硬件尚未实测。
