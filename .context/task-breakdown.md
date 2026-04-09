# 任务拆解

## 当前优先级

1. 保持 `/playground`、`/scenarios`、`/docs` 三个核心入口稳定可用，继续收紧练习闭环。
2. 统一 docs 快启入口和 Playground 学习面板里的场景优先级表达，让“推荐起点 / 协作进阶 / 问题处理 / 历史修复”在不同入口含义一致。
3. 继续增强 `/docs/[slug]` 与 `/scenarios` 的回跳和引导，让用户更容易从命令解释回到合适练习场景。
4. 打磨冲突、发布、worktree 等进阶场景的提示文案与可视化细节，提升教学解释力。
5. 评估是否需要进一步下沉为更真实的 Git 语义实现；在当前阶段继续优先保持受控状态模型的教学清晰度。

## 暂缓任务

- NextAuth.js、GitHub OAuth、Google OAuth
- PostgreSQL + Prisma
- Docker 沙箱和 `dockerode`
- GitHub 教学完整页面
- 完整 MDX/contentlayer 文档系统
- 更完整的 Git Graph / refs 可视化

## 依赖关系

- Playground 与 docs 的双向引导依赖 `src/lib/git-docs.ts` 中的命令文档元数据持续单一来源。
- 场景回跳依赖 `scenario-catalog`、`learning-guide`、`playground-view-model` 与命令预填机制保持同步。
- 更真实的 Git 引擎语义应放在当前教学链路稳定之后再评估引入，避免过早复杂化。
