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
    expect(viewModel.activeTaskDoc).toMatchObject({
      id: "commit",
      detailHref: "/docs/commit",
      practiceScenario: {
        id: "solo-project"
      }
    });
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

  it("uses the team collaboration scenario after cloning", () => {
    let state = executeGitCommand(
      createInitialGitState(),
      "git clone https://github.com/opengit/example.git"
    ).state;

    let viewModel = buildPlaygroundViewModel(state);

    expect(viewModel.learningScenario.id).toBe("team-collab");
    expect(viewModel.activeTask?.command).toBe("git switch -c feature/team-work");
    expect(viewModel.syncStatus.summary).toBe("up to date");
    expect(viewModel.remoteRefs.map((ref) => ref.name)).toEqual(["origin/main"]);

    state = executeGitCommand(state, "git switch -c feature/team-work").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "team work"').state;
    state = executeGitCommand(state, "git push").state;

    viewModel = buildPlaygroundViewModel(state);

    expect(viewModel.remoteRefs).toEqual([
      { name: "origin/feature/team-work", branch: "feature/team-work", target: "c000002", isCurrentBranch: true },
      { name: "origin/main", branch: "main", target: "c000001", isCurrentBranch: false }
    ]);
  });

  it("uses an explicitly selected rollback scenario", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "base"').state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "broken change"').state;

    const viewModel = buildPlaygroundViewModel(state, undefined, "version-rollback");

    expect(viewModel.learningScenario.id).toBe("version-rollback");
    expect(viewModel.learningScenario.title).toBe("版本回退与修复");
    expect(viewModel.activeTask?.command).toBe("git revert HEAD");
    expect(viewModel.activeTaskDoc).toMatchObject({
      id: "revert",
      detailHref: "/docs/revert",
      practiceScenario: {
        id: "version-rollback"
      }
    });
  });

  it("uses an explicitly selected conflict scenario", () => {
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

    const viewModel = buildPlaygroundViewModel(state, undefined, "conflict-resolution");

    expect(viewModel.learningScenario.id).toBe("conflict-resolution");
    expect(viewModel.learningScenario.title).toBe("处理冲突");
    expect(viewModel.activeTask?.command).toBe("git pull");
  });

  it("uses an explicitly selected release scenario", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "release base"').state;

    const viewModel = buildPlaygroundViewModel(state, undefined, "release-management");

    expect(viewModel.learningScenario.id).toBe("release-management");
    expect(viewModel.learningScenario.title).toBe("发布管理");
    expect(viewModel.activeTask?.command).toBe("git branch release");
  });

  it("uses an explicitly selected worktree scenario", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "main base"').state;
    state = executeGitCommand(state, "git switch -c feature/payment").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "feature progress"').state;

    const viewModel = buildPlaygroundViewModel(state, undefined, "worktree-parallel");

    expect(viewModel.learningScenario.id).toBe("worktree-parallel");
    expect(viewModel.learningScenario.title).toBe("Worktree 多分支并行开发");
    expect(viewModel.activeTask?.command).toBe("git worktree add ../hotfix main");
  });
});
