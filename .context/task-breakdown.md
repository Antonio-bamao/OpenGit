# 任务拆解

## 当前优先级

1. 保持 `/playground`、`/scenarios`、`/docs` 三个核心入口稳定可运行，继续把教学闭环收紧。
2. 继续打磨 `/docs` 搜索结果到场景练习的转化体验，例如在当前任务和推荐练习之间做更明显的双向联动。
3. 继续增强 Playground 与场景里的文档联动，让“填入下一步”“查看命令解释”“回到对应场景”之间切换更自然。
4. 打磨冲突、标签、worktree 等场景的可视化细节与提示文案，提升教学解释力。
5. 评估是否引入 `isomorphic-git + lightning-fs` 的更真实语义，或继续保持受控状态模型避免过早复杂化。

## 暂缓任务

- NextAuth.js、GitHub OAuth、Google OAuth。
- PostgreSQL + Prisma。
- Docker 沙盒和 dockerode。
- GitHub 教学完整页面。
- 完整 MDX/contentlayer 文档系统。
- 完整 Git Graph 和引用指针图。

## 依赖关系

- docs 更强导航应建立在当前 `/docs` 搜索、关键词别名、推荐场景入口与 `/docs/[slug]` 详情页稳定后再扩展。
- 场景到文档的联动依赖现有 scenario catalog、learning guide 与 command 预填机制。
- 更真实的 Git 引擎语义必须在 MVP 交互闭环与文档入口稳定后再评估引入。
