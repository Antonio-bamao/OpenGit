# 工作日志

> 每完成一个明确步骤就追加一条记录，不写流水账。

## 2026-04-08 16:50 - 初始化仓库与项目上下文

- 目标：将只有全局计划文档的空目录初始化为可继续开发的项目仓库。
- 动作：读取全局方案；初始化 git 仓库；运行 Project Context OS 初始化脚本；补齐 `.gitignore`、`README.md` 和 `.context/` 项目记忆内容。
- 结果：仓库已具备基础项目说明、上下文计划、当前状态、任务拆解、风险和决策记录。
- 验证：`validate_context.py --project-root .` 输出 `context is valid`；`git status --branch --short` 显示仓库位于 `main` 且尚无提交。
- 下一步：进入 Next.js MVP 脚手架计划。

## 2026-04-08 17:30 - 创建 Next.js MVP scaffold

- 目标：建立 OpenGit MVP 的 Next.js 14 应用骨架和 `/playground` 静态布局。
- 动作：创建 `opengit-mvp-scaffold` worktree；手工添加 Next.js、TypeScript、Tailwind、ESLint 配置；创建 `AppHeader`、`PlaygroundShell`、首页和 `/playground` 路由；将 Next 14 补丁版本升级到 `14.2.35`；更新 README 本地开发命令。
- 结果：应用骨架可 lint、可生产构建；`/` 和 `/playground` 均作为静态 App Router 页面生成。
- 验证：`pnpm lint` 输出 `No ESLint warnings or errors`；`pnpm build` 在 `.worktrees/opengit-mvp-scaffold` 中完成并生成 `/`、`/_not-found`、`/playground` 静态页面。
- 下一步：提交 scaffold 分支，然后规划 Phase 2 的 Git parser 与状态模型。

## 2026-04-08 17:45 - 合并 scaffold 回根目录

- 目标：消除不必要的 worktree 复杂度，让项目回到根目录直接开发。
- 动作：将 `opengit-mvp-scaffold` 快进合并到 `main`；删除临时 worktree 和分支；清理 `.worktrees` 残留目录；在根目录重新安装依赖。
- 结果：`C:\Users\m1591\Desktop\OpenGit` 现在就是 Next.js 项目根目录，`git worktree list` 只剩主目录。
- 验证：根目录 `pnpm install` 成功；`pnpm lint` 输出 `No ESLint warnings or errors`；`pnpm build` 成功生成 `/`、`/_not-found`、`/playground`；`.context` 校验输出 `context is valid`。
- 下一步：进入 Phase 2 的 Git parser 与状态模型。

## 2026-04-08 17:55 - 实现 Playground 核心交互

- 目标：让 `/playground` 从静态布局变成可输入基础 Git 命令的模拟终端。
- 动作：加入 Vitest；先写 parser 与 simulator 的失败测试；实现 `parseGitCommand`、`createInitialGitState`、`executeGitCommand`；将 `PlaygroundShell` 改为 client component，支持命令输入、历史导航、重置、终端输出、提示卡片、四区状态计数和文件状态列表。
- 结果：MVP 现在支持 `git init`、`git status`、`git add .`、`git commit -m "..."`、`git log` 和未知命令提示。
- 验证：先运行 `pnpm test` 得到模块缺失红灯；实现后 `pnpm test` 输出 2 个测试文件、4 个测试全部通过；`pnpm lint` 输出 `No ESLint warnings or errors`；`pnpm build` 成功生成 `/`、`/_not-found`、`/playground`。
- 下一步：继续扩展 Git 命令覆盖和可视化动画。

## 2026-04-08 18:15 - 重做浅色高级 UI 与 3D 首屏

- 目标：根据用户反馈移除暗黑风格和生硬切入效果，提升首页与 Playground 的高级感和交互反馈。
- 动作：使用 `ui-ux-pro-max` 查询设计方向后，按用户“不走暗黑”的约束落地浅色 graphite/emerald 方案；新增 CSS 3D Git 工作流首屏；加入渐显、位移、轻微浮动和流程线动画；增加 `prefers-reduced-motion` 保护；将 `/playground` 改成浅色工作台；修复 Git simulator 中文提示乱码。
- 结果：首页首屏现在以 3D Git 流程空间作为核心视觉，Playground 不再是黑色终端框，命令输出、提示、状态区和文件列表都有更柔和的过渡反馈。
- 验证：`pnpm lint` 无警告或错误；`pnpm test` 2 个测试文件、4 个测试全部通过；`pnpm build` 成功生成 `/`、`/_not-found`、`/playground`。
- 下一步：继续做工作流动画和命令覆盖增强。

