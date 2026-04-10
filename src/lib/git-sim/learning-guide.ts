import type { GitState } from "./types";
import { getScenarioPreset } from "./scenario-presets";

export interface LearningChecklistItem {
  id: string;
  title: string;
  command: string;
  completed: boolean;
  goal: string;
}

export interface LearningScenarioTeachingNote {
  tone: "conflict" | "release" | "worktree";
  eyebrow: string;
  title: string;
  body: string;
}

export interface LearningScenario {
  id: string;
  title: string;
  summary: string;
  objective: string;
  successCriteria: string;
  teachingNote?: LearningScenarioTeachingNote;
  checklist: LearningChecklistItem[];
  activeTask: LearningChecklistItem | undefined;
  completedTaskCount: number;
  totalTaskCount: number;
  progressLabel: string;
  isComplete: boolean;
}

function buildLearningScenario(
  scenario: Omit<LearningScenario, "activeTask" | "completedTaskCount" | "totalTaskCount" | "progressLabel" | "isComplete">
): LearningScenario {
  const completedTaskCount = scenario.checklist.filter((item) => item.completed).length;
  const totalTaskCount = scenario.checklist.length;

  return {
    ...scenario,
    activeTask: scenario.checklist.find((item) => !item.completed),
    completedTaskCount,
    totalTaskCount,
    progressLabel: `${completedTaskCount}/${totalTaskCount}`,
    isComplete: completedTaskCount === totalTaskCount
  };
}

export function getLearningScenario(state: GitState, selectedScenarioId?: string): LearningScenario {
  if (selectedScenarioId === "team-collab") {
    return getTeamCollaborationScenario(state);
  }

  if (selectedScenarioId === "conflict-resolution") {
    return getConflictResolutionScenario(state);
  }

  if (selectedScenarioId === "version-rollback") {
    return getVersionRollbackScenario(state);
  }

  if (selectedScenarioId === "release-management") {
    return getReleaseManagementScenario(state);
  }

  if (selectedScenarioId === "worktree-parallel") {
    return getWorktreeParallelScenario(state);
  }

  if (selectedScenarioId === "solo-project") {
    return getSoloProjectScenario(state);
  }

  return getActiveLearningScenario(state);
}

export function getActiveLearningScenario(state: GitState): LearningScenario {
  return isClonedRepository(state) ? getTeamCollaborationScenario(state) : getSoloProjectScenario(state);
}

export function getSoloProjectScenario(state: GitState): LearningScenario {
  const checklist = getLearningChecklist(state);

  return buildLearningScenario({
    id: "solo-project",
    title: "从零开始个人项目",
    summary: "把一个新项目从本地初始化推进到 feature 分支和 origin 同步。",
    objective: "初始化仓库，提交第一批文件，创建练习分支，并把当前分支推送到远端。",
    successCriteria: "HEAD 指向最新提交，当前分支有本地引用，origin 上存在对应远端引用。",
    checklist
  });
}

export function getTeamCollaborationScenario(state: GitState): LearningScenario {
  return buildLearningScenario({
    id: "team-collab",
    title: "加入团队项目",
    summary: "从远端克隆项目，创建 feature 分支，提交自己的改动并推送回 origin。",
    objective: "模拟加入团队仓库后的最短协作闭环：clone、开分支、提交、推送。",
    successCriteria: "当前分支不是 main，本地 feature 分支和 origin/feature 分支指向同一个最新提交。",
    checklist: getTeamCollaborationChecklist(state)
  });
}

export function getVersionRollbackScenario(state: GitState): LearningScenario {
  const revertCommit = state.commits.find((commit) => commit.message.startsWith('Revert "'));
  const reverted = Boolean(revertCommit);
  const cleanAfterRevert = reverted && state.files.every((file) => file.status === "tracked");

  return buildLearningScenario({
    id: "version-rollback",
    title: "版本回退与修复",
    summary: "先在一条有问题的提交上练习 revert，再自己试试 reset 对本地历史的影响。",
    objective: "看清 reset 会移动当前分支，revert 会保留历史并额外生成一条修复提交。",
    successCriteria: "能够生成一条 Revert 提交，并理解它与 git reset --soft HEAD~1 的区别。",
    checklist: [
      {
        id: "inspect-history",
        title: "观察已有历史",
        command: "git log",
        goal: "确认当前仓库已经有一条 base 和一条 broken change 提交。",
        completed: state.commits.length >= 2
      },
      {
        id: "revert-head",
        title: "生成修复提交",
        command: "git revert HEAD",
        goal: "保留历史不丢失，同时追加一条回滚错误改动的新提交。",
        completed: reverted
      },
      {
        id: "inspect-status",
        title: "确认工作区状态",
        command: "git status",
        goal: "观察 revert 完成后工作区是否仍然干净。",
        completed: cleanAfterRevert
      },
      {
        id: "compare-reset",
        title: "对比 reset 的效果",
        command: "git reset --soft HEAD~1",
        goal: "再试一次 reset，感受 HEAD 回退但改动留在暂存区的差异。",
        completed: state.head === "c000002" && state.files.some((file) => file.status === "staged")
      }
    ]
  });
}

