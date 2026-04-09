import { getLearningScenario, type LearningChecklistItem, type LearningScenario } from "./learning-guide";
import type { GitCommit, GitFileStatus, GitFlowEffect, GitFlowZone, GitState } from "./types";

export const flowZones = [
  { key: "working", label: "工作区", description: "尚未暂存的文件" },
  { key: "staging", label: "暂存区", description: "下一次提交的内容" },
  { key: "local", label: "本地仓库", description: "已经写入的提交" },
  { key: "remote", label: "远端仓库", description: "后续模拟 push / pull" }
] as const satisfies ReadonlyArray<{
  key: GitFlowZone;
  label: string;
  description: string;
}>;

export const flowLinks: Array<{ from: GitFlowZone; to: GitFlowZone }> = [
  { from: "working", to: "staging" },
  { from: "staging", to: "local" },
  { from: "local", to: "remote" }
];

export const statusLabels: Record<GitFileStatus, string> = {
  untracked: "未跟踪",
  modified: "已修改",
  staged: "已暂存",
  tracked: "已提交",
  conflicted: "冲突中"
};

export interface FlowItem {
  id: string;
  label: string;
  meta: string;
  status: GitFileStatus;
}

export interface BranchSyncStatus {
  branchLabel: string;
  localHead: string;
  remoteHead: string;
  ahead: number;
  behind: number;
  summary: string;
}

export interface RemoteRefViewModel {
  name: string;
  branch: string;
  target: string;
  isCurrentBranch: boolean;
}

export type ZoneCounts = Record<GitFlowZone, number>;

export type FlowItemsByZone = Record<GitFlowZone, FlowItem[]>;

export interface PlaygroundViewModel {
  zoneCounts: ZoneCounts;
  flowItems: FlowItemsByZone;
  learningScenario: LearningScenario;
  learningChecklist: LearningChecklistItem[];
  activeTask: LearningChecklistItem | undefined;
  headCommit: string;
  remoteHead: string;
  syncStatus: BranchSyncStatus;
  remoteRefs: RemoteRefViewModel[];
  isFlowActive: (from: GitFlowZone, to: GitFlowZone) => boolean;
}

export function buildPlaygroundViewModel(
  gitState: GitState,
  latestEffect?: GitFlowEffect,
  selectedScenarioId?: string
): PlaygroundViewModel {
  const workingFiles = gitState.files.filter(
    (file) => file.status === "untracked" || file.status === "modified" || file.status === "conflicted"
  );
  const stagedFiles = gitState.files.filter((file) => file.status === "staged");
  const learningScenario = getLearningScenario(gitState, selectedScenarioId);
  const learningChecklist = learningScenario.checklist;
  const syncStatus = buildBranchSyncStatus(gitState);
  const remoteRefs = buildRemoteRefs(gitState);

  return {
    zoneCounts: {
      working: workingFiles.length,
      staging: stagedFiles.length,
      local: gitState.commits.length,
      remote: gitState.remoteCommits.length
    },
    flowItems: {
      working: workingFiles.map((file) => ({
        id: file.path,
        label: file.path,
        meta: statusLabels[file.status],
        status: file.status
      })),
      staging: stagedFiles.map((file) => ({
        id: file.path,
        label: file.path,
        meta: "下一次提交",
        status: file.status
      })),
      local: gitState.commits.map((commit) => ({
        id: commit.hash,
        label: commit.hash,
        meta: commit.message,
        status: "tracked"
      })),
      remote: gitState.remoteCommits.map((commit) => ({
        id: commit.hash,
        label: commit.hash,
        meta: `origin/${gitState.branch}`,
        status: "tracked"
      }))
    },
    learningScenario,
    learningChecklist,
    activeTask: learningScenario.activeTask,
    headCommit: gitState.head ?? "no commits",
    remoteHead: gitState.remoteCommits[0]?.hash ?? "not pushed",
    syncStatus,
    remoteRefs,
    isFlowActive: (from, to) =>
      (latestEffect?.from === from && latestEffect.to === to) ||
      (latestEffect?.from === to && latestEffect.to === from)
  };
}

function buildRemoteRefs(gitState: GitState): RemoteRefViewModel[] {
  return Object.entries(gitState.remoteBranchHeads)
    .map(([branch, target]) => ({
      name: `origin/${branch}`,
      branch,
      target: target ?? "empty",
      isCurrentBranch: branch === gitState.branch
    }))
    .sort((left, right) => {
      if (left.isCurrentBranch !== right.isCurrentBranch) {
        return left.isCurrentBranch ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });
}

function buildBranchSyncStatus(gitState: GitState): BranchSyncStatus {
  const remoteHead = gitState.remoteBranchHeads[gitState.branch] ?? null;

  if (!remoteHead) {
    return {
      branchLabel: `${gitState.branch} ↔ origin/${gitState.branch}`,
      localHead: gitState.head ?? "no commits",
      remoteHead: "not pushed",
      ahead: gitState.head ? countReachableCommits(gitState.commits, gitState.head) : 0,
      behind: 0,
      summary: "no remote"
    };
  }

  const localReachable = collectReachableHashes(gitState.commits, gitState.head);
  const remoteReachable = collectReachableHashes(gitState.remoteCommits, remoteHead);
  const ahead = Array.from(localReachable).filter((hash) => !remoteReachable.has(hash)).length;
  const behind = Array.from(remoteReachable).filter((hash) => !localReachable.has(hash)).length;

  return {
    branchLabel: `${gitState.branch} ↔ origin/${gitState.branch}`,
    localHead: gitState.head ?? "no commits",
    remoteHead,
    ahead,
    behind,
    summary: formatSyncSummary(ahead, behind)
  };
}

function collectReachableHashes(commits: GitCommit[], startHash: string | null): Set<string> {
  const commitsByHash = new Map(commits.map((commit) => [commit.hash, commit]));
  const hashes = new Set<string>();
  let cursor = startHash;

  while (cursor && !hashes.has(cursor)) {
    const commit = commitsByHash.get(cursor);
    if (!commit) {
      break;
    }

    hashes.add(cursor);
    cursor = commit.parentHash;
  }

  return hashes;
}

function countReachableCommits(commits: GitCommit[], startHash: string): number {
  return collectReachableHashes(commits, startHash).size;
}

function formatSyncSummary(ahead: number, behind: number): string {
  if (ahead === 0 && behind === 0) {
    return "up to date";
  }

  if (ahead > 0 && behind > 0) {
    return `ahead ${ahead} / behind ${behind}`;
  }

  if (ahead > 0) {
    return `ahead ${ahead}`;
  }

  return `behind ${behind}`;
}
