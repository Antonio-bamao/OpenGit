import { describe, expect, it } from "vitest";
import { createInitialGitState, executeGitCommand } from "./git-simulator";
import { getLearningChecklist, getSoloProjectScenario } from "./learning-guide";

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
});