export function getConflictResolutionScenario(state: GitState): LearningScenario {
  const hasConflict = state.conflictDetected;
  const inspectedConflict = state.conflictStatusChecked;
  const resolvedConflict = state.conflictResolved;
  const createdResolutionCommit = state.commits[0]?.message === "resolve conflict" && state.mergeTargetHash === null;

  return buildLearningScenario({
    id: "conflict-resolution",
    title: "处理冲突",
    summary: "让本地改动和 teammate 的远端改动在同一文件上相撞，再亲手完成一次冲突解决。",
    objective: "看清 pull 冲突不是失败终点，而是一次需要检查、标记解决并提交收尾的合并过程。",
    successCriteria: "能触发一次 pull 冲突、看到 unmerged paths、用 git add 标记已解决，并写出一条 resolve conflict 提交。",
    teachingNote: {
      tone: "conflict",
      eyebrow: "冲突观察点",
      title: "冲突不是失败，而是 Git 把最后决定权交还给你",
      body: "先看 git pull 后出现的 unmerged paths，再把 git add 理解为“标记已解决”，最后用一条清晰的提交把这次人工合并正式收尾。"
    },
    checklist: [
      {
        id: "trigger-conflict",
        title: "触发 pull 冲突",
        command: "git pull",
        goal: "把本地和远端对同一文件的竞争修改拉到台面上。",
        completed: hasConflict
      },
      {
        id: "inspect-conflict",
        title: "查看未合并路径",
        command: "git status",
        goal: "确认 README.md 进入 unmerged 状态，理解 Git 在等你手动处理。",
        completed: inspectedConflict
      },
      {
        id: "mark-resolved",
        title: "标记冲突已解决",
        command: "git add README.md",
        goal: "把手动解决后的文件重新放回暂存区，告诉 Git 这份冲突已经处理完。",
        completed: resolvedConflict
      },
      {
        id: "finish-merge",
        title: "提交冲突解决结果",
        command: 'git commit -m "resolve conflict"',
        goal: "用一条清晰的提交结束这次冲突处理流程。",
        completed: createdResolutionCommit
      }
    ]
  });
}

export function getReleaseManagementScenario(state: GitState): LearningScenario {
  const hasReleaseBranch = state.branches.includes("release");
  const onReleaseBranch = state.branch === "release";
  const hasTag = Boolean(state.tags["v1.0.0"]);
  const pushedTag = state.remoteTags["v1.0.0"] === state.tags["v1.0.0"] && Boolean(state.tags["v1.0.0"]);

  return buildLearningScenario({
    id: "release-management",
    title: "发布管理",
    summary: "从稳定提交切出 release 分支，打上版本标签，再把 tags 推到远端。",
    objective: "理解 release 分支和 tag 如何共同定义一个可追溯的发布节点。",
    successCriteria: "release 分支存在，v1.0.0 指向当前提交，并且 origin 上也存在同名标签。",
    teachingNote: {
      tone: "release",
      eyebrow: "发布视角",
      title: "release 分支负责收口，tag 负责给发布点命名",
      body: "这里要分清三个对象：release 分支承载发布收口，v1.0.0 tag 锚定当前提交，而 git push --tags 才会让远端也拥有同一个版本坐标。"
    },
    checklist: [
      {
        id: "release-branch",
        title: "创建 release 分支",
        command: "git branch release",
        goal: "从稳定提交切出一条专门用于发布管理的分支。",
        completed: hasReleaseBranch
      },
      {
        id: "switch-release",
        title: "切到 release 分支",
        command: "git switch release",
        goal: "把接下来的发布动作明确绑定到 release 分支。",
        completed: onReleaseBranch
      },
      {
        id: "tag-release",
        title: "创建版本标签",
        command: "git tag v1.0.0",
        goal: "给当前提交打一个稳定版本锚点，方便发布和回溯。",
        completed: hasTag
      },
      {
        id: "push-tags",
        title: "推送版本标签",
        command: "git push --tags",
        goal: "让远端仓库也拥有同一个发布标签。",
        completed: pushedTag
      }
    ]
  });
}

