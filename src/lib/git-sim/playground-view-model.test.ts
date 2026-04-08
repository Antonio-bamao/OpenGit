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
    expect(viewModel.learningScenario.title).toBe("从零开始个人项目");
    expect(viewModel.learningScenario.progressLabel).toBe("2/5");
    expect(viewModel.headCommit).toBe("no commits");
    expect(viewModel.remoteHead).toBe("not pushed");
    expect(viewModel.syncStatus.summary).toBe("no remote");

    state = executeGitCommand(state, 'git commit -m "first commit"').state;
    state = executeGitCommand(state, "git switch -c feature/flow").state;
    const pushResult = executeGitCommand(state, "git push");
    viewModel = buildPlaygroundViewModel(pushResult.state, pushResult.effect);

    expect(viewModel.flowItems.local[0]?.label).toBe("c000001");
    expect(viewModel.flowItems.remote[0]?.label).toBe("c000001");
    expect(viewModel.isFlowActive("local", "remote")).toBe(true);
    expect(viewModel.learningChecklist.every((item) => item.completed)).toBe(true);
    expect(viewModel.learningScenario.isComplete).toBe(true);
    expect(viewModel.headCommit).toBe("c000001");
    expect(viewModel.remoteHead).toBe("c000001");
    expect(viewModel.syncStatus).toMatchObject({
      branchLabel: "feature/flow ↔ origin/feature/flow",
      ahead: 0,
      behind: 0,
      summary: "up to date"
    });
  });

  it("derives ahead and behind counts for the current branch", () => {
    let state = createInitialGitState();
    state = executeGitCommand(state, "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "base"').state;
    state = executeGitCommand(state, "git push").state;

    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "local work"').state;

    let viewModel = buildPlaygroundViewModel(state);
    expect(viewModel.syncStatus.ahead).toBe(1);
    expect(viewModel.syncStatus.behind).toBe(0);
    expect(viewModel.syncStatus.summary).toBe("ahead 1");

    const remoteCommit = {
      hash: "c000003",
      message: "remote work",
      files: ["README.md"],
      branch: "main",
      parentHash: "c000001"
    };
    state = {
      ...state,
      remoteCommits: [remoteCommit, ...state.remoteCommits],
      remoteBranchHeads: {
        ...state.remoteBranchHeads,
        main: remoteCommit.hash
      }
    };

    viewModel = buildPlaygroundViewModel(state);
    expect(viewModel.syncStatus.ahead).toBe(1);
    expect(viewModel.syncStatus.behind).toBe(1);
    expect(viewModel.syncStatus.summary).toBe("ahead 1 / behind 1");
  });
});
