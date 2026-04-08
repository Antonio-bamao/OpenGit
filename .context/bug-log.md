# Bug / 工程异常记录

> 所有会影响推进、质量、节奏或判断的异常都要记录，包括代码、环境、依赖、测试、打包和设计误判。

## Visual companion 本地服务不可达

- 现象：brainstorming visual companion 会话生成了 `server-info`，但 `http://localhost:58904` 请求超时，且未看到持续运行的 node 服务。
- 触发条件：在 Windows/PowerShell 环境中尝试通过 WSL/bash 启动 companion 服务，随后改用 PowerShell/Node 启动。
- 影响：暂时无法在浏览器中展示交互式 mockup，但不影响仓库初始化和项目开发。
- 根因：本机 WSL/bash 不可用，Node 服务启动过程被中断后未保持可访问状态。
- 解决方案：本阶段放弃依赖 visual companion；后续视觉方案先用 Markdown 线框和静态说明推进。
- 预防措施：需要浏览器 companion 时先验证服务进程和 URL，再进入长时间交互；失败时快速降级到文本方案。
- 状态：已规避。

## Git index.lock permission denied during initial commit
- 现象：git add and git commit failed with Unable to create .git/index.lock: Permission denied
- 触发条件：Staging and committing the initial project context inside the sandboxed workspace
- 影响：Initial commit required an escalated rerun; no project files were lost
- 根因：Sandbox prevented writing the git index lock file in .git during the first commit attempt
- 解决方案：Reran the same git add and git commit command with approved elevated permissions
- 预防措施：If git index writes fail with permission denied, retry the same git operation with explicit escalation rather than changing project files
- 状态：Resolved
