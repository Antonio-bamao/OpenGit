# 任务拆解

## 当前优先级

1. 收口 MVP 场景闭环后的下一阶段路线：保持 `/playground` 体验稳定，并把命令参考文档入口补起来。
2. 实现 `/docs` 最小命令参考页面，先覆盖 basics / branching / remote / advanced / worktree 分类。
3. 让场景和 Playground 中的关键命令能跳转或衔接到对应文档，形成“练习 -> 查阅 -> 再练习”的闭环。
4. 继续打磨冲突、标签、worktree 等场景的可视化细节与提示文案，提升教学解释力。
5. 评估是否引入 `isomorphic-git + lightning-fs` 的更真实语义，或继续保持受控状态模型避免过早复杂化。

## 暂缓任务

- NextAuth.js、GitHub OAuth、Google OAuth。
- PostgreSQL + Prisma。
- Docker 沙盒和 dockerode。
- GitHub 教学完整页面。
- 完整 MDX/contentlayer 文档系统。
- 完整 Git Graph 和引用指针图。

## 依赖关系

- 命令参考文档入口应建立在现有场景和 Playground 稳定可运行的前提上。
- 场景到文档的联动依赖现有 scenario catalog 与 command 预填机制。
- 更真实的 Git 引擎语义必须在 MVP 交互闭环与文档入口稳定后再评估引入。
