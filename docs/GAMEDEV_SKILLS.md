# gamedev 技能：安装复现与本轮使用记录

用户要求使用 `gamedev-skills/awesome-gamedev-agent-skills` 全面重设计并组织团队讨论与审阅。本云环境已按上游手动安装规则，将77项技能与router共78个完整目录安装至 `/home/agent/.agents/skills`；与固定上游逐文件比较，内容一致。这是当前机器的安装事实，仓库中的文档与lock文件不会自动为其他机器安装技能。

来源：[上游仓库](https://github.com/gamedev-skills/awesome-gamedev-agent-skills)，固定提交 `dcf3bbbb83f365632402c086bf595048aa24aaa8`，Apache-2.0。安装规则见该提交的[官方 INSTALLATION.md](https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/dcf3bbbb83f365632402c086bf595048aa24aaa8/docs/INSTALLATION.md)：技能是`SKILL.md`直接父目录，连同references/scripts/assets完整复制；所有名字唯一，可扁平安装，另复制router。Codex/Gemini共用`.agents/skills`。本轮安装方法与每个SKILL.md的SHA-256记录在[lock元数据](skills/gamedev-skills.lock.json)。

## 在另一台机器复现固定版本

以下是手动安装示例，需要git与python3。先查看上游内容；脚本仅复制文本与配套文件，不执行所下载的技能脚本。`mktemp`创建独立临时目录，目标已有同名技能时先整体退出，避免覆盖已有安装；若已有同名内容，请自行比较或选择其他技能目录。

```bash
skill_checkout=$(mktemp -d)
git clone https://github.com/gamedev-skills/awesome-gamedev-agent-skills.git "$skill_checkout/source"
git -C "$skill_checkout/source" checkout --detach dcf3bbbb83f365632402c086bf595048aa24aaa8
python3 - "$skill_checkout/source" "$HOME/.agents/skills" <<'PY'
import shutil, sys
from pathlib import Path
source, target = map(Path, sys.argv[1:])
folders = sorted(f.parent for f in (source / 'skills').rglob('SKILL.md'))
folders.append(source / 'router')
assert len(folders) == 78
assert len({f.name for f in folders}) == 78
collisions = [str(target / f.name) for f in folders if (target / f.name).exists()]
if collisions:
    raise SystemExit('Existing skills; compare before copying: ' + ', '.join(collisions))
target.mkdir(parents=True, exist_ok=True)
for folder in folders:
    shutil.copytree(folder, target / folder.name)
for folder in folders:
    for file in folder.rglob('*'):
        if file.is_file():
            assert file.read_bytes() == (target / folder.name / file.relative_to(folder)).read_bytes()
print('Verified 77 skills plus router at', target)
PY
```

安装后重开支持技能发现的agent并查看其技能列表。云托管会话是否暴露该目录取决于当前工具运行时，目录存在并不等于每个客户端都能自动调用。若需项目级安装，将目标换成项目`.agents/skills`；本仓库不提交这78个第三方目录，也不添加npm postinstall或自动联网执行hook。上游通用`npx skills add`是另一种官方方法，但未固定版本的安装／更新不能替代本轮SHA复现。

## 团队实际使用了什么

各角色先读相关SKILL与引用，再检查代码、现有截图及约束，交叉质疑后形成[本轮规格](superpowers/specs/2026-11-11-courtyard-redesign-design.md)。安装全部技能不意味着逐一使用了全部78项。

| 实际阅读的技能／引用 | 本轮采用的原则 |
|---|---|
| `router/SKILL.md`、`router/references/custom-engines.md` | 识别自研浏览器棋盘；按实际需求选工具，不因技能库含Godot/Unity就迁移引擎 |
| `puzzle/SKILL.md` | 纯规则与呈现分离，保留确定性操作、提示与撤销边界 |
| `game-ui-ux/SKILL.md` | 81格可读、操作优先级、短屏真实可达，故事独立阅读不挤占棋盘 |
| `create-game-assets/SKILL.md`、`references/art-direction.md`、`references/provenance.md` | 统一材质、配色与物件资产族；记录原创AI辅助SVG/CSS/文本路径和许可，不伪称使用图片生成 |
| `game-feel/SKILL.md` | 局部短反馈、首次单元完成与重大胜利分级，支持减少动态与hidden生命周期 |
| `save-systems/SKILL.md` | 版本化防御加载、稳定身份去重、旧档兼容；不将文件rename原子性套到localStorage |
| `performance-optimization/SKILL.md` | 同机同场景测量；不以换构建器、包体变化或模拟浏览器推断真实帧率与留存 |
| `dialogue-systems/SKILL.md` | 有限八章、完整中英、人物目标与冲突具体、已读与解锁分离，阅读可跳过和重读 |

技能里的引擎API、付费流程或性能目标是参考背景，不自动成为本项目需求。当前产品使用React18/Vite、DOM/CSS/SVG，没有引入Godot、Unity、Phaser、Pixi或ECS。没有账号、联网活动、付费／广告章节门槛，也未做真实设备留存试验。第三方技能Apache-2.0许可不改变本项目[CC BY-NC-ND 4.0](../LICENSE)。

本轮仍等待最终用户审核；技能指引和AI审阅不能代替合并授权。
