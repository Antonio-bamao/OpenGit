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
        "已载入发布场景，main 上已经有一个稳定提交。先切出 release 分支，再打标签并推送 tags。",
        "发布管理场景已就绪",
        "这里重点观察 release 分支、标签和远端标签如何一起定义一个明确的发布节点。"
      )
    ],
    initialCommand: "git branch release"
  };
}

export function getScenarioPreset(scenarioId?: string): ScenarioPreset {
  if (scenarioId === "team-collab") {
    return createTeamCollaborationPreset();
  }

  if (scenarioId === "version-rollback") {
    return createVersionRollbackPreset();
  }

  if (scenarioId === "release-management") {
    return createReleaseManagementPreset();
  }

  return createSoloProjectPreset();
}
