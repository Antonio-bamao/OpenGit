export type GitFileStatus = "untracked" | "modified" | "staged" | "tracked";

export interface GitFile {
  path: string;
  status: GitFileStatus;
}

export interface GitCommit {
  hash: string;
  message: string;
  files: string[];
}

export interface GitHint {
  title: string;
  body: string;
}

export interface GitState {
  initialized: boolean;
  branch: string;
  head: string | null;
  files: GitFile[];
  commits: GitCommit[];
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
}