## 2026-04-08 19:55 - 扩展基础命令与工作流流水线

- 目标：继续 Phase 2，扩展更多 Git 基础命令，并让可视化更像文件从工作区流向暂存区、本地仓库和远端仓库。
- 动作：用 TDD 为 `restore --staged`、`reset`、`diff --staged`、`branch`、`switch -c`、`push` 和命令 flow effect 写红灯测试；扩展 `GitState` 的 `branches`、`remoteCommits`；在 `CommandResult` 中加入 `effect`；将 `/playground` 右侧数字卡片改为四段流水线和 file/commit chips；最近一次命令会高亮对应流向连接线。
- 结果：MVP 支持更多常用命令，`git add`、`git commit`、`git push` 等操作会同步更新流水线中的文件/提交位置，`reset`/`restore --staged` 会高亮工作区与暂存区之间的连接。
- 验证：先运行新增 simulator 测试得到 5 个预期失败；实现后 `pnpm test` 2 个测试文件、8 个测试全部通过；`pnpm lint` 无警告或错误；`pnpm build` 成功；`http://localhost:3900/playground` 返回 200。
- 下一步：补充场景化任务、分支图和 HEAD/引用可视化。

## 2026-04-08 21:00 - 新增任务路线与引用指针

- 目标：继续 Phase 2，让 Playground 能提示下一步学习任务，并把 HEAD、当前分支、本地提交和远端引用的关系展示出来。
- 动作：新增 `getLearningChecklist` helper 和测试；在 `/playground` 右侧加入任务路线卡片与“填入下一步”按钮；在仓库状态区加入 `HEAD -> branch -> commit -> origin/<branch>` 引用指针和分支标签。
- 结果：用户可以按 `git init`、`git add .`、`git commit -m "first commit"`、`git switch -c feature/flow`、`git push` 的路线推进，页面会同步标记完成状态并展示引用位置。
- 验证：先运行 `pnpm test src/lib/git-sim/learning-guide.test.ts` 得到 helper 缺失红灯；实现后 `pnpm test` 3 个测试文件、9 个测试全部通过；`pnpm lint` 无警告或错误；`http://localhost:3900/playground` 返回 200 且包含任务路线和引用指针内容。
- 下一步：扩展更完整的分支图、HEAD 移动动画和场景任务内容。

## 2026-04-08 21:35 - 模块化 Playground 与分支图模型

- 目标：按用户要求降低 Playground 耦合度，避免后续修改一个 UI 区域牵动命令模拟、状态推导和其他面板。
- 动作：将 `PlaygroundShell` 收敛为状态容器和面板组合；新增终端、工作流、任务路线、仓库洞察、分支图等独立面板；新增 `playground-view-model` 和 `git-graph-view-model` 纯函数层；用 TDD 扩展 Git 状态模型，增加 `branchHeads`、`remoteBranchHeads`、commit 所属分支与 parent 指针。
- 结果：命令执行器、状态推导和 React 展示层分离；`main` 与 `feature/flow` 等分支会保留独立 head；分支图现在能展示 commit、HEAD、本地分支和远端引用。
- 验证：先运行 `pnpm test src/lib/git-sim/git-simulator.test.ts src/lib/git-sim/git-graph-view-model.test.ts` 得到预期红灯；实现后 `pnpm test` 5 个测试文件、12 个测试全部通过；`pnpm lint` 无警告或错误；`http://localhost:3900/playground` 返回 200 且包含分支图和可视化面板。
- 下一步：继续扩展场景任务内容、HEAD/引用动画细节，以及更完整的分支命令覆盖。

## 2026-04-08 21:42｜扩展分支命令覆盖
- 目标：扩展分支命令覆盖
- 动作：按 TDD 为 git branch <name>、git branch -d、git checkout -b 和 git checkout <branch> 增加红灯测试；在 Git simulator 中拆分 branch 参数处理，复用 createBranch/switchBranch 逻辑，并清理删除分支时的本地与远端引用头。
- 结果：模拟器现在支持创建但不切换分支、删除非当前分支，以及 checkout 兼容入口；未知命令提示同步包含 checkout。
- 验证：先运行 pnpm test src/lib/git-sim/git-simulator.test.ts 看到 2 个预期失败；实现后该测试 9 个通过；随后 pnpm test 5 个测试文件 14 个测试通过，pnpm lint 无警告或错误，pnpm build 成功，validate_context.py 输出 context is valid。
- 下一步：继续扩展场景任务内容和 HEAD/引用动画细节，或为分支删除/重复创建等边界行为补更多学习提示。