export function getWorktreeParallelScenario(state: GitState): LearningScenario {
  const hotfixTree = state.worktrees.find((worktree) => worktree.path === "../hotfix");
  const hasHotfixTree = Boolean(hotfixTree);
  const createdHotfixTree = state.worktreeAdded;
  const listedWorktrees = state.worktreeListInspected;
  const confirmedFeatureBranch = state.worktreeStatusChecked && state.branch === "feature/payment";
  const cleanedUp = !hasHotfixTree && state.worktreeListInspected && state.worktreeStatusChecked;

  return buildLearningScenario({
    id: "worktree-parallel",
    title: "Worktree 多分支并行开发",
    summary: "保留正在进行的 feature/payment，同时额外拉出一个 hotfix 工作目录处理紧急问题。",
    objective: "理解 worktree 如何让同一仓库在不同目录里并行 checkout 多个分支，而不打断当前开发上下文。",
    successCriteria: "主工作目录仍停留在 feature/payment，额外挂载过 ../hotfix -> main，并能在演示完成后安全移除。",
    teachingNote: {
      tone: "worktree",
      eyebrow: "并行开发视角",
      title: "hotfix 借道 main，但你当前的 feature/payment 不该被打断",
      body: "关键不是多一个目录，而是当前工作目录继续停在 feature/payment。你应该同时观察 Worktrees 区里的 ../hotfix -> main，以及主目录上下文没有被切走。"
    },
    checklist: [
      {
        id: "create-hotfix-tree",
        title: "拉出 hotfix 工作目录",
        command: "git worktree add ../hotfix main",
        goal: "在不离开当前 feature/payment 的前提下，把 main 放到单独目录里准备修 hotfix。",
        completed: createdHotfixTree
      },
      {
        id: "inspect-linked-trees",
        title: "查看所有 worktree",
        command: "git worktree list",
        goal: "确认主目录和 ../hotfix 正在共享同一个仓库对象库，但分别占有不同分支。",
        completed: listedWorktrees
      },
      {
        id: "confirm-feature-stays-open",
        title: "确认当前分支未被打断",
        command: "git status",
        goal: "验证主工作目录仍停在 feature/payment，没有被热修分支抢走上下文。",
        completed: confirmedFeatureBranch
      },
      {
        id: "remove-hotfix-tree",
        title: "清理临时 hotfix 目录",
        command: "git worktree remove ../hotfix",
        goal: "在热修演示结束后移除额外 worktree，回到单工作目录状态。",
        completed: cleanedUp
      }
    ]
  });
}

export function getLearningChecklist(state: GitState): LearningChecklistItem[] {
  const hasStagedFiles = state.files.some((file) => file.status === "staged");
  const hasCommits = state.commits.length > 0;
  const hasFeatureBranch = state.branches.some((branch) => branch !== "main");
  const hasRemoteCommits = state.remoteCommits.length > 0;

  return [
    {
      id: "init",
      title: "初始化仓库",
      command: "git init",
      goal: "建立本地 .git 仓库，让后续文件变化能被 Git 追踪。",
      completed: state.initialized
    },
    {
      id: "stage",
      title: "把文件放入暂存区",
      command: "git add .",
      goal: "选择要进入下一次提交的文件。",
      completed: hasStagedFiles || hasCommits
    },
    {
      id: "commit",
      title: "写入第一条提交",
      command: 'git commit -m "first commit"',
      goal: "把暂存区内容保存为可回看的项目快照。",
      completed: hasCommits
    },
    {
      id: "branch",
      title: "创建一个练习分支",
      command: "git switch -c feature/flow",
      goal: "从 main 分出一条安全的练习线，观察 HEAD 和 branch 指针的移动。",
      completed: hasFeatureBranch
    },
    {
      id: "push",
      title: "同步到远端仓库",
      command: "git push",
      goal: "让 origin 上出现当前分支的远端引用。",
      completed: hasRemoteCommits
    }
  ];
}

export function getScenarioTeachingNote(scenarioId: string): LearningScenarioTeachingNote | undefined {
  if (
    scenarioId !== "conflict-resolution" &&
    scenarioId !== "release-management" &&
    scenarioId !== "worktree-parallel"
  ) {
    return undefined;
  }

  return getLearningScenario(getScenarioPreset(scenarioId).gitState, scenarioId).teachingNote;
}

function getTeamCollaborationChecklist(state: GitState): LearningChecklistItem[] {
  const cloned = isClonedRepository(state);
  const onFeatureBranch = state.branch !== "main";
  const featureHead = onFeatureBranch ? state.branchHeads[state.branch] : null;
  const hasFeatureCommit = Boolean(
    onFeatureBranch &&
      featureHead &&
      state.commits.some((commit) => commit.hash === featureHead && commit.parentHash !== null)
  );
  const pushedFeatureBranch = Boolean(onFeatureBranch && featureHead && state.remoteBranchHeads[state.branch] === featureHead);

  return [
    {
      id: "clone",
      title: "克隆团队仓库",
      command: "git clone https://github.com/opengit/example.git",
      goal: "从 origin/main 得到已有项目和远端引用。",
      completed: cloned
    },
    {
      id: "feature-branch",
      title: "创建 feature 分支",
      command: "git switch -c feature/team-work",
      goal: "把自己的改动隔离到团队协作分支。",
      completed: onFeatureBranch
    },
    {
      id: "team-commit",
      title: "提交协作改动",
      command: 'git commit -m "team work"',
      goal: "把 feature 分支上的改动保存为本地提交。",
      completed: hasFeatureCommit
    },
    {
      id: "team-push",
      title: "推送 feature 分支",
      command: "git push",
      goal: "让 origin 上出现当前 feature 分支，准备后续 PR。",
      completed: pushedFeatureBranch
    }
  ];
}

function isClonedRepository(state: GitState): boolean {
  return state.commits.some((commit) => commit.message.startsWith("Clone from "));
}
