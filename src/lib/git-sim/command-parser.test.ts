import { describe, expect, it } from "vitest";
import { parseGitCommand } from "./command-parser";

describe("parseGitCommand", () => {
  it("parses a git commit command with a quoted message", () => {
    expect(parseGitCommand('git commit -m "first commit"')).toEqual({
      raw: 'git commit -m "first commit"',
      isGit: true,
      name: "commit",
      args: ["-m", "first commit"]
    });
  });

  it("marks non-git input as unsupported", () => {
    expect(parseGitCommand("npm install")).toEqual({
      raw: "npm install",
      isGit: false,
      name: "",
      args: ["npm", "install"]
    });
  });
});