## 2026-04-08 22:11｜扩展 MVP 场景任务内容
- 目标：扩展 MVP 场景任务内容
- 动作：结合全局方案中的真实项目模拟场景一和最新日志，将现有任务路线升级为 getSoloProjectScenario 纯函数模型；为场景标题、目标、验收条件、进度和当前任务写红灯测试；将 Playground view model 与 LearningPathPanel 接入场景信息。
- 结果：Playground 右侧任务路线现在以“从零开始个人项目”呈现，包含目标、验收、进度和每一步的目的说明，同时仍保留“填入下一步”命令流。
- 验证：先运行 pnpm test src/lib/git-sim/learning-guide.test.ts 得到 getSoloProjectScenario 缺失红灯；实现后该测试通过；聚焦测试在沙箱中遇到 spawn EPERM 后按权限重跑通过；随后 pnpm test 5 个测试文件 15 个测试通过，pnpm lint 无警告或错误，pnpm build 成功，validate_context.py 输出 context is valid。
- 下一步：继续打磨 HEAD/引用动画细节，或扩展更多基础远端命令如 git remote、git fetch、git pull，为后续场景二团队协作做铺垫。

## 2026-04-08 22:17｜扩展基础远端命令模拟
- 目标：扩展基础远端命令模拟
- 动作：按 TDD 为 git remote -v、git fetch 和 git pull 增加红灯测试；在 Git simulator 中接入 remote/fetch/pull 命令分发；为虚拟 origin 远端输出 URL；让 fetch 产生远端到本地的 flow effect；让 pull 支持线性 fast-forward，将 origin/<branch> 的远端提交同步为当前本地分支 HEAD。
- 结果：MVP 现在支持基础远端查看、fetch 引用同步反馈和 pull fast-forward，为后续“加入团队项目”场景铺垫。
- 验证：先运行 pnpm test src/lib/git-sim/git-simulator.test.ts 看到 remote 和 pull 两个预期失败；实现后该测试 11 个通过；随后 pnpm test 5 个测试文件 17 个测试通过，pnpm lint 无警告或错误，pnpm build 成功，validate_context.py 输出 context is valid。
- 下一步：继续为团队协作场景增加 clone/remote branch 展示，或转向 HEAD/引用动画细节，让 pull/fetch 的指针移动在 UI 中更直观。

## 2026-04-08 22:23｜展示分支与远端同步状态
- 目标：展示分支与远端同步状态
- 动作：按 TDD 为 Playground view model 增加 syncStatus 红灯测试；沿 commit parent 链计算当前分支相对 origin/<branch> 的 ahead/behind；在仓库洞察面板 Remote 区和引用指针标签中展示同步摘要、分支映射、ahead 和 behind；修复 Next build 暴露的 Set 展开与 es5 target 不兼容问题，并记录 bug-log。
- 结果：Playground 现在能在仓库状态区显示 no remote、up to date、ahead N、behind N 或 ahead N / behind N，让 fetch/pull/push 后的本地与远端关系更直观。
- 验证：先运行 pnpm test src/lib/git-sim/playground-view-model.test.ts 看到 syncStatus 缺失红灯；实现后该测试 2 个通过；pnpm build 首次暴露 Set 展开与 es5 target 不兼容，改为 Array.from 后通过；最终 pnpm test 5 个测试文件 18 个测试通过，pnpm lint 无警告或错误，pnpm build 成功，validate_context.py 输出 context is valid。
- 下一步：继续做 clone/remote branch 展示，或把 ahead/behind 与 HEAD/origin 指针移动做成更明显的视觉反馈。

