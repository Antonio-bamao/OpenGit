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
    expect(state.files.every((file) => file.status === "staged")).toBe(true);

    result = executeGitCommand(state, 'git commit -m "first commit"');
    state = result.state;
    expect(result.output).toContain("[main ");
    expect(result.output).toContain("first commit");
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
});
