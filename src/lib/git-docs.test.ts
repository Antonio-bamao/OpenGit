import { describe, expect, it } from "vitest";
import {
  commandDocs,
  getAllCommandDocSlugs,
  getCommandDocBySlug,
  getDocsHrefForCommandInput,
  getGroupedCommandDocs,
  searchGroupedCommandDocs
} from "./git-docs";

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
      playgroundHref: "/playground?command=git%20pull",
      detailHref: "/docs/pull",
      practiceScenario: {
        id: "conflict-resolution",
        href: "/playground?scenario=conflict-resolution&command=git%20pull"
      }
    });
    expect(commandDocs.find((entry) => entry.command === "git worktree")).toMatchObject({
      category: "worktree",
      playgroundHref: "/playground?command=git%20worktree%20list",
      detailHref: "/docs/worktree",
      practiceScenario: {
        id: "worktree-parallel",
        href: "/playground?scenario=worktree-parallel&command=git%20worktree%20add%20..%2Fhotfix%20main"
      }
    });
  });

  it("maps real command input back to the relevant docs detail page", () => {
    expect(getDocsHrefForCommandInput("git pull")).toBe("/docs/pull");
    expect(getDocsHrefForCommandInput("git worktree add ../hotfix main")).toBe("/docs/worktree");
    expect(getDocsHrefForCommandInput('git commit -m "first commit"')).toBe("/docs/commit");
    expect(getDocsHrefForCommandInput("npm test")).toBe("/docs");
  });

  it("exposes slug lookups and static params for detail pages", () => {
    expect(getAllCommandDocSlugs()).toContain("pull");
    expect(getAllCommandDocSlugs()).toContain("worktree");
    expect(getCommandDocBySlug("pull")).toMatchObject({
      id: "pull",
      command: "git pull",
      category: "remote"
    });
    expect(getCommandDocBySlug("missing")).toBeUndefined();
  });

  it("returns the full grouped catalog when the search query is empty", () => {
    const groups = searchGroupedCommandDocs("");

    expect(groups.map((group) => group.id)).toEqual([
      "basics",
      "branching",
      "remote",
      "advanced",
      "worktree"
    ]);
    expect(groups.flatMap((group) => group.items).length).toBe(commandDocs.length);
  });

  it("filters by command name and keeps only matching groups", () => {
    const groups = searchGroupedCommandDocs("pull");

    expect(groups).toHaveLength(1);
    expect(groups[0]?.id).toBe("remote");
    expect(groups[0]?.items.map((item) => item.id)).toEqual(["pull"]);
  });

  it("filters by summaries and use cases, not just exact command names", () => {
    const groups = searchGroupedCommandDocs("发布");

    expect(groups.map((group) => group.id)).toEqual(["branching", "advanced"]);
    expect(groups[0]?.items.map((item) => item.id)).toEqual(["branch"]);
    expect(groups[1]?.items.map((item) => item.id)).toEqual(["tag"]);
  });

  it("matches keyword aliases so intent-based searches can find the right commands", () => {
    const groups = searchGroupedCommandDocs("回滚");

    expect(groups).toHaveLength(1);
    expect(groups[0]?.id).toBe("advanced");
    expect(groups[0]?.items.map((item) => item.id)).toEqual(["reset", "revert"]);
  });
});
