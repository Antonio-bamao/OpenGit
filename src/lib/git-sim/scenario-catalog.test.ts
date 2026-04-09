import { describe, expect, it } from "vitest";
import { getReadyScenarios, scenarioCatalog } from "./scenario-catalog";

describe("scenarioCatalog", () => {
  it("keeps the six global-plan scenarios in order", () => {
    expect(scenarioCatalog.map((scenario) => scenario.id)).toEqual([
      "solo-project",
      "team-collab",
      "conflict-resolution",
      "version-rollback",
      "release-management",
      "worktree-parallel"
    ]);
  });

  it("exposes ready scenarios with playground commands", () => {
    const readyScenarios = getReadyScenarios();

    expect(readyScenarios.map((scenario) => scenario.id)).toEqual([
      "solo-project",
      "team-collab",
      "conflict-resolution",
      "version-rollback",
      "release-management",
      "worktree-parallel"
    ]);
    expect(readyScenarios[0]?.playgroundHref).toBe(
      "/playground?scenario=solo-project&command=git%20init"
    );
    expect(readyScenarios[1]?.playgroundHref).toBe(
      "/playground?scenario=team-collab&command=git%20switch%20-c%20feature%2Fteam-work"
    );
    expect(readyScenarios[2]?.playgroundHref).toBe(
      "/playground?scenario=conflict-resolution&command=git%20pull"
    );
    expect(readyScenarios[3]?.playgroundHref).toBe(
      "/playground?scenario=version-rollback&command=git%20revert%20HEAD"
    );
    expect(readyScenarios[4]?.playgroundHref).toBe(
      "/playground?scenario=release-management&command=git%20branch%20release"
    );
    expect(readyScenarios[5]?.playgroundHref).toBe(
      "/playground?scenario=worktree-parallel&command=git%20worktree%20add%20..%2Fhotfix%20main"
    );
  });
});
