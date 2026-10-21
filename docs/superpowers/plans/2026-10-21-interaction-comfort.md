# 交互舒适度修复与发布清单

基线：`a777f27`，分支 `fix/interaction-comfort-audit`。范围限于审计确认的五类问题；保持现有棋盘可读尺寸、6px 整区边距、拇指数字区、完整中英文提示、无裁切滚动，以及两阶段胜利全部回归。实现代理仅本地修改；主控负责独立审查、Pages、PR、合并与发布。

- [x] 真实浏览器 RED：提示开关前后棋盘／状态矩形；三层提示原坐标连续点击；方向键与 Enter/Space 的真实焦点；末层提示焦点；临界尺寸连续60帧；设置→新局立即焦点及原触发器恢复。
- [x] 提示占用原控件空间：取消 hint 布局输入，紧凑留白；通过不可访问、不可聚焦的自然尺寸副本预留各层最大标题／正文空间，正文全文可读，按钮各层位置固定。只有实际证据要求时才增加最小静态预算，不永久大幅压小棋盘。
- [x] 方向键将 DOM focus 与选格同步并 preventScroll；保持行边界。仅末层 Next 将焦点移到「我来试试」，中间步骤不抢焦点。
- [x] 分类依据与 CSS padding 输出无环的规范高度；实际棋盘预算仍扣真实安全区。弹窗 context 改变时重新聚焦内部首按钮，最终关闭恢复原 opener。
- [x] 最新源码：typecheck、9 项逻辑、根路径 build、完整 Chromium（含小屏／双语／fold／压缩400／胜利81中心像素）全通过；保存日志和唯一 comfort 截图并自审提交。
- [x] 实施阶段 README、CONTEXT、响应式与当前发行说明准确记录当时待发布状态；最终文档据当前部署证据更新。
- [x] 主控：匹配 Pages 构建与完整浏览器回归通过；两次独立审查均无发现，[公开审查](https://github.com/yuqiuqi/SudokuTaro/pull/14#issuecomment-6309655076)。
- [x] PR #14 的已审查实现 `5eeddb4` 通过远端 CI 并合并为 `43c26c887fe68bbebe6be3969ad86cba4e9c83b5`；同 SHA 的 [主分支 CI](https://github.com/yuqiuqi/SudokuTaro/actions/runs/39555925083)和 [Pages 实际发布](https://github.com/yuqiuqi/SudokuTaro/actions/runs/39555924968)成功。
- [x] 本轮18次正常TLS线上资源请求，经本地转接Chromium验证稳定反馈、6px、数字区、提示／焦点、三组60帧临界尺寸及波浪→缝隙→成绩与刷新一次记录，runtimeErrors=[]；不是直接在线导航或真机验证，信任设置未改。
- [ ] 最终 README／上下文／响应式／发行说明经独立审查、文档 PR、CI、合并与部署；后续实际结果见 [公开执行记录](https://github.com/yuqiuqi/SudokuTaro/pull/14#issuecomment-6309725414)。
- [ ] 创建并核实 annotated v1.2.0 tag／正式 Release；后续实际结果见 [公开执行记录](https://github.com/yuqiuqi/SudokuTaro/pull/14#issuecomment-6309725414)及 [Releases](https://github.com/yuqiuqi/SudokuTaro/releases)，不提前声称发布，也不为标签后回填复选框追加源码提交。

进展和取舍证据：`/workspace/sudokutaro-tools/comfort-work/progress.md`；不得把旧版部署证据当作本轮已发布。
