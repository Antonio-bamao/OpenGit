import { describe, expect, it } from "vitest";
import { commandDocs, getDocsHrefForCommandInput, getGroupedCommandDocs } from "./git-docs";

describe("git-docs", () => {
  it("groups supported commands into the five teaching categories in order", () => {
    const groups = getGroupedCommandDocs();

    expect(groups.map((group) => group.id)).toEqual([
      "basics",
      "branching",
      "remote",
      "advanced",
      "worktree"
    ]);
    expect(groups[0]?.items.map((item) => item.command)).toEqual([
      "git init",
      "git status",
      "git add",
      "git commit",
      "git log",
      "git diff",
      "git restore"
    ]);
    expect(groups[2]?.items.map((item) => item.command)).toEqual([
      "git clone",
      "git remote",
      "git fetch",
      "git pull",
      "git push"
    ]);
    expect(groups[4]?.items.map((item) => item.command)).toEqual(["git worktree"]);
  });

  it("keeps a docs entry for every simulated command and exposes playground try-links", () => {
    expect(commandDocs).toHaveLength(19);
    expect(commandDocs.find((entry) => entry.command === "git pull")).toMatchObject({
      category: "remote",
      playgroundHref: "/playground?command=git%20pull"
    });
    expect(commandDocs.find((entry) => entry.command === "git worktree")).toMatchObject({
      category: "worktree",
      playgroundHref: "/playground?command=git%20worktree%20list"
    });
  });

  it("maps real command input back to the relevant docs anchor", () => {
    expect(getDocsHrefForCommandInput("git pull")).toBe("/docs#git-pull");
    expect(getDocsHrefForCommandInput("git worktree add ../hotfix main")).toBe("/docs#git-worktree");
    expect(getDocsHrefForCommandInput('git commit -m "first commit"')).toBe("/docs#git-commit");
    expect(getDocsHrefForCommandInput("npm test")).toBe("/docs");
  });
});
