# 任务拆解

## 当前优先级
1. 保持 `/playground`、`/scenarios`、`/docs` 三个核心入口稳定可用，继续收紧教学闭环。
2. 继续统一 docs、playground、scenarios 三处入口共享的场景优先级表达，让“推荐起点 / 协作进阶 / 问题处理 / 历史修复”形成更明确的新手路径。
3. 继续把“下一站推荐”从 docs 详情页和 Playground 完成态往更前面的交互节点推进，例如最后一步预告、接近完成时的提示，以及 scenarios 页上的建议顺序。
4. 打磨冲突、发布、worktree 等进阶场景的提示文案与可视化细节，提升教学解释力。
5. 在当前阶段继续优先保持受控状态模型的教学清晰度，暂不提前扩张到 Docker 真 Git 沙箱、GitHub 教学页和账号系统。

## 暂缓任务

- NextAuth.js、GitHub OAuth、Google OAuth
- PostgreSQL + Prisma
- Docker 沙箱和 `dockerode`
- GitHub 教学完整页面
- 完整 MDX / contentlayer 文档系统
- 更完整的 Git Graph / refs 可视化

## 依赖关系

- Playground 与 docs 的双向引导依赖 `src/lib/git-docs.ts` 里的命令文档元数据继续保持单一来源。
- 场景回跳与推荐顺序依赖 `scenario-catalog`、`learning-guide`、`playground-view-model` 和预填命令机制保持同步。
- 更真实的 Git 引擎语义应放在当前教学链路稳定之后再评估引入，避免过早复杂化。
