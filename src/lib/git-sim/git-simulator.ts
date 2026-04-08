import { parseGitCommand } from "./command-parser";
import type { CommandResult, GitCommit, GitFile, GitState } from "./types";

const initialFiles: GitFile[] = [
  { path: "README.md", status: "untracked" },
  { path: "src/app/page.tsx", status: "untracked" },
  { path: "src/components/playground/PlaygroundShell.tsx", status: "untracked" }
];

export function createInitialGitState(): GitState {
  return {
    initialized: false,
    branch: "main",
    head: null,
    files: initialFiles.map((file) => ({ ...file })),
    commits: []
  };
}

export function executeGitCommand(state: GitState, input: string): CommandResult {
  const command = parseGitCommand(input);

  if (!command.isGit) {
    return {
      state,
      output: `${command.args[0] || input}: command not found`,
      hint: {
        title: "正确做法",
        body: "OpenGit MVP 目前只模拟 Git 命令。试试 `git init` 或 `git status`。"
      }
    };
  }

  switch (command.name) {
    case "init":
      return initRepository(state);
    case "status":
      return showStatus(state);
    case "add":
      return addFiles(state, command.args);
    case "commit":
      return commitFiles(state, command.args);
    case "log":
      return showLog(state);
    default:
      return {
        state,
        output: `git: '${command.name}' is not a git command. See 'git --help'.`,
        hint: {
          title: "为什么报错",
          body: "OpenGit MVP 目前只覆盖 init、status、add、commit 和 log。后续会逐步扩展更多 Git 命令。"
        }
      };
  }
}

function initRepository(state: GitState): CommandResult {
  const nextState = { ...state, initialized: true };

  return {
    state: nextState,
    output: state.initialized
      ? "Reinitialized existing Git repository in /open-git/.git/"
      : "Initialized empty Git repository in /open-git/.git/"
  };
}

function showStatus(state: GitState): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  const staged = state.files.filter((file) => file.status === "staged");
  const untracked = state.files.filter((file) => file.status === "untracked");
  const modified = state.files.filter((file) => file.status === "modified");

  if (staged.length === 0 && untracked.length === 0 && modified.length === 0) {
    return {
      state,
      output: `On branch ${state.branch}\nnothing to commit, working tree clean`
    };
  }

  return {
    state,
    output: [
      `On branch ${state.branch}`,
      staged.length > 0 ? `Changes to be committed:\n${formatFiles(staged)}` : "",
      modified.length > 0 ? `Changes not staged for commit:\n${formatFiles(modified)}` : "",
      untracked.length > 0 ? `Untracked files:\n${formatFiles(untracked)}` : ""
    ]
      .filter(Boolean)
      .join("\n\n")
  };
}

function addFiles(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  const target = args[0] ?? ".";
  const files = state.files.map((file) => {
    if (target === "." || target === file.path) {
      return { ...file, status: "staged" as const };
    }
    return file;
  });

  const stagedCount = files.filter((file) => file.status === "staged").length;

  return {
    state: { ...state, files },
    output: `added ${stagedCount} files to the staging area`
  };
}

function commitFiles(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  const staged = state.files.filter((file) => file.status === "staged");
  if (staged.length === 0) {
    return {
      state,
      output: "nothing to commit, working tree clean"
    };
  }

  const message = getCommitMessage(args);
  const hash = createCommitHash(state.commits.length + 1);
  const commit: GitCommit = {
    hash,
    message,
    files: staged.map((file) => file.path)
  };
  const files = state.files.map((file) =>
    file.status === "staged" ? { ...file, status: "tracked" as const } : file
  );

  return {
    state: {
      ...state,
      head: hash,
      files,
      commits: [commit, ...state.commits]
    },
    output: `[${state.branch} ${hash}] ${message}\n ${staged.length} files changed`
  };
}

function showLog(state: GitState): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  if (state.commits.length === 0) {
    return {
      state,
      output: `fatal: your current branch '${state.branch}' does not have any commits yet`
    };
  }

  return {
    state,
    output: state.commits
      .map((commit) => `commit ${commit.hash}\nAuthor: OpenGit <learn@opengit.local>\n\n    ${commit.message}`)
      .join("\n\n")
  };
}

function notARepository(state: GitState): CommandResult {
  return {
    state,
    output: "fatal: not a git repository (or any of the parent directories): .git",
    hint: {
      title: "正确做法",
      body: "先运行 `git init` 初始化仓库，再执行其他 Git 命令。"
    }
  };
}

function formatFiles(files: GitFile[]): string {
  return files.map((file) => `  ${file.path}`).join("\n");
}

function getCommitMessage(args: string[]): string {
  const messageFlagIndex = args.findIndex((arg) => arg === "-m" || arg === "--message");
  return messageFlagIndex >= 0 ? args[messageFlagIndex + 1] ?? "commit" : "commit";
}

function createCommitHash(seed: number): string {
  return `c${seed.toString().padStart(6, "0")}`;
}
