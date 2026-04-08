import type { GitState } from "./types";

export interface LearningChecklistItem {
  id: string;
  title: string;
  command: string;
  completed: boolean;
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
      completed: state.initialized
    },
    {
      id: "stage",
      title: "把文件放入暂存区",
      command: "git add .",
      completed: hasStagedFiles || hasCommits
    },
    {
      id: "commit",
      title: "写入第一条提交",
      command: 'git commit -m "first commit"',
      completed: hasCommits
    },
    {
      id: "branch",
      title: "创建一个练习分支",
      command: "git switch -c feature/flow",
      completed: hasFeatureBranch
    },
    {
      id: "push",
      title: "同步到远端仓库",
      command: "git push",
      completed: hasRemoteCommits
    }
  ];
}