## 2026-04-08 22:28｜增加 git clone 团队项目入口
- 目标：增加 git clone 团队项目入口
- 动作：按 TDD 为 git clone <url> 增加红灯测试；在 Git simulator 中实现虚拟 origin clone，把 main、HEAD、origin/main、初始提交和 tracked 文件一次性带到本地；新增 clone flow effect；更新 Playground 欢迎提示，让用户能从 clone 进入团队项目练习。
- 结果：MVP 现在支持 git clone https://github.com/opengit/example.git，clone 后本地与远端引用处于 up to date 状态，并能继续执行 branch/fetch/pull 等团队协作前置命令。
- 验证：先运行 pnpm test src/lib/git-sim/git-simulator.test.ts 看到 clone 未支持的预期红灯；实现后该测试 12 个通过；随后 pnpm test 5 个测试文件 19 个测试通过，pnpm lint 无警告或错误，pnpm build 成功，validate_context.py 输出 context is valid。
- 下一步：继续补 remote branch 展示或设计团队协作场景的轻量任务模型：clone -> switch -c feature -> commit -> push。

## 2026-04-08 22:34｜增加团队协作轻量任务路线
- 目标：增加团队协作轻量任务路线
- 动作：按 TDD 为 getTeamCollaborationScenario 和 getActiveLearningScenario 增加红灯测试；实现“加入团队项目”场景：clone、switch -c feature/team-work、commit、push；让 Playground view model 在 clone 后自动切换到团队协作场景，并补充集成断言。
- 结果：Playground 现在会在 clone 后从“从零开始个人项目”自动切换到“加入团队项目”，任务路线引导用户创建 feature 分支、提交协作改动并推送到 origin。
- 验证：先运行 pnpm test src/lib/git-sim/learning-guide.test.ts 看到 getTeamCollaborationScenario/getActiveLearningScenario 缺失红灯；实现后聚焦测试通过；最终 pnpm test 5 个测试文件 22 个测试通过，pnpm lint 无警告或错误，pnpm build 成功，validate_context.py 输出 context is valid。
- 下一步：继续补 remote branch 展示，或开始做 /scenarios 的轻量入口页面，让用户显式选择“个人项目”和“加入团队项目”。

## 2026-04-08 22:39｜展示远端分支列表
- 目标：展示远端分支列表
- 动作：按 TDD 为 Playground view model 增加 remoteRefs 红灯测试；从 remoteBranchHeads 派生 origin/<branch>、目标 commit 和当前分支标记；在仓库洞察面板的引用指针区域新增远端分支列表。
- 结果：Playground 现在能在 clone 后显示 origin/main，并在 feature 分支 push 后同时显示 origin/feature/team-work 和 origin/main，当前远端分支会高亮。
- 验证：先运行 pnpm test src/lib/git-sim/playground-view-model.test.ts 看到 remoteRefs 缺失红灯；实现后该测试 3 个通过；随后 pnpm test 5 个测试文件 22 个测试通过，pnpm lint 无警告或错误，pnpm build 成功，validate_context.py 输出 context is valid。
- 下一步：可以开始做 /scenarios 轻量入口页面，让用户显式选择“个人项目”和“加入团队项目”，或继续增强 Git Graph 的远端分支视觉。

## 2026-04-08 22:51｜新增场景入口页并串联 Playground
- 目标：新增场景入口页并串联 Playground
- 动作：按 TDD 增加 scenario-catalog 红灯测试；实现六个全局计划场景的 catalog；新增 /scenarios 页面；在 AppHeader 与首页 CTA 接入场景入口；让 /playground 读取 command 查询参数并传给 PlaygroundShell 预填命令；保留 reset 后的场景命令预填。
- 结果：应用现在有独立的场景选择入口，前两个可练习场景能直接跳转到 Playground 并填入 git init 或 git clone 命令，后续四个全局计划场景以 planned 状态展示。
- 验证：pnpm test src/lib/git-sim/scenario-catalog.test.ts 通过 1 个测试文件 2 个测试；pnpm test 通过 6 个测试文件 24 个测试；pnpm lint 无 ESLint warning/error；pnpm build 成功生成 /、/scenarios，并让 /playground 动态渲染以支持查询参数。
- 下一步：继续按全局计划做更大块推进：为场景入口增加可加载的初始仓库状态/场景状态，或扩展 Git Graph 的远端分支与 HEAD 动画反馈。

