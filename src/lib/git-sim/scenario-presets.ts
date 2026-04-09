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

export function getScenarioPreset(scenarioId?: string): ScenarioPreset {
  if (scenarioId === "team-collab") {
    return createTeamCollaborationPreset();
  }

  return createSoloProjectPreset();
}
