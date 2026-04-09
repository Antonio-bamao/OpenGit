# 当前状态
- 当前阶段：Phase 2，MVP Playground 核心体验打磨。
- 已完成：完成 Git command parser、Git simulator、交互式 `/playground` 闭环、flow effect 可视化、HEAD/branch/origin 引用视图、`clone/fetch/pull/push/reset/revert/tag/worktree` 等核心命令模拟、`/scenarios` 场景入口页、场景预设加载，以及全局计划里的六个核心场景 `solo-project`、`team-collab`、`conflict-resolution`、`version-rollback`、`release-management`、`worktree-parallel` 全部升级为 ready。最新一轮已补齐 `git pull` 冲突态、`git status` unmerged paths、`git add README.md` 标记已解决、`git commit -m "resolve conflict"` 收尾，并在面板中展示 conflicted 文件状态。
- 进行中：从“场景卡片补齐”切到“场景体验收口 + 文档入口准备”，继续补强 Playground 对冲突、引用关系和命令解释的教学闭环。
- 下一步：优先推进 `/docs` 最小命令参考入口，先覆盖 basics / branching / remote / advanced / worktree 分类，并让现有场景命令能够自然衔接到文档查阅。
- 阻塞项：无当前阻塞。`pnpm test`、`pnpm lint`、`pnpm build` 均已通过；`http://127.0.0.1:3900/scenarios` 与 `http://127.0.0.1:3900/playground?scenario=conflict-resolution&command=git%20pull` 均返回 200；本地 visual companion 仍不可访问，但不影响当前代码推进。
