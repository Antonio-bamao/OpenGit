import { describe, expect, it } from "vitest";
import {
  commandDocs,
  getFeaturedDocScenarios,
  getAllCommandDocSlugs,
  getCommandDocBySlug,
  getCommandDocForInput,
  getDocsHrefForCommandInput,
  getGroupedCommandDocs,
  getPracticeGuidanceForCommandDoc,
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

  it("reuses featured scenario priority metadata inside command practice links", () => {
    expect(getCommandDocForInput('git commit -m "first commit"')?.practiceScenario).toMatchObject({
      id: "solo-project",
      badge: "推荐起点",
      emphasis: "primary"
    });

    expect(getCommandDocForInput("git switch -c feature/team-work")?.practiceScenario).toMatchObject({
      id: "team-collab",
      badge: "协作进阶",
      emphasis: "secondary"
    });

    expect(getCommandDocForInput("git worktree list")?.practiceScenario).toMatchObject({
      id: "worktree-parallel"
    });
    expect(getCommandDocForInput("git worktree list")?.practiceScenario).not.toHaveProperty("badge");
  });

  it("maps real command input back to the relevant docs detail page", () => {
    expect(getDocsHrefForCommandInput("git pull")).toBe("/docs/pull");
    expect(getDocsHrefForCommandInput("git worktree add ../hotfix main")).toBe("/docs/worktree");
    expect(getDocsHrefForCommandInput('git commit -m "first commit"')).toBe("/docs/commit");
    expect(getDocsHrefForCommandInput("npm test")).toBe("/docs");
  });

  it("resolves command input to the current command doc payload", () => {
    expect(getCommandDocForInput("git push")).toMatchObject({
      id: "push",
      detailHref: "/docs/push",
      practiceScenario: {
        id: "team-collab"
      }
    });
    expect(getCommandDocForInput("git worktree add ../hotfix main")).toMatchObject({
      id: "worktree",
      detailHref: "/docs/worktree",
      practiceScenario: {
        id: "worktree-parallel"
      }
    });
    expect(getCommandDocForInput("npm test")).toBeUndefined();
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

  it("builds practice guidance that points back to a concrete scenario step", () => {
    expect(getPracticeGuidanceForCommandDoc("status")).toMatchObject({
      scenario: {
        id: "conflict-resolution",
        title: "处理冲突"
      },
      step: {
        title: "查看未合并路径",
        command: "git status"
      }
    });

    expect(getPracticeGuidanceForCommandDoc("log")).toMatchObject({
      scenario: {
        id: "version-rollback",
        title: "版本回退与修复"
      },
      step: {
        title: "观察已有历史",
        command: "git log"
      }
    });

    expect(getPracticeGuidanceForCommandDoc("missing")).toBeUndefined();
  });

  it("builds featured scenario shortcuts for the docs landing page", () => {
    const entries = getFeaturedDocScenarios();

    expect(entries.map((entry) => entry.id)).toEqual([
      "solo-project",
      "team-collab",
      "conflict-resolution",
      "version-rollback"
    ]);
    expect(entries[0]).toMatchObject({
      title: "从零开始个人项目",
      badge: "推荐起点",
      emphasis: "primary",
      playgroundHref: "/playground?scenario=solo-project&command=git%20init",
      primaryDoc: {
        id: "init",
        detailHref: "/docs/init"
      }
    });
    expect(entries[2]).toMatchObject({
      title: "处理冲突",
      badge: "问题处理",
      emphasis: "secondary",
      primaryCommand: "git pull",
      primaryDoc: {
        id: "pull",
        detailHref: "/docs/pull"
      }
    });
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
