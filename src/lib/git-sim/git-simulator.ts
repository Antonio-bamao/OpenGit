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
    branches: ["main"],
    head: null,
    files: initialFiles.map((file) => ({ ...file })),
    commits: [],
    remoteCommits: []
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
    case "diff":
      return showDiff(state, command.args);
    case "restore":
      return restoreFiles(state, command.args);
    case "reset":
      return resetStaging(state);
    case "branch":
      return listBranches(state);
    case "switch":
      return switchBranch(state, command.args);
    case "push":
      return pushCommits(state);
    default:
      return {
        state,
        output: `git: '${command.name}' is not a git command. See 'git --help'.`,
        hint: {
          title: "为什么报错",
          body: "OpenGit MVP 目前覆盖 init、status、add、commit、log、diff、restore、reset、branch、switch 和 push。后续会逐步扩展更多 Git 命令。"
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
  const selectedFiles = state.files.filter((file) => target === "." || target === file.path);
  const files = state.files.map((file) => {
    if (target === "." || target === file.path) {
      return { ...file, status: "staged" as const };
    }
    return file;
  });

  const stagedCount = selectedFiles.length;

  return {
    state: { ...state, files },
    output: `added ${stagedCount} ${pluralize("file", stagedCount)} to the staging area`,
    effect: {
      type: "stage",
      from: "working",
      to: "staging",
      filePaths: selectedFiles.map((file) => file.path)
    }
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
    output: `[${state.branch} ${hash}] ${message}\n ${staged.length} files changed`,
    effect: {
      type: "commit",
      from: "staging",
      to: "local",
      filePaths: staged.map((file) => file.path)
    }
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

function showDiff(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  const stagedOnly = args.includes("--staged") || args.includes("--cached");
  const files = stagedOnly
    ? state.files.filter((file) => file.status === "staged")
    : state.files.filter((file) => file.status === "modified");

  if (files.length === 0) {
    return {
      state,
      output: stagedOnly ? "no staged changes" : "no unstaged changes"
    };
  }

  return {
    state,
    output: files
      .map((file) => `${stagedOnly ? "diff --staged" : "diff"} ${file.path}\n+ ${file.path}`)
      .join("\n\n")
  };
}

function restoreFiles(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  if (!args.includes("--staged")) {
    return {
      state,
      output: "OpenGit MVP currently supports `git restore --staged <file>` for unstaging."
    };
  }

  const target = args.find((arg) => arg !== "--staged") ?? ".";
  return unstageFiles(state, target);
}

function resetStaging(state: GitState): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  return unstageFiles(state, ".");
}

function unstageFiles(state: GitState, target: string): CommandResult {
  const selectedFiles = state.files.filter(
    (file) => file.status === "staged" && (target === "." || target === file.path)
  );
  const selectedPaths = new Set(selectedFiles.map((file) => file.path));
  const files = state.files.map((file) => {
    if (!selectedPaths.has(file.path)) {
      return file;
    }

    return {
      ...file,
      status: wasCommitted(state, file.path) ? ("modified" as const) : ("untracked" as const)
    };
  });

  return {
    state: { ...state, files },
    output: `unstaged ${selectedFiles.length} ${pluralize("file", selectedFiles.length)}`,
    effect: {
      type: "unstage",
      from: "staging",
      to: "working",
      filePaths: selectedFiles.map((file) => file.path)
    }
  };
}

function listBranches(state: GitState): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  return {
    state,
    output: state.branches.map((branch) => `${branch === state.branch ? "*" : " "} ${branch}`).join("\n")
  };
}

function switchBranch(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  if (args[0] === "-c") {
    const branchName = args[1];
    if (!branchName) {
      return {
        state,
        output: "fatal: branch name required"
      };
    }

    return {
      state: {
        ...state,
        branch: branchName,
        branches: state.branches.includes(branchName) ? state.branches : [...state.branches, branchName]
      },
      output: `Switched to a new branch '${branchName}'`,
      effect: {
        type: "switch"
      }
    };
  }

  const branchName = args[0];
  if (!branchName || !state.branches.includes(branchName)) {
    return {
      state,
      output: `fatal: invalid reference: ${branchName ?? ""}`.trim()
    };
  }

  return {
    state: { ...state, branch: branchName },
    output: `Switched to branch '${branchName}'`,
    effect: {
      type: "switch"
    }
  };
}

function pushCommits(state: GitState): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  const remoteHashes = new Set(state.remoteCommits.map((commit) => commit.hash));
  const commitsToPush = state.commits.filter((commit) => !remoteHashes.has(commit.hash));

  if (commitsToPush.length === 0) {
    return {
      state,
      output: "Everything up-to-date"
    };
  }

  return {
    state: {
      ...state,
      remoteCommits: state.commits.map((commit) => ({ ...commit, files: [...commit.files] }))
    },
    output: `pushed ${commitsToPush.length} ${pluralize("commit", commitsToPush.length)} to origin/${state.branch}`,
    effect: {
      type: "push",
      from: "local",
      to: "remote"
    }
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

function wasCommitted(state: GitState, filePath: string): boolean {
  return state.commits.some((commit) => commit.files.includes(filePath));
}

function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}