## 2026-04-09 03:59｜增强 Git Graph 的远端引用视觉反馈
- 目标：增强 Git Graph 的远端引用视觉反馈
- 动作：按 TDD 为 git-graph-view-model 增加 push 后活跃远端引用高亮的红灯测试；让 buildGitGraphViewModel 接收最新 effect，并派生活跃 HEAD、本地引用和远端引用；在 GitGraphPanel 中为刚移动的 HEAD、本地 ref 和 origin ref 增加更强的视觉高亮；在 PlaygroundShell 中把最近一次 effect 传给 graph view model。
- 结果：提交图现在不只是静态显示 branch/origin 标签，还能在 clone、commit、switch、pull、push 后把刚刚移动的指针高亮出来，用户更容易把命令和引用移动对应起来。
- 验证：pnpm test src/lib/git-sim/git-graph-view-model.test.ts 通过 1 个测试文件 2 个测试；pnpm test 通过 6 个测试文件 25 个测试；pnpm lint 无 ESLint warning/error；pnpm build 成功生成 /、/scenarios 和 /playground。
- 下一步：继续按全局计划做场景闭环：为场景入口增加可加载的初始仓库状态/任务状态，或扩展 conflict/revert/tag/worktree 的命令模拟。

## 2026-04-09 04:50｜修复 Next dev 与 build 共享 distDir 导致的 chunk 错配
- 目标：修复 Next dev 与 build 共享 distDir 导致的 chunk 错配
- 动作：按 systematic-debugging 复现 3900 上的 500，读取 .next/server/webpack-runtime.js、app/page.js 和 chunk 布局，确认现有 dev 进程在找 ./987.js 而实际 chunk 在 chunks/987.js；定位根因为 next dev 与 next build 共用 .next，构建验证把正在运行的 dev 产物踩坏；按 TDD 新增 getNextDistDir 回归测试，并在 next.config.mjs 中把 dev/build 输出拆为 .next-dev 与 .next-build；用隔离的 next dev -p 3100 验证新配置。
- 结果：后续开发中 next build 不会再破坏正在运行的 next dev；当前仓库同时保留 .next-dev 和 .next-build，临时 3100 实例返回 200，说明新的开发输出目录工作正常。
- 验证：curl.exe -i http://127.0.0.1:3900/ 复现 500 并返回 Cannot find module ./987.js；pnpm test src/lib/next-dist-dir.test.ts 通过 1 个测试文件 2 个测试；pnpm test 通过 7 个测试文件 27 个测试；pnpm lint 无 ESLint warning/error；pnpm build 成功并生成 .next-build；隔离 next dev -p 3100 返回 HTTP 200。
- 下一步：重启当前 3900 上的旧 dev 进程使其加载新配置，然后继续推进场景初始仓库状态或 conflict/revert/tag/worktree 命令模拟。

## 2026-04-09 20:38｜让场景入口携带初始仓库状态进入 Playground
- 目标：让场景入口携带初始仓库状态进入 Playground
- 动作：按 TDD 修改 scenario-catalog 测试并新增 scenario-presets 回归测试；实现 getScenarioPreset，为个人项目返回空白仓库起点，为团队协作返回 clone 完成后的仓库状态；更新 /playground 读取 scenario 查询参数并把 initialState、initialHistory、initialCommand 传给 PlaygroundShell；让 reset 回到当前场景的起始状态而不是通用空白态。
- 结果：现在从 /scenarios 进入 Playground 时，solo-project 会从空白目录开始，team-collab 会从已 clone 的团队仓库开始，并直接把下一步命令填成 git switch -c feature/team-work。
- 验证：pnpm test src/lib/git-sim/scenario-catalog.test.ts src/lib/git-sim/scenario-presets.test.ts 通过 2 个测试文件 4 个测试；pnpm test 通过 8 个测试文件 29 个测试；pnpm lint 无 ESLint warning/error；pnpm build 成功；curl -I http://127.0.0.1:3900/playground 返回 200；curl -I http://127.0.0.1:3900/playground?scenario=team-collab&command=git%20switch%20-c%20feature%2Fteam-work 返回 200。
- 下一步：继续扩展 planned 场景的底层命令能力，优先做 conflict/revert/tag/worktree 之一，让 /scenarios 里更多卡片从 planned 变成 ready。

