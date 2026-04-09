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

    expect(readyScenarios.map((scenario) => scenario.id)).toEqual(["solo-project", "team-collab"]);
    expect(readyScenarios[0]?.playgroundHref).toBe(
      "/playground?scenario=solo-project&command=git%20init"
    );
    expect(readyScenarios[1]?.playgroundHref).toBe(
      "/playground?scenario=team-collab&command=git%20switch%20-c%20feature%2Fteam-work"
    );
  });
});
