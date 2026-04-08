# 任务拆解

## 当前优先级

1. 完成仓库初始化与 `.context/` 健康校验。
2. 为 MVP 写清实现计划：Next.js 骨架、Playground 壳、终端输入、Git 状态模型、首批可视化。
3. 初始化 Next.js 14 + TypeScript + Tailwind 项目。
4. 实现 `/playground` 第一版布局：终端区、可视化区、状态区。
5. 实现命令 parser 与基础模拟命令：`git init`、`git status`、`git add`、`git commit`、`git log`。
6. 实现状态面板和工作流程图的同步。
7. 再评估是否接入 `isomorphic-git + lightning-fs`，避免过早引入复杂度。

## 暂缓任务

- NextAuth.js、GitHub OAuth、Google OAuth。
- PostgreSQL + Prisma。
- Docker 沙盒和 dockerode。
- GitHub 教学完整页面。
- MDX/contentlayer 文档系统。
- 完整 Git Graph 和引用指针图。

## 依赖关系

- Next.js 应用骨架必须先于所有页面和组件开发。
- Git 状态模型必须先于可视化联动。
- 基础模拟命令必须先于场景系统。
- 真实 Git 引擎和 Docker 沙盒必须在 MVP 交互闭环稳定后再引入。