## 2026-04-09 20:57｜把版本回退场景从 planned 提升为 ready
- 目标：把版本回退场景从 planned 提升为 ready
- 动作：按 TDD 为 git reset --soft HEAD~1、git revert HEAD、rollback 场景 catalog/preset/view model 写红灯测试；在 Git simulator 中实现提交级 reset 和 revert；为 version-rollback 场景添加预设仓库状态与显式学习路线；把 /scenarios 中的 version-rollback 卡片切换为 ready，并让 Playground 正确加载该场景。
- 结果：现在用户可以从 /scenarios 直接进入版本回退场景，在一个预置了 bad commit 的仓库里练习 git revert HEAD，并对比 git reset --soft HEAD~1 的效果；学习面板也会切换到版本回退路线。
- 验证：pnpm test src/lib/git-sim/git-simulator.test.ts src/lib/git-sim/scenario-catalog.test.ts src/lib/git-sim/scenario-presets.test.ts src/lib/git-sim/playground-view-model.test.ts 通过 4 个测试文件 23 个测试；pnpm test 通过 8 个测试文件 33 个测试；pnpm lint 无 ESLint warning/error；pnpm build 成功；curl -I http://127.0.0.1:3900/scenarios 返回 200；curl -I http://127.0.0.1:3900/playground?scenario=version-rollback&command=git%20revert%20HEAD 返回 200。
- 下一步：继续扩展下一张 planned 场景，优先考虑 release-management 的 git tag，或 worktree-parallel 的 git worktree add/list/remove。

## 2026-04-09 21:12｜把 release-management 场景从 planned 推进到 ready
- 目标：把 release-management 场景从 planned 推进到 ready
- 动作：按 TDD 为 git tag 与 git push --tags 增加测试；在 git-simulator 中加入本地标签与远端标签状态；补齐 release-management 的场景目录、预设与学习路线；在 RepositoryInsightPanel 中展示本地标签和远端标签。
- 结果：release-management 现已成为 ready 场景，用户可从 /scenarios 直接进入发布管理练习；Playground 能模拟创建标签、推送标签，并在仓库洞察面板中看到 local tags 与 origin tags。
- 验证：pnpm test 通过 8 个测试文件、37 个测试；pnpm lint 无警告；pnpm build 成功；curl -I http://127.0.0.1:3900/scenarios 返回 200；curl -I http://127.0.0.1:3900/playground?scenario=release-management&command=git%20branch%20release 返回 200。
- 下一步：继续推进 worktree-parallel 或 conflict-resolution，让下一张 planned 卡升级为 ready。

## 2026-04-09 21:22｜把 worktree-parallel 场景从 planned 推进到 ready
- 目标：把 worktree-parallel 场景从 planned 推进到 ready
- 动作：按 TDD 为 `git worktree add/list/remove`、worktree 场景 preset/catalog/view model/learning guide 写红灯测试；在 `git-simulator` 中加入 linked worktree 状态、分支占用校验，以及 `git worktree list` / `git status` 的学习进度标记；补齐 `worktree-parallel` 的预设仓库状态与学习路线；把 `/scenarios` 中的 worktree 卡片切换为 ready，并在 `RepositoryInsightPanel` 展示当前目录和 linked worktrees。
- 结果：`worktree-parallel` 现已成为 ready 场景，用户可从 `/scenarios` 直接进入 feature/payment 开发中的仓库，练习 `git worktree add ../hotfix main`、查看 linked trees、确认当前分支未被打断，并在演示结束后移除临时 worktree。
- 验证：`pnpm test` 通过 8 个测试文件、42 个测试；`pnpm lint` 无警告；`pnpm build` 成功；`curl -I http://127.0.0.1:3900/scenarios` 返回 200；`curl -I "http://127.0.0.1:3900/playground?scenario=worktree-parallel&command=git%20worktree%20add%20..%2Fhotfix%20main"` 返回 200。
- 下一步：继续推进 `conflict-resolution`，补齐冲突态仓库预设、冲突提示和解决后的学习路线，让 `/scenarios` 中最后一张 planned 卡升级为 ready。

## 2026-04-09 21:32｜把 conflict-resolution 场景从 planned 推进到 ready
- 目标：把 conflict-resolution 场景从 planned 推进到 ready
- 动作：按 TDD 为 `git pull` 冲突态、`git status` unmerged paths、`git add README.md` 标记已解决、`git commit -m "resolve conflict"` 收尾，以及 conflict 场景 preset/catalog/view model/learning guide 写红灯测试；在 `git-simulator` 中加入 conflicted 文件状态、冲突标记、合并中的状态追踪和冲突解决后的提交收口；把 `/scenarios` 中的 conflict 卡片切换为 ready，并让 Playground 面板显示 conflicted 状态。
- 结果：`conflict-resolution` 现已成为 ready 场景，用户可从 `/scenarios` 直接进入一个“本地和远端都改了 README.md”的仓库，体验一次完整的 pull 冲突、检查 unmerged paths、标记解决并提交收尾的流程；至此全局计划中的六张核心场景卡都已进入 ready。
- 验证：`pnpm test` 通过 8 个测试文件、47 个测试；`pnpm lint` 无警告；`pnpm build` 成功；`curl -I http://127.0.0.1:3900/scenarios` 返回 200；`curl -I "http://127.0.0.1:3900/playground?scenario=conflict-resolution&command=git%20pull"` 返回 200。
- 下一步：从场景补齐切换到文档入口建设，优先推进 `/docs` 最小命令参考页面，并把现有场景命令和文档查阅打通。

