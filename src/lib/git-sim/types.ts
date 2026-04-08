export type GitFileStatus = "untracked" | "modified" | "staged" | "tracked";

export interface GitFile {
  path: string;
  status: GitFileStatus;
}

export interface GitCommit {
  hash: string;
  message: string;
  files: string[];
  branch: string;
  parentHash: string | null;
}

export interface GitHint {
  title: string;
  body: string;
}

export interface GitState {
  initialized: boolean;
  branch: string;
  branches: string[];
  branchHeads: Record<string, string | null>;
  head: string | null;
  files: GitFile[];
  commits: GitCommit[];
  remoteCommits: GitCommit[];
  remoteBranchHeads: Record<string, string | null>;
}

export interface GitCommand {
  raw: string;
  isGit: boolean;
  name: string;
  args: string[];
}

export interface CommandResult {
  state: GitState;
  output: string;
  hint?: GitHint;
  effect?: GitFlowEffect;
}

export type GitFlowZone = "working" | "staging" | "local" | "remote";

export type GitFlowEffectType =
  | "stage"
  | "unstage"
  | "commit"
  | "clone"
  | "push"
  | "pull"
  | "fetch"
  | "switch";

export interface GitFlowEffect {
  type: GitFlowEffectType;
  from?: GitFlowZone;
  to?: GitFlowZone;
  filePaths?: string[];
}
