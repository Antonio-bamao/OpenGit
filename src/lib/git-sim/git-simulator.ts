import { parseGitCommand } from "./command-parser";
import type { CommandResult, GitCommit, GitFile, GitState, GitWorktree } from "./types";

const MAIN_WORKTREE_PATH = "/open-git";

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
    tags: {},
    head: null,
    files: initialFiles.map((file) => ({ ...file })),
    commits: [],
    remoteCommits: [],
    remoteBranchHeads: {},
    remoteTags: {},
    worktrees: [],
    worktreeAdded: false,
    worktreeListInspected: false,
    worktreeStatusChecked: false,
    conflictFiles: [],
    conflictDetected: false,
    conflictResolved: false,
    conflictStatusChecked: false,
    mergeTargetHash: null
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
    case "clone":
      return cloneRepository(state, command.args);
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
      return handleResetCommand(state, command.args);
    case "revert":
      return revertCommit(state, command.args);
    case "branch":
      return handleBranchCommand(state, command.args);
    case "tag":
      return handleTagCommand(state, command.args);
    case "worktree":
      return handleWorktreeCommand(state, command.args);
    case "switch":
      return switchBranch(state, command.args);
    case "checkout":
      return switchBranch(state, command.args);
    case "remote":
      return showRemote(state, command.args);
    case "push":
      return pushCommits(state, command.args);
    case "fetch":
      return fetchCommits(state);
    case "pull":
      return pullCommits(state);
    default:
      return {
        state,
        output: `git: '${command.name}' is not a git command. See 'git --help'.`,
        hint: {
          title: "为什么报错",
          body: "OpenGit MVP 目前覆盖 clone、init、status、add、commit、log、diff、restore、reset、revert、branch、tag、worktree、switch、checkout、remote、push、fetch 和 pull。后续会逐步扩展更多 Git 命令。"
        }
      };
  }
}

