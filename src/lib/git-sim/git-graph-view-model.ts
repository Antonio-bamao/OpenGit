import type { GitFlowEffect, GitState } from "./types";

export interface GitGraphNode {
  hash: string;
  message: string;
  branch: string;
  parentHash: string | null;
  lane: number;
  refs: string[];
  remoteRefs: string[];
  activeRefs: string[];
  activeRemoteRefs: string[];
  isHead: boolean;
  isActiveHead: boolean;
}

export interface GitGraphViewModel {
  nodes: GitGraphNode[];
  currentBranch: string;
  emptyMessage: string;
}

export function buildGitGraphViewModel(
  gitState: GitState,
  latestEffect?: GitFlowEffect
): GitGraphViewModel {
  const branchLaneMap = new Map(gitState.branches.map((branch, index) => [branch, index]));
  const activeHashes = collectActiveHashes(gitState, latestEffect);

  return {
    currentBranch: gitState.branch,
    emptyMessage: "暂无提交，先运行 git add . 和 git commit。",
    nodes: gitState.commits.map((commit) => ({
      hash: commit.hash,
      message: commit.message,
      branch: commit.branch,
      parentHash: commit.parentHash,
      lane: branchLaneMap.get(commit.branch) ?? 0,
      refs: collectRefs(gitState.branchHeads, commit.hash),
      remoteRefs: collectRemoteRefs(gitState.remoteBranchHeads, commit.hash),
      activeRefs: activeHashes.local.has(commit.hash)
        ? collectRefs(gitState.branchHeads, commit.hash)
        : [],
      activeRemoteRefs: activeHashes.remote.has(commit.hash)
        ? collectRemoteRefs(gitState.remoteBranchHeads, commit.hash)
        : [],
      isHead: gitState.head === commit.hash,
      isActiveHead: activeHashes.head === commit.hash
    }))
  };
}

function collectRefs(refs: Record<string, string | null>, hash: string): string[] {
  return Object.entries(refs)
    .filter(([, refHash]) => refHash === hash)
    .map(([refName]) => refName);
}

function collectRemoteRefs(refs: Record<string, string | null>, hash: string): string[] {
  return collectRefs(refs, hash).map((refName) => `origin/${refName}`);
}

function collectActiveHashes(
  gitState: GitState,
  latestEffect?: GitFlowEffect
): {
  head: string | null;
  local: Set<string>;
  remote: Set<string>;
} {
  const local = new Set<string>();
  const remote = new Set<string>();

  if (!latestEffect) {
    return { head: null, local, remote };
  }

  if (gitState.head && ["clone", "commit", "pull", "switch"].includes(latestEffect.type)) {
    local.add(gitState.head);
  }

  const currentRemoteHead = gitState.remoteBranchHeads[gitState.branch];

  if (currentRemoteHead && ["clone", "fetch", "pull", "push"].includes(latestEffect.type)) {
    remote.add(currentRemoteHead);
  }

  return {
    head:
      gitState.head && ["clone", "commit", "pull", "switch"].includes(latestEffect.type)
        ? gitState.head
        : null,
    local,
    remote
  };
}
