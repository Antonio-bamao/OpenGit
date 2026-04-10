import { createInitialGitState, executeGitCommand } from "./git-simulator";
import type { CommandResult, GitState } from "./types";

export interface ScenarioPreset {
  gitState: GitState;
  history: CommandResult[];
  initialCommand: string;
}

function createScenarioEntry(
  gitState: GitState,
  output: string,
  title: string,
  body: string
): CommandResult {
  return {
    state: gitState,
    output,
    hint: {
      title,
      body
    }
  };
}

function createSoloProjectPreset(): ScenarioPreset {
  const gitState = createInitialGitState();

  return {
    gitState,
    history: [
      createScenarioEntry(
        gitState,
        "已载入个人项目场景，从空白目录开始。先试试 git init。",
        "个人项目场景已就绪",
        "你会从零开始建立仓库、提交第一批文件，再把分支推到 origin。"
      )
    ],
    initialCommand: "git init"
  };
}

function createTeamCollaborationPreset(): ScenarioPreset {
  const cloneResult = executeGitCommand(
    createInitialGitState(),
    "git clone https://github.com/opengit/example.git"
  );

  return {
    gitState: cloneResult.state,
    history: [
      createScenarioEntry(
        cloneResult.state,
        "已载入团队仓库场景，origin/main 已经 clone 完成。下一步创建 feature 分支。",
        "团队仓库场景已就绪",
        "这里直接从协作仓库开始，让你把注意力放在分支协作、提交和 push 上。"
      )
    ],
    initialCommand: "git switch -c feature/team-work"
  };
}

function createVersionRollbackPreset(): ScenarioPreset {
  let gitState = executeGitCommand(createInitialGitState(), "git init").state;
  gitState = executeGitCommand(gitState, "git add README.md").state;
  gitState = executeGitCommand(gitState, 'git commit -m "base"').state;
  gitState = executeGitCommand(gitState, "git add README.md").state;
  gitState = executeGitCommand(gitState, 'git commit -m "broken change"').state;

  return {
    gitState,
    history: [
      createScenarioEntry(
        gitState,
        "已载入回退场景，最新一条提交是错误改动。先用 git revert HEAD 生成一条修复提交，再对比 git reset 的效果。",
        "版本回退场景已就绪",
        "这里提前准备好了两条提交历史，让你专注观察 reset 和 revert 对 HEAD、历史和工作区的不同影响。"
      )
    ],
    initialCommand: "git revert HEAD"
  };
}

function createConflictResolutionPreset(): ScenarioPreset {
  let gitState = executeGitCommand(
    createInitialGitState(),
    "git clone https://github.com/opengit/example.git"
  ).state;
  gitState = executeGitCommand(gitState, "git add README.md").state;
  gitState = executeGitCommand(gitState, 'git commit -m "local edit"').state;

  const remoteCommit = {
    hash: "c000003",
    message: "teammate edit",
    files: ["README.md"],
    branch: "main",
    parentHash: "c000001"
  };

  gitState = {
    ...gitState,
    remoteCommits: [remoteCommit, ...gitState.remoteCommits],
    remoteBranchHeads: {
      ...gitState.remoteBranchHeads,
      main: remoteCommit.hash
    }
  };

  return {
    gitState,
    history: [
      createScenarioEntry(
        gitState,
        "已载入冲突场景：你本地和 teammate 都改了 README.md。先执行 git pull 把 unmerged paths 拉到台面上，再用 status、add、commit 完成这次人工合并。",
        "冲突场景已就绪",
        "这里提前准备好了同一文件上的本地与远端分叉，让你专注观察 unmerged paths、git add 的“标记已解决”含义，以及最后那条收尾提交。"
      )
    ],
    initialCommand: "git pull"
  };
}

function createReleaseManagementPreset(): ScenarioPreset {
  let gitState = executeGitCommand(createInitialGitState(), "git init").state;
  gitState = executeGitCommand(gitState, "git add README.md").state;
  gitState = executeGitCommand(gitState, 'git commit -m "release base"').state;
  gitState = executeGitCommand(gitState, "git push").state;

  return {
    gitState,
    history: [
      createScenarioEntry(
        gitState,
        "已载入发布场景，main 上已经有一个稳定提交。先切出 release 分支，再给当前提交打上 v1.0.0，并把 tags 推到远端。",
        "发布管理场景已就绪",
        "这里重点观察 release 分支如何负责发布收口，tag 如何给提交命名，以及 origin/tags 为什么能成为远端发布坐标。"
      )
    ],
    initialCommand: "git branch release"
  };
}

function createWorktreeParallelPreset(): ScenarioPreset {
  let gitState = executeGitCommand(createInitialGitState(), "git init").state;
  gitState = executeGitCommand(gitState, "git add README.md").state;
  gitState = executeGitCommand(gitState, 'git commit -m "main base"').state;
  gitState = executeGitCommand(gitState, "git switch -c feature/payment").state;
  gitState = executeGitCommand(gitState, "git add README.md").state;
  gitState = executeGitCommand(gitState, 'git commit -m "feature progress"').state;

  return {
    gitState,
    history: [
      createScenarioEntry(
        gitState,
        "已载入 worktree 场景，你当前停在 feature/payment。下一步用 git worktree add ../hotfix main 拉出独立 hotfix 目录，同时保持当前开发线不被切走。",
        "Worktree 场景已就绪",
        "这里提前准备了一条进行中的 feature 分支，让你观察 ../hotfix -> main 和当前 feature/payment 如何并行存在，以及为什么 worktree 比来回 stash / checkout 更稳。"
      )
    ],
    initialCommand: "git worktree add ../hotfix main"
  };
}

export function getScenarioPreset(scenarioId?: string): ScenarioPreset {
  if (scenarioId === "team-collab") {
    return createTeamCollaborationPreset();
  }

  if (scenarioId === "conflict-resolution") {
    return createConflictResolutionPreset();
  }

  if (scenarioId === "version-rollback") {
    return createVersionRollbackPreset();
  }

  if (scenarioId === "release-management") {
    return createReleaseManagementPreset();
  }

  if (scenarioId === "worktree-parallel") {
    return createWorktreeParallelPreset();
  }

  return createSoloProjectPreset();
}
