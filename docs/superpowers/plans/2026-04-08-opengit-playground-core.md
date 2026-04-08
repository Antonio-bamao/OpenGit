# OpenGit Playground Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. This project is intentionally staying in the root worktree for now because the user requested avoiding `.worktrees` after scaffold cleanup.

**Goal:** Add the first interactive Playground loop: parse Git commands, update a simulated Git state, and render terminal/status/workflow feedback.

**Architecture:** Keep the Git simulator as pure TypeScript in `src/lib/git-sim/` and keep React components thin. Test the parser and state transition functions with Vitest before wiring them to the client component.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Vitest.

---

## Tasks

- [x] Add Vitest and a `pnpm test` script.
- [x] Write failing parser tests for `git commit -m "message"` and non-git input.
- [x] Implement `parseGitCommand`.
- [x] Write failing Git simulator tests for `init -> add -> commit -> log` and unknown command errors.
- [x] Implement the Git simulator state and command executor.
- [x] Replace the static Playground shell with a client-side terminal form wired to the simulator.
- [x] Run `pnpm test`, `pnpm lint`, `pnpm build`, and `.context` validation.
- [x] Update `.context` status and work log.
