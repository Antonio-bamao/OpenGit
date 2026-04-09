import { describe, expect, it } from "vitest";
import { createInitialGitState, executeGitCommand } from "./git-simulator";
import {
  getConflictResolutionScenario,
  getActiveLearningScenario,
  getLearningChecklist,
  getLearningScenario,
  getSoloProjectScenario,
  getTeamCollaborationScenario,
  getWorktreeParallelScenario
} from "./learning-guide";

describe("getLearningChecklist", () => {
  it("tracks the guided git workflow from init to push", () => {
    let state = createInitialGitState();

    let checklist = getLearningChecklist(state);
    expect(checklist.map((item) => item.completed)).toEqual([false, false, false, false, false]);
    expect(checklist[0]?.command).toBe("git init");

    state = executeGitCommand(state, "git init").state;
    checklist = getLearningChecklist(state);
    expect(checklist.map((item) => item.completed)).toEqual([true, false, false, false, false]);
    expect(checklist[1]?.command).toBe("git add .");

    state = executeGitCommand(state, "git add .").state;
    checklist = getLearningChecklist(state);
    expect(checklist.map((item) => item.completed)).toEqual([true, true, false, false, false]);
    expect(checklist[2]?.command).toBe('git commit -m "first commit"');

    state = executeGitCommand(state, 'git commit -m "first commit"').state;
    checklist = getLearningChecklist(state);
    expect(checklist.map((item) => item.completed)).toEqual([true, true, true, false, false]);
    expect(checklist[3]?.command).toBe("git switch -c feature/flow");

    state = executeGitCommand(state, "git switch -c feature/flow").state;
    state = executeGitCommand(state, "git push").state;
    checklist = getLearningChecklist(state);
    expect(checklist.map((item) => item.completed)).toEqual([true, true, true, true, true]);
  });

  it("describes the solo project scenario progress and success criteria", () => {
    let state = createInitialGitState();

    let scenario = getSoloProjectScenario(state);
    expect(scenario.id).toBe("solo-project");
    expect(scenario.title).toBe("从零开始个人项目");
    expect(scenario.objective).toContain("初始化仓库");
    expect(scenario.successCriteria).toContain("origin");
    expect(scenario.progressLabel).toBe("0/5");
    expect(scenario.activeTask?.command).toBe("git init");
    expect(scenario.isComplete).toBe(false);

    state = executeGitCommand(state, "git init").state;
    state = executeGitCommand(state, "git add .").state;
    state = executeGitCommand(state, 'git commit -m "first commit"').state;
    state = executeGitCommand(state, "git switch -c feature/flow").state;
    state = executeGitCommand(state, "git push").state;

    scenario = getSoloProjectScenario(state);
    expect(scenario.progressLabel).toBe("5/5");
    expect(scenario.activeTask).toBeUndefined();
    expect(scenario.isComplete).toBe(true);
  });

  it("describes the team collaboration scenario after cloning a repository", () => {
    let state = createInitialGitState();

    let scenario = getTeamCollaborationScenario(state);
    expect(scenario.progressLabel).toBe("0/4");
    expect(scenario.activeTask?.command).toBe("git clone https://github.com/opengit/example.git");

    state = executeGitCommand(state, "git clone https://github.com/opengit/example.git").state;
    scenario = getTeamCollaborationScenario(state);
    expect(scenario.id).toBe("team-collab");
    expect(scenario.title).toBe("加入团队项目");
    expect(scenario.progressLabel).toBe("1/4");
    expect(scenario.activeTask?.command).toBe("git switch -c feature/team-work");

    state = executeGitCommand(state, "git switch -c feature/team-work").state;
    state = executeGitCommand(state, "git add README.md").state;
    scenario = getTeamCollaborationScenario(state);
    expect(scenario.progressLabel).toBe("2/4");
    expect(scenario.activeTask?.command).toBe('git commit -m "team work"');

    state = executeGitCommand(state, 'git commit -m "team work"').state;
    scenario = getTeamCollaborationScenario(state);
    expect(scenario.progressLabel).toBe("3/4");
    expect(scenario.activeTask?.command).toBe("git push");

    state = executeGitCommand(state, "git push").state;
    scenario = getTeamCollaborationScenario(state);
    expect(scenario.progressLabel).toBe("4/4");
    expect(scenario.isComplete).toBe(true);
  });

  it("selects the team scenario once the state came from clone", () => {
    let state = createInitialGitState();
    expect(getActiveLearningScenario(state).id).toBe("solo-project");

    state = executeGitCommand(state, "git clone https://github.com/opengit/example.git").state;
    expect(getActiveLearningScenario(state).id).toBe("team-collab");
  });

  it("selects the release management scenario when requested explicitly", () => {
    let state = createInitialGitState();
    state = executeGitCommand(state, "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "release base"').state;

    const scenario = getLearningScenario(state, "release-management");

    expect(scenario.id).toBe("release-management");
    expect(scenario.title).toBe("发布管理");
    expect(scenario.activeTask?.command).toBe("git branch release");
  });

  it("describes the conflict-resolution scenario from pull conflict to resolution commit", () => {
    let state = executeGitCommand(
      createInitialGitState(),
      "git clone https://github.com/opengit/example.git"
    ).state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "local edit"').state;
    state = {
      ...state,
      remoteCommits: [
        {
          hash: "c000003",
          message: "teammate edit",
          files: ["README.md"],
          branch: "main",
          parentHash: "c000001"
        },
        ...state.remoteCommits
      ],
      remoteBranchHeads: {
        ...state.remoteBranchHeads,
        main: "c000003"
      }
    };

    let scenario = getConflictResolutionScenario(state);
    expect(scenario.progressLabel).toBe("0/4");
    expect(scenario.activeTask?.command).toBe("git pull");

    state = executeGitCommand(state, "git pull").state;
    scenario = getConflictResolutionScenario(state);
    expect(scenario.progressLabel).toBe("1/4");
    expect(scenario.activeTask?.command).toBe("git status");

    state = executeGitCommand(state, "git status").state;
    scenario = getConflictResolutionScenario(state);
    expect(scenario.progressLabel).toBe("2/4");
    expect(scenario.activeTask?.command).toBe("git add README.md");

    state = executeGitCommand(state, "git add README.md").state;
    scenario = getConflictResolutionScenario(state);
    expect(scenario.progressLabel).toBe("3/4");
    expect(scenario.activeTask?.command).toBe('git commit -m "resolve conflict"');

    state = executeGitCommand(state, 'git commit -m "resolve conflict"').state;
    scenario = getConflictResolutionScenario(state);
    expect(scenario.progressLabel).toBe("4/4");
    expect(scenario.isComplete).toBe(true);
  });

  it("selects the conflict-resolution scenario when requested explicitly", () => {
    let state = executeGitCommand(
      createInitialGitState(),
      "git clone https://github.com/opengit/example.git"
    ).state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "local edit"').state;

    const scenario = getLearningScenario(state, "conflict-resolution");

    expect(scenario.id).toBe("conflict-resolution");
    expect(scenario.title).toBe("处理冲突");
    expect(scenario.activeTask?.command).toBe("git pull");
  });

  it("describes the worktree parallel scenario progress around creating and cleaning linked trees", () => {
    let state = createInitialGitState();
    state = executeGitCommand(state, "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "main base"').state;
    state = executeGitCommand(state, "git switch -c feature/payment").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "feature progress"').state;

    let scenario = getWorktreeParallelScenario(state);
    expect(scenario.progressLabel).toBe("0/4");
    expect(scenario.activeTask?.command).toBe("git worktree add ../hotfix main");

    state = executeGitCommand(state, "git worktree add ../hotfix main").state;
    scenario = getWorktreeParallelScenario(state);
    expect(scenario.progressLabel).toBe("1/4");
    expect(scenario.activeTask?.command).toBe("git worktree list");

    state = executeGitCommand(state, "git worktree list").state;
    scenario = getWorktreeParallelScenario(state);
    expect(scenario.progressLabel).toBe("2/4");
    expect(scenario.activeTask?.command).toBe("git status");

    state = executeGitCommand(state, "git status").state;
    scenario = getWorktreeParallelScenario(state);
    expect(scenario.progressLabel).toBe("3/4");
    expect(scenario.activeTask?.command).toBe("git worktree remove ../hotfix");

    state = executeGitCommand(state, "git worktree remove ../hotfix").state;
    scenario = getWorktreeParallelScenario(state);
    expect(scenario.progressLabel).toBe("4/4");
    expect(scenario.isComplete).toBe(true);
  });

  it("selects the worktree scenario when requested explicitly", () => {
    let state = createInitialGitState();
    state = executeGitCommand(state, "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "main base"').state;
    state = executeGitCommand(state, "git switch -c feature/payment").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "feature progress"').state;

    const scenario = getLearningScenario(state, "worktree-parallel");

    expect(scenario.id).toBe("worktree-parallel");
    expect(scenario.title).toBe("Worktree 多分支并行开发");
    expect(scenario.activeTask?.command).toBe("git worktree add ../hotfix main");
  });
});