function cloneRepository(state: GitState, args: string[]): CommandResult {
  const remoteUrl = args[0];
  if (!remoteUrl) {
    return {
      state,
      output: "fatal: You must specify a repository to clone."
    };
  }

  if (state.initialized) {
    return {
      state,
      output: "fatal: destination path '/open-git' already exists and is not an empty directory."
    };
  }

  const repositoryName = getRepositoryName(remoteUrl);
  const commit: GitCommit = {
    hash: "c000001",
    message: `Clone from ${remoteUrl}`,
    files: initialFiles.map((file) => file.path),
    branch: "main",
    parentHash: null
  };

  return {
    state: {
      initialized: true,
      branch: "main",
      branches: ["main"],
      branchHeads: { main: commit.hash },
      tags: {},
      head: commit.hash,
      files: initialFiles.map((file) => ({ ...file, status: "tracked" as const })),
      commits: [commit],
      remoteCommits: [{ ...commit, files: [...commit.files] }],
      remoteBranchHeads: { main: commit.hash },
      remoteTags: {},
      worktrees: [],
      worktreeAdded: false,
      worktreeListInspected: false,
      worktreeStatusChecked: false,
      conflictFiles: [],
      conflictDetected: false,
      conflictResolved: false,
      conflictStatusChecked: false,
      mergeTargetHash: null
    },
    output: `Cloning into '${repositoryName}'...\nremote: Enumerating objects: 3, done.\nReceiving objects: 100% (3/3), done.`,
    effect: {
      type: "clone",
      from: "remote",
      to: "local",
      filePaths: commit.files
    }
  };
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

  const nextState = {
    ...state,
    worktreeStatusChecked: state.worktrees.length > 0 ? true : state.worktreeStatusChecked,
    conflictStatusChecked: state.conflictDetected ? true : state.conflictStatusChecked
  };

  if (nextState.conflictFiles.length > 0) {
    return {
      state: nextState,
      output: [
        `On branch ${nextState.branch}`,
        "You have unmerged paths.",
        '  (fix conflicts and run "git commit")',
        "",
        "Unmerged paths:",
        ...nextState.conflictFiles.map((filePath) => `  both modified:   ${filePath}`)
      ].join("\n")
    };
  }

  if (nextState.mergeTargetHash) {
    return {
      state: nextState,
      output: [
        `On branch ${nextState.branch}`,
        "All conflicts fixed but you are still merging.",
        '  (use "git commit" to conclude merge)'
      ].join("\n")
    };
  }

  const staged = nextState.files.filter((file) => file.status === "staged");
  const untracked = nextState.files.filter((file) => file.status === "untracked");
  const modified = nextState.files.filter((file) => file.status === "modified");

  if (staged.length === 0 && untracked.length === 0 && modified.length === 0) {
    return {
      state: nextState,
      output: `On branch ${nextState.branch}\nnothing to commit, working tree clean`
    };
  }

  return {
    state: nextState,
    output: [
      `On branch ${nextState.branch}`,
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
  const selectedConflictFiles = state.conflictFiles.filter((filePath) => target === "." || target === filePath);
  const remainingConflictFiles = state.conflictFiles.filter((filePath) => !selectedConflictFiles.includes(filePath));
  const files = state.files.map((file) => {
    if (target === "." || target === file.path) {
      return { ...file, status: "staged" as const };
    }
    return file;
  });

  const stagedCount = selectedFiles.length;

  return {
    state: {
      ...state,
      files,
      conflictFiles: remainingConflictFiles,
      conflictResolved: state.conflictResolved || (state.conflictDetected && remainingConflictFiles.length === 0)
    },
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

  if (state.conflictFiles.length > 0) {
    return {
      state,
      output: "error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add <file>' as appropriate to mark resolution."
    };
  }

  const staged = state.files.filter((file) => file.status === "staged");
  if (staged.length === 0) {
    return {
      state,
      output: "nothing to commit, working tree clean"
    };
  }

  const message = getCommitMessage(args);
  const hash = createCommitHash(getNextCommitSeed(state));
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
      commits: [commit, ...state.commits],
      mergeTargetHash: null
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

function handleResetCommand(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  const resetMode = args.includes("--hard")
    ? "hard"
    : args.includes("--soft")
      ? "soft"
      : args.includes("--mixed")
        ? "mixed"
        : null;
  const targetArg = args.find((arg) => !arg.startsWith("--"));

  if (resetMode || targetArg) {
    return resetCommitPointer(state, targetArg ?? "HEAD", resetMode ?? "mixed");
  }

  return resetStaging(state);
}

function resetStaging(state: GitState): CommandResult {
  return unstageFiles(state, ".");
}

function resetCommitPointer(
  state: GitState,
  target: string,
  mode: "soft" | "mixed" | "hard"
): CommandResult {
  const targetCommit = resolveCommitTarget(state, target);

  if (!targetCommit) {
    return {
      state,
      output: `fatal: ambiguous argument '${target}': unknown revision or path not in the working tree.`
    };
  }

  const currentCommit = state.commits.find((commit) => commit.hash === state.head);
  const affectedPaths = new Set(currentCommit?.files ?? []);
  const files = state.files.map((file) => {
    if (!affectedPaths.has(file.path)) {
      return file;
    }

    if (mode === "soft") {
      return { ...file, status: "staged" as const };
    }

    if (mode === "mixed") {
      return { ...file, status: "modified" as const };
    }

    return {
      ...file,
      status: wasCommittedFrom(state, targetCommit.hash, file.path) ? ("tracked" as const) : ("untracked" as const)
    };
  });

  return {
    state: {
      ...state,
      head: targetCommit.hash,
      files,
      branchHeads: {
        ...state.branchHeads,
        [state.branch]: targetCommit.hash
      }
    },
    output: `HEAD is now at ${targetCommit.hash} ${targetCommit.message}`,
    effect: {
      type: "reset",
      from: "local",
      to: mode === "soft" ? "staging" : "working",
      filePaths: Array.from(affectedPaths)
    }
  };
}

function revertCommit(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  const targetCommit = resolveCommitTarget(state, args[0] ?? "HEAD");
  if (!targetCommit) {
    return {
      state,
      output: `fatal: bad revision '${args[0] ?? "HEAD"}'`
    };
  }

  const hash = createCommitHash(getNextCommitSeed(state));
  const message = `Revert "${targetCommit.message}"`;
  const commit: GitCommit = {
    hash,
    message,
    files: [...targetCommit.files],
    branch: state.branch,
    parentHash: state.head
  };

  return {
    state: {
      ...state,
      head: hash,
      files: state.files.map((file) =>
        targetCommit.files.includes(file.path) ? { ...file, status: "tracked" as const } : file
      ),
      branchHeads: {
        ...state.branchHeads,
        [state.branch]: hash
      },
      commits: [commit, ...state.commits]
    },
    output: `[${state.branch} ${hash}] ${message}\n ${targetCommit.files.length} ${pluralize("file", targetCommit.files.length)} changed`,
    effect: {
      type: "revert",
      from: "local",
      to: "local",
      filePaths: [...targetCommit.files]
    }
  };
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

function handleTagCommand(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  if (args.length === 0) {
    return {
      state,
      output: Object.keys(state.tags).sort().join("\n")
    };
  }

  if (args[0] === "-d" || args[0] === "--delete") {
    const tagName = args[1];
    if (!tagName || !state.tags[tagName]) {
      return {
        state,
        output: `error: tag '${tagName ?? ""}' not found.`
      };
    }

    const { [tagName]: _deleted, ...tags } = state.tags;

    return {
      state: { ...state, tags },
      output: `Deleted tag '${tagName}'.`
    };
  }

  const tagName = args[0];
  if (!tagName) {
    return {
      state,
      output: "fatal: tag name required"
    };
  }

  if (!state.head) {
    return {
      state,
      output: "fatal: Failed to resolve 'HEAD' as a valid ref."
    };
  }

  if (state.tags[tagName]) {
    return {
      state,
      output: `fatal: tag '${tagName}' already exists`
    };
  }

  return {
    state: {
      ...state,
      tags: {
        ...state.tags,
        [tagName]: state.head
      }
    },
    output: `Created tag '${tagName}' at ${state.head}`,
    effect: {
      type: "tag",
      from: "local",
      to: "local"
    }
  };
}

function handleWorktreeCommand(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  const subcommand = args[0];

  if (subcommand === "add") {
    return addWorktree(state, args.slice(1));
  }

  if (subcommand === "list") {
    return listWorktrees(state);
  }

  if (subcommand === "remove") {
    return removeWorktree(state, args.slice(1));
  }

  return {
    state,
    output: "OpenGit MVP currently supports `git worktree add <path> <branch>`, `git worktree list`, and `git worktree remove <path>`."
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

  const branchOwner = findLinkedWorktreeByBranch(state, branchName);
  if (branchOwner) {
    return {
      state,
      output: `fatal: '${branchName}' is already checked out at '${branchOwner.path}'`
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

function pushCommits(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  if (args.includes("--tags")) {
    const tagsToPush = Object.entries(state.tags).filter(([tagName, hash]) => state.remoteTags[tagName] !== hash);

    if (tagsToPush.length === 0) {
      return {
        state,
        output: "Everything up-to-date"
      };
    }

    return {
      state: {
        ...state,
        remoteTags: {
          ...state.remoteTags,
          ...Object.fromEntries(tagsToPush)
        }
      },
      output: `pushed ${tagsToPush.length} ${pluralize("tag", tagsToPush.length)} to origin`,
      effect: {
        type: "push",
        from: "local",
        to: "remote"
      }
    };
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
      },
      remoteTags: {
        ...state.remoteTags
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

function showRemote(state: GitState, args: string[]): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  if (args.includes("-v") || args.includes("--verbose")) {
    return {
      state,
      output: "origin\t/open-git/origin.git (fetch)\norigin\t/open-git/origin.git (push)"
    };
  }

  return {
    state,
    output: "origin"
  };
}

function fetchCommits(state: GitState): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  if (Object.keys(state.remoteBranchHeads).length === 0) {
    return {
      state,
      output: "From /open-git/origin\n * [up to date]      main       -> origin/main",
      effect: {
        type: "fetch",
        from: "remote",
        to: "local"
      }
    };
  }

  return {
    state,
    output: [
      "From /open-git/origin",
      ...Object.entries(state.remoteBranchHeads).map(
        ([branch, hash]) => ` * [new ref]         ${hash ?? "empty"} -> origin/${branch}`
      )
    ].join("\n"),
    effect: {
      type: "fetch",
      from: "remote",
      to: "local"
    }
  };
}

function pullCommits(state: GitState): CommandResult {
  if (!state.initialized) {
    return notARepository(state);
  }

  const remoteHead = state.remoteBranchHeads[state.branch];
  if (!remoteHead || remoteHead === state.head) {
    return {
      state,
      output: "Already up to date.",
      effect: {
        type: "fetch",
        from: "remote",
        to: "local"
      }
    };
  }

  const remoteCommit = state.remoteCommits.find((commit) => commit.hash === remoteHead);
  if (!remoteCommit) {
    return {
      state,
      output: `fatal: origin/${state.branch} points to an unknown commit in this simulation`
    };
  }

  const conflictPaths = getPullConflictPaths(state, remoteCommit);
  if (conflictPaths.length > 0) {
    return {
      state: {
        ...state,
        files: state.files.map((file) =>
          conflictPaths.includes(file.path) ? { ...file, status: "conflicted" as const } : file
        ),
        conflictFiles: conflictPaths,
        conflictDetected: true,
        conflictResolved: false,
        conflictStatusChecked: false,
        mergeTargetHash: remoteHead
      },
      output: [
        "From /open-git/origin",
        `Auto-merging ${conflictPaths[0]}`,
        `CONFLICT (content): Merge conflict in ${conflictPaths[0]}`,
        "Automatic merge failed; fix conflicts and then commit the result."
      ].join("\n"),
      effect: {
        type: "pull",
        from: "remote",
        to: "local",
        filePaths: conflictPaths
      }
    };
  }

  if (remoteCommit.parentHash !== state.head) {
    return {
      state,
      output: "fatal: non-fast-forward pull is not simulated yet. Try a branch with a linear remote update."
    };
  }

  const commits = dedupeCommits([{ ...remoteCommit, files: [...remoteCommit.files] }, ...state.commits]);

  return {
    state: {
      ...state,
      head: remoteHead,
      branchHeads: {
        ...state.branchHeads,
        [state.branch]: remoteHead
      },
      commits
    },
    output: `From /open-git/origin\nFast-forward ${state.head}..${remoteHead}\n ${remoteCommit.files.length} ${pluralize("file", remoteCommit.files.length)} changed`,
    effect: {
      type: "pull",
      from: "remote",
      to: "local",
      filePaths: remoteCommit.files
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

function getNextCommitSeed(state: GitState): number {
  const hashes = [...state.commits, ...state.remoteCommits]
    .map((commit) => Number.parseInt(commit.hash.slice(1), 10))
    .filter((hash) => Number.isFinite(hash));

  const maxHash = hashes.length > 0 ? Math.max(...hashes) : 0;
  return maxHash + 1;
}

function getRepositoryName(remoteUrl: string): string {
  const segments = remoteUrl.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "repository";
  return lastSegment.endsWith(".git") ? lastSegment.slice(0, -4) : lastSegment;
}

function wasCommitted(state: GitState, filePath: string): boolean {
  return state.commits.some((commit) => commit.files.includes(filePath));
}

function wasCommittedFrom(state: GitState, startHash: string, filePath: string): boolean {
  const commitsByHash = new Map(state.commits.map((commit) => [commit.hash, commit]));
  let cursor: string | null = startHash;

  while (cursor) {
    const commit = commitsByHash.get(cursor);
    if (!commit) {
      break;
    }

    if (commit.files.includes(filePath)) {
      return true;
    }

    cursor = commit.parentHash;
  }

  return false;
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

function resolveCommitTarget(state: GitState, target: string): GitCommit | undefined {
  if (target === "HEAD") {
    return state.commits.find((commit) => commit.hash === state.head);
  }

  if (target === "HEAD~1" || target === "HEAD^") {
    const currentCommit = state.commits.find((commit) => commit.hash === state.head);
    return currentCommit?.parentHash
      ? state.commits.find((commit) => commit.hash === currentCommit.parentHash)
      : undefined;
  }

  return state.commits.find((commit) => commit.hash === target);
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

function addWorktree(state: GitState, args: string[]): CommandResult {
  const path = args[0];
  const branchName = args[1];

  if (!path) {
    return {
      state,
      output: "fatal: path required"
    };
  }

  if (!branchName) {
    return {
      state,
      output: "fatal: branch name required"
    };
  }

  if (!state.branches.includes(branchName)) {
    return {
      state,
      output: `fatal: invalid reference: ${branchName}`
    };
  }

  if (path === MAIN_WORKTREE_PATH || state.worktrees.some((worktree) => worktree.path === path)) {
    return {
      state,
      output: `fatal: '${path}' is already registered as a worktree`
    };
  }

  const existingOwner =
    branchName === state.branch ? { path: MAIN_WORKTREE_PATH } : findLinkedWorktreeByBranch(state, branchName);

  if (existingOwner) {
    return {
      state,
      output: `fatal: '${branchName}' is already checked out at '${existingOwner.path}'`
    };
  }

  const head = state.branchHeads[branchName] ?? null;
  const commit = head ? state.commits.find((entry) => entry.hash === head) : undefined;
  const worktree: GitWorktree = {
    path,
    branch: branchName,
    head
  };

  return {
    state: {
      ...state,
      worktrees: [...state.worktrees, worktree],
      worktreeAdded: true,
      worktreeListInspected: false,
      worktreeStatusChecked: false
    },
    output: [
      `Preparing worktree (checking out '${branchName}')`,
      head ? `HEAD is now at ${head} ${commit?.message ?? branchName}` : `branch '${branchName}' has no commits yet`
    ].join("\n"),
    effect: {
      type: "worktree"
    }
  };
}

function listWorktrees(state: GitState): CommandResult {
  const lines = [
    formatWorktreeLine({
      path: MAIN_WORKTREE_PATH,
      branch: state.branch,
      head: state.head
    }),
    ...state.worktrees.map((worktree) => formatWorktreeLine(worktree))
  ];

  return {
    state: {
      ...state,
      worktreeListInspected: true
    },
    output: lines.join("\n")
  };
}

function removeWorktree(state: GitState, args: string[]): CommandResult {
  const path = args[0];

  if (!path) {
    return {
      state,
      output: "fatal: path required"
    };
  }

  const exists = state.worktrees.some((worktree) => worktree.path === path);
  if (!exists) {
    return {
      state,
      output: `fatal: '${path}' is not a working tree`
    };
  }

  return {
    state: {
      ...state,
      worktrees: state.worktrees.filter((worktree) => worktree.path !== path)
    },
    output: `Removed worktree '${path}'.`,
    effect: {
      type: "worktree"
    }
  };
}

function formatWorktreeLine(worktree: GitWorktree): string {
  return `${worktree.path} ${worktree.head ?? "empty"} [${worktree.branch}]`;
}

function findLinkedWorktreeByBranch(state: GitState, branchName: string): GitWorktree | undefined {
  return state.worktrees.find((worktree) => worktree.branch === branchName);
}

function getPullConflictPaths(state: GitState, remoteCommit: GitCommit): string[] {
  const currentCommit = state.commits.find((commit) => commit.hash === state.head);
  if (!currentCommit || !currentCommit.parentHash) {
    return [];
  }

  if (remoteCommit.parentHash !== currentCommit.parentHash) {
    return [];
  }

  const remoteFiles = new Set(remoteCommit.files);
  return currentCommit.files.filter((filePath) => remoteFiles.has(filePath));
}