## 2026-04-09 23:03｜落地 `/docs` 最小命令参考入口
- 目标：实现 `/docs` 最小命令参考入口，并把场景与 Playground 接到对应命令文档
- 动作：按 TDD 为命令文档数据模型、五类分组顺序、19 条已支持命令覆盖率，以及命令输入到 `/docs#...` 锚点的映射写红灯测试；新增 `src/lib/git-docs.ts` 维护文档元数据和链接 helper；新增 `/docs` 页面，按 basics / branching / remote / advanced / worktree 渲染命令卡片；在 `AppHeader`、首页 CTA、场景页和 `LearningPathPanel` 中接入 docs 入口与“查看命令解释”跳转。
- 结果：应用现在拥有可访问的 `/docs` 入口，用户可以按分类查当前已支持命令的语法、用途与 Playground 试跑链接，也可以从场景页和 Playground 学习面板直接跳到对应命令的文档锚点，形成“练习 -> 查阅 -> 再练习”的最小闭环。
- 验证：`pnpm test` 通过 9 个测试文件、50 个测试；`pnpm lint` 无警告；`pnpm build` 成功并生成 `/docs`；`curl -I http://127.0.0.1:3900/docs` 返回 200；`curl -I http://127.0.0.1:3900/docs#git-pull` 返回 200。
- 下一步：继续把 `/docs` 从单页入口深化为更清晰的单命令深链体验，例如补 `/docs/[slug]` 详情页或更强的分类/检索入口。

## 2026-04-09 23:07｜把 `/docs` 深化为 `/docs/[slug]` 单命令详情页
- 目标：把 `/docs` 从列表入口深化为可直接分享和跳转的单命令详情页
- 动作：按 TDD 为 docs slug 深链、命令详情查找和静态参数生成写红灯测试；在 `src/lib/git-docs.ts` 中为每条命令加入 `detailHref`，补齐 `getCommandDocBySlug` 与 `getAllCommandDocSlugs`；新增 `src/app/docs/[slug]/page.tsx`，渲染命令详情、同分类命令和 Playground 试跑入口；把场景页和 Playground 面板里的 docs 跳转统一切到 `/docs/[slug]` 深链。
- 结果：用户现在不仅能在 `/docs` 看分类总览，还能直接打开 `/docs/pull`、`/docs/worktree` 这种稳定详情页，适合从场景、Playground 或后续搜索入口直接落到单命令解释。
- 验证：`pnpm test` 通过 9 个测试文件、51 个测试；`pnpm lint` 无警告；`pnpm build` 成功并静态生成 19 个 `/docs/[slug]` 页面；`curl -I http://127.0.0.1:3900/docs/pull` 返回 200；`curl -I http://127.0.0.1:3900/docs/worktree` 返回 200。
- 下一步：继续为 `/docs` 增加更强的分类导航或命令搜索，让用户更快定位到目标命令。

## 2026-04-09 23:16｜为 `/docs` 增加命令搜索
- 目标：在不引入复杂检索系统的前提下，让用户能在 `/docs` 里更快定位到目标命令
- 动作：按 TDD 为命令搜索 helper 增加空查询、命令名匹配和简介/用途匹配测试；在 `src/lib/git-docs.ts` 中新增 `searchGroupedCommandDocs`；新增 `src/components/docs/DocsExplorer.tsx` 作为客户端搜索入口，使用 `useDeferredValue` 做实时过滤，并保留分类锚点、详情页与 Playground 跳转；把 `/docs` 页面切换到新 explorer 组件承载搜索与空状态。
- 结果：用户现在可以在 `/docs` 按命令名、语法、简介和用途实时过滤 19 条已支持命令；搜索结果仍保留分组结构，并可继续跳到 `/docs/[slug]` 或直接回 Playground 试跑；无结果时也会给出友好提示，不再只能靠滚动列表查命令。
- 验证：`pnpm test src/lib/git-docs.test.ts` 通过 1 个测试文件、7 个测试；`pnpm test` 通过 9 个测试文件、54 个测试；`pnpm lint` 无警告；`pnpm build` 成功并生成可用的 `/docs` 页面；`curl -I http://127.0.0.1:3900/docs` 返回 200；`curl -I http://127.0.0.1:3900/docs/pull` 返回 200。
- 下一步：继续补强 `/docs` 搜索后的定位体验，例如扩充关键词覆盖、增加结果引导，或把场景推荐命令和 docs 检索进一步联动。

