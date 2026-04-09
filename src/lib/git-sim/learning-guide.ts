import type { GitState } from "./types";

export interface LearningChecklistItem {
  id: string;
  title: string;
  command: string;
  completed: boolean;
  goal: string;
}

export interface LearningScenario {
  id: string;
  title: string;
  summary: string;
  objective: string;
  successCriteria: string;
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

  if (selectedScenarioId === "version-rollback") {
    return getVersionRollbackScenario(state);
  }

  if (selectedScenarioId === "release-management") {
    return getReleaseManagementScenario(state);
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
