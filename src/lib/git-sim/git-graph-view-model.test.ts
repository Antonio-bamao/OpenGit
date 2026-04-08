import { describe, expect, it } from "vitest";
import { createInitialGitState, executeGitCommand } from "./git-simulator";
import { buildGitGraphViewModel } from "./git-graph-view-model";

describe("buildGitGraphViewModel", () => {
  it("maps commits and refs into graph nodes without touching React", () => {
    let state = executeGitCommand(createInitialGitState(), "git init").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "main base"').state;
    state = executeGitCommand(state, "git switch -c feature/flow").state;
    state = executeGitCommand(state, "git add README.md").state;
    state = executeGitCommand(state, 'git commit -m "feature work"').state;
    state = executeGitCommand(state, "git push").state;

    const graph = buildGitGraphViewModel(state);

    expect(graph.nodes.map((node) => node.hash)).toEqual(["c000002", "c000001"]);
    expect(graph.nodes[0]).toMatchObject({
      hash: "c000002",
      message: "feature work",
      branch: "feature/flow",
      isHead: true,
      lane: 1
    });
    expect(graph.nodes[0]?.refs).toEqual(["feature/flow"]);
    expect(graph.nodes[0]?.remoteRefs).toEqual(["origin/feature/flow"]);
    expect(graph.nodes[1]?.refs).toEqual(["main"]);
    expect(graph.currentBranch).toBe("feature/flow");
  });
});