## 2026-04-09 23:26｜补强 `/docs` 搜索关键词与推荐练习入口
- 目标：让用户不只“搜得到命令”，还更容易基于意图关键词找到答案，并顺手回到合适场景继续练习
- 动作：按 TDD 为命令文档增加推荐场景元数据和“回滚”类关键词别名测试；在 `src/lib/git-docs.ts` 中为命令补充 `keywords` 与 `practiceScenario`，并让 `searchGroupedCommandDocs` 一并检索这些字段；在 `src/components/docs/DocsExplorer.tsx` 的搜索结果中新增“练这个场景”入口与无结果推荐关键词；重写 `src/app/docs/[slug]/page.tsx`，补上推荐练习场景卡片和回场景按钮，同时清理此前详情页里的乱码文案。
- 结果：`/docs` 现在不仅能搜命令名，还能用“回滚”“远程协作”“热修复”“撤销暂存”这类意图词命中相关命令；命令结果和详情页也都能直接跳回推荐场景，教学链路从“查命令”延伸到“回场景练习”。
- 验证：`pnpm test src/lib/git-docs.test.ts` 通过 1 个测试文件、8 个测试；`pnpm test` 通过 9 个测试文件、55 个测试；`pnpm lint` 无警告；`pnpm build` 成功；`curl -I http://127.0.0.1:3900/docs` 返回 200；`curl -I http://127.0.0.1:3900/docs/pull` 返回 200；`validate_context.py --project-root c:/Users/m1591/Desktop/OpenGit` 返回 `context is valid`。
- 下一步：继续把 docs 与当前 Playground 任务做得更贴合，例如从当前学习步骤直接推荐对应命令文档，或在 docs 中显式标出“适合从哪个场景进入”。 

## 2026-04-09 23:31｜把当前 Playground 步骤直接接到命令文档
- 目标：让用户在做当前学习任务时，不必跳出思路就能看到这一步命令的解释与后续练习入口
- 动作：按 TDD 为 `git-docs` 增加 `getCommandDocForInput` 测试，并为 `playground-view-model` 增加 `activeTaskDoc` 断言；在 `src/lib/git-docs.ts` 中补上命令输入到完整文档对象的 helper；在 `src/lib/git-sim/playground-view-model.ts` 中把当前学习步骤对应的命令文档一起派生出来；更新 `src/components/playground/panels/LearningPathPanel.tsx`，在学习面板里直接渲染“当前命令”提示卡、命令简介，以及在需要时跳到相关练习场景；同步更新 `src/components/playground/PlaygroundShell.tsx` 传递新数据。
- 结果：Playground 学习面板现在不只有“查看命令解释”和“填入下一步”两个按钮，还会直接展示当前步骤的命令语法和简短说明；如果这个命令更适合在另一个场景里再练一遍，也会给出“去相关场景”的入口，让教学闭环更顺。
- 验证：`pnpm test src/lib/git-docs.test.ts src/lib/git-sim/playground-view-model.test.ts` 通过 2 个测试文件、16 个测试；`pnpm test` 通过 9 个测试文件、56 个测试；`pnpm lint` 无警告；`pnpm build` 成功；`curl -I "http://127.0.0.1:3900/playground?scenario=solo-project&command=git%20init"` 返回 200；`curl -I "http://127.0.0.1:3900/playground?scenario=version-rollback&command=git%20revert%20HEAD"` 返回 200；`validate_context.py --project-root c:/Users/m1591/Desktop/OpenGit` 返回 `context is valid`。
- 下一步：继续把 docs 反向接回当前任务，例如在 `/docs/[slug]` 显式标出“适合从哪个场景进入”与“练完后回到哪一步”。 
