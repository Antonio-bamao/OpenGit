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

export function getSoloProjectScenario(state: GitState): LearningScenario {
  const checklist = getLearningChecklist(state);
  const completedTaskCount = checklist.filter((item) => item.completed).length;
  const totalTaskCount = checklist.length;

  return {
    id: "solo-project",
    title: "从零开始个人项目",
    summary: "把一个新项目从本地初始化推进到 feature 分支和 origin 同步。",
    objective: "初始化仓库，提交第一批文件，创建练习分支，并把当前分支推送到远端。",
    successCriteria: "HEAD 指向最新提交，当前分支有本地引用，origin 上存在对应远端引用。",
    checklist,
    activeTask: checklist.find((item) => !item.completed),
    completedTaskCount,
    totalTaskCount,
    progressLabel: `${completedTaskCount}/${totalTaskCount}`,
    isComplete: completedTaskCount === totalTaskCount
  };
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
