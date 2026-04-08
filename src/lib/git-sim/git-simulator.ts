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
    branchHeads: { main: null },
    head: null,
    files: initialFiles.map((file) => ({ ...file })),
    commits: [],
    remoteCommits: [],
    remoteBranchHeads: {}
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
      return handleBranchCommand(state, command.args);
    case "switch":
      return switchBranch(state, command.args);
    case "checkout":
      return switchBranch(state, command.args);
    case "push":
      return pushCommits(state);
    default:
      return {
        state,
        output: `git: '${command.name}' is not a git command. See 'git --help'.`,
        hint: {
          title: "为什么报错",
          body: "OpenGit MVP 目前覆盖 init、status、add、commit、log、diff、restore、reset、branch、switch、checkout 和 push。后续会逐步扩展更多 Git 命令。"
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
    files: staged.map((file) => file.path),
    branch: state.branch,
    parentHash: state.head
  };
  const files = state.files.map((file) =>
    file.status === "staged" ? { ...file, status: "tracked" as const } : file
  );

  return {
    state: {
      ...state,
      head: hash,
      files,
      branchHeads: {
        ...state.branchHeads,
        [state.branch]: hash
      },
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

  const commits = getReachableCommits(state);

  if (commits.length === 0) {
    return {
      state,
      output: `fatal: your current branch '${state.branch}' does not have any commits yet`
    };
  }

  return {
    state,
    output: commits
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

function handleBranchCommand(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  if (args.length === 0) {
    return listBranches(state);
  }

  if (args[0] === "-d" || args[0] === "--delete") {
    return deleteBranch(state, args[1]);
  }

  return createBranch(state, args[0], false);
}

function listBranches(state: GitState): CommandResult {
  return {
    state,
    output: state.branches.map((branch) => `${branch === state.branch ? "*" : " "} ${branch}`).join("\n")
  };
}

function createBranch(state: GitState, branchName: string | undefined, shouldSwitch: boolean): CommandResult {
  if (!branchName) {
    return {
      state,
      output: "fatal: branch name required"
    };
  }

  if (state.branches.includes(branchName)) {
    return {
      state,
      output: `fatal: a branch named '${branchName}' already exists`
    };
  }

  return {
    state: {
      ...state,
      branch: shouldSwitch ? branchName : state.branch,
      branches: [...state.branches, branchName],
      branchHeads: {
        ...state.branchHeads,
        [branchName]: state.head
      }
    },
    output: shouldSwitch ? `Switched to a new branch '${branchName}'` : `Created branch '${branchName}'`,
    effect: shouldSwitch
      ? {
          type: "switch"
        }
      : undefined
  };
}

function deleteBranch(state: GitState, branchName: string | undefined): CommandResult {
  if (!branchName) {
    return {
      state,
      output: "fatal: branch name required"
    };
  }

  if (branchName === state.branch) {
    return {
      state,
      output: `error: cannot delete branch '${branchName}' checked out at '/open-git'`
    };
  }

  if (!state.branches.includes(branchName)) {
    return {
      state,
      output: `error: branch '${branchName}' not found.`
    };
  }

  const { [branchName]: _deletedHead, ...branchHeads } = state.branchHeads;
  const { [branchName]: _deletedRemoteHead, ...remoteBranchHeads } = state.remoteBranchHeads;

  return {
    state: {
      ...state,
      branches: state.branches.filter((branch) => branch !== branchName),
      branchHeads,
      remoteBranchHeads
    },
    output: `Deleted branch ${branchName}.`
  };
}

function switchBranch(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  if (args[0] === "-c" || args[0] === "-b") {
    return createBranch(state, args[1], true);
  }

  const branchName = args[0];
  if (!branchName || !state.branches.includes(branchName)) {
    return {
      state,
      output: `fatal: invalid reference: ${branchName ?? ""}`.trim()
    };
  }

  return {
    state: { ...state, branch: branchName, head: state.branchHeads[branchName] ?? null },
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

  const localCommits = getReachableCommits(state);
  const remoteHashes = new Set(state.remoteCommits.map((commit) => commit.hash));
  const commitsToPush = localCommits.filter((commit) => !remoteHashes.has(commit.hash));

  if (commitsToPush.length === 0) {
    return {
      state,
      output: "Everything up-to-date"
    };
  }

  return {
    state: {
      ...state,
      remoteCommits: dedupeCommits([
        ...localCommits.map((commit) => ({ ...commit, files: [...commit.files] })),
        ...state.remoteCommits
      ]),
      remoteBranchHeads: {
        ...state.remoteBranchHeads,
        [state.branch]: state.head
      }
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

function getReachableCommits(state: GitState): GitCommit[] {
  const commitsByHash = new Map(state.commits.map((commit) => [commit.hash, commit]));
  const commits: GitCommit[] = [];
  let cursor = state.head;

  while (cursor) {
    const commit = commitsByHash.get(cursor);
    if (!commit) {
      break;
    }

    commits.push(commit);
    cursor = commit.parentHash;
  }

  return commits;
}

function dedupeCommits(commits: GitCommit[]): GitCommit[] {
  const seen = new Set<string>();

  return commits.filter((commit) => {
    if (seen.has(commit.hash)) {
      return false;
    }

    seen.add(commit.hash);
    return true;
  });
}
