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

## Scaffold files were written to the main worktree first

- 现象：Next.js scaffold files and dependency artifacts were created in the primary project directory instead of `.worktrees/opengit-mvp-scaffold`.
- 触发条件：Manual edits were applied with `apply_patch`, which operates from the shared workspace root unless paths are prefixed.
- 影响：The primary `main` worktree became dirty and dependency cleanup was required before continuing isolated feature work.
- 根因：The implementation plan was being executed in a nested worktree, but manual patch paths were not prefixed with `.worktrees/opengit-mvp-scaffold/`.
- 解决方案：Copied the scaffold files into `.worktrees/opengit-mvp-scaffold`, removed the accidental root-level scaffold/dependency artifacts, and restored the primary README to the committed state.
- 预防措施：When editing a nested worktree, prefix every manual patch path with `.worktrees/<branch>/` or avoid nested worktrees for future feature branches.
- 状态：Resolved.

## Next build spawn EPERM inside sandbox

- 现象：`pnpm build` failed with `Error: spawn EPERM` while creating Next.js worker child processes.
- 触发条件：Running `next build` inside the sandboxed command environment.
- 影响：The first build verification failed even though lint passed.
- 根因：The sandbox blocked child process spawning used by Next.js build workers.
- 解决方案：Reran `pnpm build` with approved elevated permissions and the build completed successfully.
- 预防措施：For Next.js build verification in this environment, use the approved `pnpm build` escalation path when `spawn EPERM` appears.
- 状态：Resolved.

## pnpm install required registry access

- 现象：The first `pnpm install` failed with `ERR_PNPM_NO_OFFLINE_META` for `@types/node@20.17.10`.
- 触发条件：Installing dependencies before the pnpm cache had metadata for the requested packages.
- 影响：Dependency installation could not complete in offline/sandbox mode.
- 根因：The local pnpm metadata cache did not contain the required package metadata.
- 解决方案：Reran `pnpm install` with approved registry access; dependencies and lockfile were generated successfully.
- 预防措施：For first-time dependency installation, expect registry access unless the exact package metadata already exists in cache.
- 状态：Resolved.

## Vitest spawn EPERM inside sandbox

- 现象：The first `pnpm test` run failed before collecting tests with `Error: spawn EPERM`.
- 触发条件：Running Vitest/Vite inside the sandboxed command environment on Windows.
- 影响：The first TDD red run did not reach the expected missing-module failure.
- 根因：Vite/Vitest attempted to spawn child processes for path resolution or workers, and the sandbox blocked that process creation.
- 解决方案：Reran `pnpm test` with approved elevated permissions; the expected red failure then appeared because `command-parser` and `git-simulator` did not exist yet.
- 预防措施：Use the approved `pnpm test` path when Vitest reports `spawn EPERM` in this environment.
- 状态：Resolved.

## Next dev server missing webpack chunk after build

- 现象：本地浏览器反复出现 Next Server Error，报 `Cannot find module './987.js'`，终端里 `/_next/static/chunks/fallback/pages/_app.js` 和 `_error.js` 返回 500。
- 触发条件：`pnpm dev` 正在运行时又执行 `pnpm build`，两者同时写入 `.next` 目录。
- 影响：开发热更新服务引用的 webpack chunk 被生产构建覆盖或清理，导致 3900 端口页面短时间不可用。
- 根因：Next.js dev server 和 production build 共用 `.next` 输出目录，不应该并发运行。
- 解决方案：停止坏掉的 dev 进程，删除 `.next` 缓存，重新运行 `pnpm dev`；后续开发阶段只跑 `pnpm test`、`pnpm lint` 和 HTTP 检查。
- 预防措施：需要生产构建验证时，先停止 `pnpm dev`；不要在热更新服务运行时执行 `pnpm build`。
- 状态：Resolved.
