import { describe, expect, it } from "vitest";
import { createInitialGitState, executeGitCommand } from "./git-simulator";

describe("executeGitCommand", () => {
  it("walks through init, add, commit, and log", () => {
    let state = createInitialGitState();

    let result = executeGitCommand(state, "git init");
    state = result.state;
    expect(result.output).toContain("Initialized empty Git repository");
    expect(state.initialized).toBe(true);

    result = executeGitCommand(state, "git add .");
    state = result.state;
    expect(result.output).toContain("added 3 files");
    expect(result.effect?.type).toBe("stage");
    expect(state.files.every((file) => file.status === "staged")).toBe(true);

    result = executeGitCommand(state, 'git commit -m "first commit"');
    state = result.state;
    expect(result.output).toContain("[main ");
    expect(result.output).toContain("first commit");
    expect(result.effect?.type).toBe("commit");
    expect(state.commits).toHaveLength(1);
    expect(state.files.every((file) => file.status === "tracked")).toBe(true);

    result = executeGitCommand(state, "git log");
    expect(result.output).toContain("commit ");
    expect(result.output).toContain("first commit");
  });

  it("returns a terminal-like error and learning hint for unknown git commands", () => {
    const result = executeGitCommand(createInitialGitState(), "git yeet");

    expect(result.output).toContain("git: 'yeet' is not a git command");
    expect(result.hint?.title).toBe("为什么报错");
    expect(result.hint?.body).toContain("OpenGit MVP");
  });

  it("clones a virtual origin repository into a clean workspace", () => {
    const result = executeGitCommand(
      createInitialGitState(),
      "git clone https://github.com/opengit/example.git"
    );

    expect(result.output).toContain("Cloning into 'example'");
    expect(result.effect?.type).toBe("clone");
    expect(result.state.initialized).toBe(true);
    expect(result.state.branch).toBe("main");
    expect(result.state.head).toBe("c000001");
    expect(result.state.branchHeads.main).toBe("c000001");
    expect(result.state.remoteBranchHeads.main).toBe("c000001");
    expect(result.state.commits[0]?.message).toContain("Clone from https://github.com/opengit/example.git");
    expect(result.state.remoteCommits[0]?.hash).toBe("c000001");
    expect(result.state.files.every((file) => file.status === "tracked")).toBe(true);
  });

  it("unstages files with restore --staged and reset", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;

    let result = executeGitCommand(state, "git add README.md");
    state = result.state;
    expect(state.files.find((file) => file.path === "README.md")?.status).toBe("staged");

    result = executeGitCommand(state, "git restore --staged README.md");
    state = result.state;
    expect(result.output).toContain("unstaged 1 file");
    expect(result.effect?.type).toBe("unstage");
    expect(state.files.find((file) => file.path === "README.md")?.status).toBe("untracked");

    state = executeGitCommand(state, "git add .").state;
    result = executeGitCommand(state, "git reset");
    state = result.state;
    expect(result.output).toContain("unstaged 3 files");
    expect(result.effect?.type).toBe("unstage");
    expect(state.files.every((file) => file.status === "untracked")).toBe(true);
  });

  it("shows staged diffs without changing repository state", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;

    const result = executeGitCommand(state, "git diff --staged");

    expect(result.output).toContain("diff --staged README.md");
    expect(result.output).toContain("+ README.md");
    expect(result.state).toBe(state);
  });

  it("switches branches and lists the current branch", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;

    let result = executeGitCommand(state, "git switch -c feature/flow");
    state = result.state;
    expect(result.output).toContain("Switched to a new branch 'feature/flow'");
    expect(result.effect?.type).toBe("switch");
    expect(state.branch).toBe("feature/flow");
    expect(state.branches).toContain("main");
    expect(state.branches).toContain("feature/flow");

    result = executeGitCommand(state, "git branch");
    expect(result.output).toContain("  main");
    expect(result.output).toContain("* feature/flow");
  });

  it("creates and deletes branches without switching away from the current branch", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "main base"').state;

    let result = executeGitCommand(state, "git branch feature/branch-map");
    state = result.state;

    expect(result.output).toContain("Created branch 'feature/branch-map'");
    expect(state.branch).toBe("main");
    expect(state.branches).toContain("feature/branch-map");
    expect(state.branchHeads["feature/branch-map"]).toBe(state.head);

    result = executeGitCommand(state, "git branch -d feature/branch-map");
    state = result.state;

    expect(result.output).toContain("Deleted branch feature/branch-map");
    expect(state.branches).not.toContain("feature/branch-map");
    expect(state.branchHeads["feature/branch-map"]).toBeUndefined();
  });

  it("supports checkout aliases for switching and creating branches", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "main base"').state;

    let result = executeGitCommand(state, "git checkout -b feature/checkout-flow");
    state = result.state;

    expect(result.output).toContain("Switched to a new branch 'feature/checkout-flow'");
    expect(result.effect?.type).toBe("switch");
    expect(state.branch).toBe("feature/checkout-flow");
    expect(state.branchHeads["feature/checkout-flow"]).toBe("c000001");

    result = executeGitCommand(state, "git checkout main");
    state = result.state;

    expect(result.output).toContain("Switched to branch 'main'");
    expect(state.branch).toBe("main");
    expect(state.head).toBe("c000001");
  });

  it("keeps independent branch heads when committing on a feature branch", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "main base"').state;

    expect(state.branchHeads.main).toBe("c000001");

    state = executeGitCommand(state, "git switch -c feature/flow").state;
    expect(state.branchHeads["feature/flow"]).toBe("c000001");

    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "feature work"').state;

    expect(state.head).toBe("c000002");
    expect(state.branchHeads.main).toBe("c000001");
    expect(state.branchHeads["feature/flow"]).toBe("c000002");

    const switchResult = executeGitCommand(state, "git switch main");
    state = switchResult.state;

    expect(state.branch).toBe("main");
    expect(state.head).toBe("c000001");

    const logResult = executeGitCommand(state, "git log");
    expect(logResult.output).toContain("main base");
    expect(logResult.output).not.toContain("feature work");
  });

  it("pushes local commits into the simulated remote", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add .").state;
    state = executeGitCommand(state, 'git commit -m "first commit"').state;

    const result = executeGitCommand(state, "git push");

    expect(result.output).toContain("pushed 1 commit to origin/main");
    expect(result.effect?.type).toBe("push");
    expect(result.state.remoteCommits).toHaveLength(1);
    expect(result.state.remoteCommits[0]?.hash).toBe(state.commits[0]?.hash);
  });

  it("lists origin after push and fetches remote refs", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add .").state;
    state = executeGitCommand(state, 'git commit -m "first commit"').state;
    state = executeGitCommand(state, "git push").state;

    let result = executeGitCommand(state, "git remote -v");
    expect(result.output).toContain("origin");
    expect(result.output).toContain("/open-git/origin.git");

    result = executeGitCommand(state, "git fetch");
    state = result.state;

    expect(result.output).toContain("From /open-git/origin");
    expect(result.effect?.type).toBe("fetch");
    expect(state.remoteBranchHeads.main).toBe("c000001");
  });

  it("pulls a remote commit into the current branch", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "local base"').state;
    state = executeGitCommand(state, "git push").state;

    const remoteCommit = {
      hash: "c000002",
      message: "teammate update",
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

    const result = executeGitCommand(state, "git pull");

    expect(result.output).toContain("Fast-forward");
    expect(result.effect?.type).toBe("pull");
    expect(result.state.head).toBe("c000002");
    expect(result.state.branchHeads.main).toBe("c000002");
    expect(result.state.commits[0]?.message).toBe("teammate update");
  });

  it("moves HEAD back one commit with commit-level reset while preserving changes", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "base"').state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "broken change"').state;

    const result = executeGitCommand(state, "git reset --soft HEAD~1");

    expect(result.output).toContain("HEAD is now at c000001");
    expect(result.effect?.type).toBe("reset");
    expect(result.state.head).toBe("c000001");
    expect(result.state.branchHeads.main).toBe("c000001");
    expect(result.state.files.find((file) => file.path === "README.md")?.status).toBe("staged");
  });

  it("creates a revert commit that keeps history linear", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "base"').state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "broken change"').state;

    const result = executeGitCommand(state, "git revert HEAD");

    expect(result.output).toContain('Revert "broken change"');
    expect(result.effect?.type).toBe("revert");
    expect(result.state.head).toBe("c000003");
    expect(result.state.branchHeads.main).toBe("c000003");
    expect(result.state.commits[0]).toMatchObject({
      hash: "c000003",
      message: 'Revert "broken change"',
      parentHash: "c000002"
    });
  });

  it("creates tags and pushes them to the simulated remote", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "release base"').state;
    state = executeGitCommand(state, "git push").state;

    let result = executeGitCommand(state, "git tag v1.0.0");
    state = result.state;

    expect(result.output).toContain("Created tag 'v1.0.0'");
    expect(result.effect?.type).toBe("tag");
    expect(result.state.tags["v1.0.0"]).toBe("c000001");

    result = executeGitCommand(state, "git push --tags");

    expect(result.output).toContain("pushed 1 tag to origin");
    expect(result.effect?.type).toBe("push");
    expect(result.state.remoteTags["v1.0.0"]).toBe("c000001");
  });
});
