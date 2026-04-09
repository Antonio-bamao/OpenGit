# 当前状态
- 当前阶段：Phase 2，MVP Playground 核心体验打磨。
- 已完成：完成 Git command parser、Git simulator、交互式 `/playground` 闭环、flow effect 可视化、HEAD/branch/origin 引用视图、`clone/fetch/pull/push/reset/revert/tag` 等核心命令模拟、`/scenarios` 场景入口页、场景预设加载、`solo-project`、`team-collab`、`version-rollback`、`release-management` 四个 ready 场景，以及 dev/build `distDir` 隔离修复。最新一轮已补齐 `git tag` / `git push --tags`、发布管理场景预设与学习路线，并在仓库洞察面板展示本地标签和远端标签。
- 进行中：继续扩展 planned 场景，把 `/scenarios` 中剩余卡片逐步升级为 ready，并补强 Playground 对团队协作与发布流程的演示细节。
- 下一步：优先推进 `worktree-parallel` 的 `git worktree add/list/remove`，或继续做 `conflict-resolution` 的冲突态模拟，让下一张 planned 卡进入 ready。
- 阻塞项：无当前阻塞。`http://127.0.0.1:3900/scenarios` 与 `http://127.0.0.1:3900/playground?scenario=release-management&command=git%20branch%20release` 均返回 200；本地 visual companion 仍不可访问，但不影响当前代码推进。
