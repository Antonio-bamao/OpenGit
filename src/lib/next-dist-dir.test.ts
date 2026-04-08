import { describe, expect, it } from "vitest";
import { getNextDistDir } from "./next-dist-dir.mjs";

describe("getNextDistDir", () => {
  it("separates dev and production build outputs", () => {
    expect(getNextDistDir("development")).toBe(".next-dev");
    expect(getNextDistDir("production")).toBe(".next-build");
  });

  it("falls back to the development output for unknown modes", () => {
    expect(getNextDistDir("test")).toBe(".next-dev");
    expect(getNextDistDir(undefined)).toBe(".next-dev");
  });
});
