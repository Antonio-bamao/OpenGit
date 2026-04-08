import type { GitState } from "./types";

export interface GitGraphNode {
  hash: string;
  message: string;
  branch: string;
  parentHash: string | null;
  lane: number;
  refs: string[];
  remoteRefs: string[];
  isHead: boolean;
}

export interface GitGraphViewModel {
  nodes: GitGraphNode[];
  currentBranch: string;
  emptyMessage: string;
}

export function buildGitGraphViewModel(gitState: GitState): GitGraphViewModel {
  const branchLaneMap = new Map(gitState.branches.map((branch, index) => [branch, index]));

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
      isHead: gitState.head === commit.hash
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
