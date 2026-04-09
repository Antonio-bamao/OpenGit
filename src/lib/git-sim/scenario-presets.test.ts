import { describe, expect, it } from "vitest";
import { getScenarioPreset } from "./scenario-presets";

describe("getScenarioPreset", () => {
  it("starts the solo project scenario from an empty workspace", () => {
    const preset = getScenarioPreset("solo-project");

    expect(preset.initialCommand).toBe("git init");
    expect(preset.gitState.initialized).toBe(false);
    expect(preset.gitState.branch).toBe("main");
  });

  it("starts the team collaboration scenario from a cloned repository", () => {
    const preset = getScenarioPreset("team-collab");

    expect(preset.initialCommand).toBe("git switch -c feature/team-work");
    expect(preset.gitState.initialized).toBe(true);
    expect(preset.gitState.head).toBe("c000001");
    expect(preset.gitState.remoteBranchHeads.main).toBe("c000001");
    expect(preset.history[0]?.output).toContain("团队仓库");
  });

  it("starts the rollback scenario from a repository with a bad latest commit", () => {
    const preset = getScenarioPreset("version-rollback");

    expect(preset.initialCommand).toBe("git revert HEAD");
    expect(preset.gitState.initialized).toBe(true);
    expect(preset.gitState.head).toBe("c000002");
    expect(preset.gitState.commits[0]?.message).toBe("broken change");
    expect(preset.history[0]?.output).toContain("回退");
  });

  it("starts the release scenario from a repository ready to branch and tag", () => {
    const preset = getScenarioPreset("release-management");

    expect(preset.initialCommand).toBe("git branch release");
    expect(preset.gitState.initialized).toBe(true);
    expect(preset.gitState.head).toBe("c000001");
    expect(preset.gitState.remoteBranchHeads.main).toBe("c000001");
    expect(preset.history[0]?.output).toContain("发布");
  });
});
