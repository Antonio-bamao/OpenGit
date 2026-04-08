import { describe, expect, it } from "vitest";
import { createInitialGitState, executeGitCommand } from "./git-simulator";
import { buildPlaygroundViewModel } from "./playground-view-model";

describe("buildPlaygroundViewModel", () => {
  it("derives flow items, task progress, and refs from git state", () => {
    let state = createInitialGitState();
    state = executeGitCommand(state, "git init").state;
    const addResult = executeGitCommand(state, "git add README.md");
    state = addResult.state;

    let viewModel = buildPlaygroundViewModel(state, addResult.effect);

    expect(viewModel.zoneCounts).toEqual({
      working: 2,
      staging: 1,
      local: 0,
      remote: 0
    });
    expect(viewModel.flowItems.staging.map((item) => item.label)).toEqual(["README.md"]);
    expect(viewModel.isFlowActive("working", "staging")).toBe(true);
    expect(viewModel.activeTask?.command).toBe('git commit -m "first commit"');
    expect(viewModel.headCommit).toBe("no commits");
    expect(viewModel.remoteHead).toBe("not pushed");

    state = executeGitCommand(state, 'git commit -m "first commit"').state;
    state = executeGitCommand(state, "git switch -c feature/flow").state;
    const pushResult = executeGitCommand(state, "git push");
    viewModel = buildPlaygroundViewModel(pushResult.state, pushResult.effect);

    expect(viewModel.flowItems.local[0]?.label).toBe("c000001");
    expect(viewModel.flowItems.remote[0]?.label).toBe("c000001");
    expect(viewModel.isFlowActive("local", "remote")).toBe(true);
    expect(viewModel.learningChecklist.every((item) => item.completed)).toBe(true);
    expect(viewModel.headCommit).toBe("c000001");
    expect(viewModel.remoteHead).toBe("c000001");
  });
});
