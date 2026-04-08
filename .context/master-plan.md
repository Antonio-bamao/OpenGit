# OpenGit 总体计划

## 项目目标

OpenGit 是一个开源的交互式 Git & GitHub 可视化学习平台，面向计算机专业学生、编程初学者和 Git 新手。核心体验是让用户在浏览器里的模拟终端中输入 Git 命令，并实时看到工作目录、暂存区、本地仓库、远程仓库、分支图和引用指针的变化。

源需求文档：`OpenGit — 全局计划落地方案.md`

## 执行原则

- 先做可演示 MVP，再逐步补齐完整 15 周路线图。
- 优先实现学习闭环：输入命令、状态变化、可视化反馈、错误提示。
- 暂缓高成本基础设施：OAuth、PostgreSQL、Docker 沙盒、完整 GitHub 教学模块进入后续阶段。
- 每个阶段都保持可运行、可验证、可继续迭代。

## MVP 范围

### Phase 0：仓库与上下文初始化

- 初始化 git 仓库。
- 创建 `.context/` 项目记忆系统。
- 将全局方案转化为可执行阶段计划。

验收标准：
- `git status` 可用。
- `.context/README.md`、`master-plan.md`、`current-status.md`、`task-breakdown.md`、`work-log.md`、`bug-log.md`、`decisions.md`、`risk-register.md` 存在且无占位内容。

### Phase 1：Next.js 应用骨架

- 初始化 Next.js 14 App Router + React 18 + TypeScript。
- 配置 Tailwind CSS、基础 lint/format、pnpm。
- 建立主要目录结构：`src/app`、`src/components`、`src/lib`、`src/content`。
- 实现基础首页和 `/playground` 路由壳。

验收标准：
- 本地开发服务可启动。
- 基础页面可访问。
- 代码结构支持后续终端、状态模型、可视化模块接入。

### Phase 2：MVP Playground 核心

- 实现模拟终端输入与命令历史。
- 实现 Git 命令 parser 和基础命令处理器。
- 建立 Git 状态模型，覆盖工作目录、暂存区、提交、分支、引用。
- 先用纯前端模拟状态推进，必要时再接入 `isomorphic-git`。

验收标准：
- 用户可以输入 `git init`、`git add`、`git commit`、`git status`、`git log` 等基础命令。
- 命令结果和状态面板同步更新。
- 错误命令给出接近真实终端的错误信息和简短解释。

### Phase 3：第一组可视化

- 实现工作流程图：工作目录 -> 暂存区 -> 本地仓库 -> 远程仓库。
- 实现仓库状态面板。
- 建立可视化与命令执行结果的同步机制。

验收标准：
- `git add`、`git commit` 等命令会改变对应区域状态。
- 页面在桌面与常见移动宽度下可用。

### Phase 4：扩展到完整计划

- 补齐 Git Graph、引用指针图。
- 接入 `isomorphic-git + lightning-fs`。
- 增加场景系统、MDX 命令文档、GitHub 教学模块。
- 后续再接入 NextAuth、Prisma/PostgreSQL、Docker 沙盒和部署流水线。

验收标准：
- 每个扩展模块都有独立测试和明确验收。
- 不牺牲 MVP 的稳定性。

## 项目完成定义

- 用户能通过浏览器中的互动终端完成典型 Git 学习流程。
- 核心 Git 状态和可视化视图保持一致。
- 场景、文档和 GitHub 教学可以围绕同一状态模型扩展。
- 项目具备开源协作所需的 README、LICENSE、贡献说明和基础 CI。
