export type ScenarioStatus = "ready" | "planned";

export interface ScenarioCatalogItem {
  id: string;
  title: string;
  summary: string;
  objective: string;
  status: ScenarioStatus;
  statusLabel: string;
  primaryCommand: string;
  playgroundHref: string;
  steps: string[];
}

function createPlaygroundHref(scenarioId: string, command: string): string {
  return `/playground?scenario=${encodeURIComponent(scenarioId)}&command=${encodeURIComponent(command)}`;
}

export const scenarioCatalog: ScenarioCatalogItem[] = [
  {
    id: "solo-project",
    title: "从零开始个人项目",
    summary: "初始化仓库，提交第一批文件，再把分支同步到 origin。",
    objective: "建立工作区、暂存区、本地仓库和远端仓库之间的第一条完整路径。",
    status: "ready",
    statusLabel: "可练习",
    primaryCommand: "git init",
    playgroundHref: createPlaygroundHref("solo-project", "git init"),
    steps: ["git init", "git add .", 'git commit -m "first commit"', "git switch -c feature/flow", "git push"]
  },
  {
    id: "team-collab",
    title: "加入团队项目",
    summary: "从远端克隆项目，创建 feature 分支，提交自己的改动并推送回 origin。",
    objective: "理解 main、feature 分支和 origin/<branch> 在协作中的关系。",
    status: "ready",
    statusLabel: "可练习",
    primaryCommand: "git clone https://github.com/opengit/example.git",
    playgroundHref: createPlaygroundHref("team-collab", "git switch -c feature/team-work"),
    steps: ["git clone", "git switch -c feature/team-work", 'git commit -m "team work"', "git push"]
  },
  {
    id: "conflict-resolution",
    title: "处理冲突",
    summary: "两个人修改同一处内容后，通过 pull 看到冲突，再完成解决和提交。",
    objective: "把冲突理解为两条历史对同一片内容的竞争修改。",
    status: "planned",
    statusLabel: "后续",
    primaryCommand: "git pull",
    playgroundHref: createPlaygroundHref("conflict-resolution", "git pull"),
    steps: ["git pull", "解决冲突", "git add .", 'git commit -m "resolve conflict"']
  },
  {
    id: "version-rollback",
    title: "版本回退与修复",
    summary: "提交了错误改动后，观察 reset / revert 如何改变历史或生成修复提交。",
    objective: "区分本地回退和可协作的修复提交。",
    status: "planned",
    statusLabel: "后续",
    primaryCommand: "git reset",
    playgroundHref: createPlaygroundHref("version-rollback", "git reset"),
    steps: ["git log", "git reset", "git revert", "git status"]
  },
  {
    id: "release-management",
    title: "发布管理",
    summary: "围绕 GitHub Flow / Git Flow，连接 tag、release 和稳定分支。",
    objective: "理解发布节点为什么是团队协作中的明确边界。",
    status: "planned",
    statusLabel: "后续",
    primaryCommand: "git tag v1.0.0",
    playgroundHref: createPlaygroundHref("release-management", "git tag v1.0.0"),
    steps: ["git branch release", "git tag", "git push --tags", "创建 release"]
  },
  {
    id: "worktree-parallel",
    title: "Worktree 多分支并行开发",
    summary: "正在 feature 分支开发时，用 worktree 拉出 hotfix 工作目录。",
    objective: "看清多个工作目录如何共享同一个仓库对象库。",
    status: "planned",
    statusLabel: "后续",
    primaryCommand: "git worktree add ../hotfix main",
    playgroundHref: createPlaygroundHref("worktree-parallel", "git worktree add ../hotfix main"),
    steps: ["git worktree add", "git worktree list", "修复 hotfix", "git worktree remove"]
  }
];

export function getReadyScenarios(): ScenarioCatalogItem[] {
  return scenarioCatalog.filter((scenario) => scenario.status === "ready");
}
