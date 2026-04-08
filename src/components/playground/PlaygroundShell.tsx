"use client";

import { useMemo, useState } from "react";
import { createInitialGitState, executeGitCommand } from "@/lib/git-sim/git-simulator";
import type { CommandResult, GitFileStatus } from "@/lib/git-sim/types";

const zones = [
  { key: "working", label: "工作目录", description: "未暂存的文件" },
  { key: "staging", label: "暂存区", description: "下一次 commit 的内容" },
  { key: "local", label: "本地仓库", description: "本地提交历史" },
  { key: "remote", label: "远程仓库", description: "后续模拟 push/pull" }
] as const;

const statusLabels: Record<GitFileStatus, string> = {
  untracked: "未跟踪",
  modified: "已修改",
  staged: "已暂存",
  tracked: "已跟踪"
};

const statusClasses: Record<GitFileStatus, string> = {
  untracked: "bg-red-400/10 text-red-200 ring-red-400/30",
  modified: "bg-amber-400/10 text-amber-200 ring-amber-400/30",
  staged: "bg-fuchsia-400/10 text-fuchsia-200 ring-fuchsia-400/30",
  tracked: "bg-emerald-400/10 text-emerald-200 ring-emerald-400/30"
};

export function PlaygroundShell() {
  const [gitState, setGitState] = useState(createInitialGitState);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandResult[]>([
    {
      state: createInitialGitState(),
      output: "输入 `git init` 开始。试试 `git status`、`git add .`、`git commit -m \"first commit\"`。",
      hint: {
        title: "Playground 已就绪",
        body: "这里先用受控 Git 状态模型模拟基础命令，后续再接入更完整的 Git 引擎。"
      }
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const zoneCounts = useMemo(() => {
    const working = gitState.files.filter(
      (file) => file.status === "untracked" || file.status === "modified"
    ).length;
    const staging = gitState.files.filter((file) => file.status === "staged").length;

    return {
      working,
      staging,
      local: gitState.commits.length,
      remote: 0
    };
  }, [gitState]);

  function runCommand(command: string) {
    const trimmed = command.trim();
    if (trimmed.length === 0) {
      return;
    }

    const result = executeGitCommand(gitState, trimmed);
    setGitState(result.state);
    setHistory((entries) => [...entries, result]);
    setCommandHistory((commands) => [...commands, trimmed]);
    setHistoryIndex(null);
    setInput("");
  }

  function navigateHistory(direction: "up" | "down") {
    if (commandHistory.length === 0) {
      return;
    }

    const nextIndex =
      direction === "up"
        ? historyIndex === null
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1)
        : historyIndex === null
          ? commandHistory.length - 1
          : Math.min(commandHistory.length - 1, historyIndex + 1);

    setHistoryIndex(nextIndex);
    setInput(commandHistory[nextIndex]);
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-cyan-300">模拟终端</p>
          <button
            type="button"
            onClick={() => {
              const freshState = createInitialGitState();
              setGitState(freshState);
              setHistory([]);
              setCommandHistory([]);
              setHistoryIndex(null);
              setInput("");
            }}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-cyan-300 hover:text-cyan-200"
          >
            重置
          </button>
        </div>

        <div className="mt-4 min-h-[480px] rounded-lg bg-black p-4 font-mono text-sm text-green-300">
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={`${entry.output}-${index}`} className="whitespace-pre-wrap">
                <p className="text-slate-500">$ {commandHistory[index - 1] ?? ""}</p>
                <p>{entry.output}</p>
                {entry.hint ? (
                  <div className="mt-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 font-sans text-cyan-100">
                    <p className="text-xs font-semibold uppercase text-cyan-300">{entry.hint.title}</p>
                    <p className="mt-1 text-sm leading-6">{entry.hint.body}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <form
            className="mt-5 flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              runCommand(input);
            }}
          >
            <span className="text-slate-500">$</span>
            <input
              aria-label="输入 Git 命令"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  navigateHistory("up");
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  navigateHistory("down");
                }
              }}
              className="min-w-0 flex-1 bg-transparent text-green-200 outline-none placeholder:text-slate-700"
              placeholder="git init"
            />
          </form>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm font-semibold text-cyan-300">可视化面板</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {zones.map((zone) => (
              <div key={zone.key} className="rounded-lg border border-slate-700 p-4 text-center">
                <p className="font-semibold">{zone.label}</p>
                <p className="mt-2 text-3xl font-bold text-cyan-200">{zoneCounts[zone.key]}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{zone.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm font-semibold text-cyan-300">仓库状态</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>Initialized: {gitState.initialized ? "yes" : "no"}</li>
            <li>HEAD: {gitState.head ?? "(no commits)"}</li>
            <li>Branch: {gitState.branch}</li>
          </ul>

          <div className="mt-5 space-y-2">
            {gitState.files.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate text-slate-200">{file.path}</span>
                <span className={`shrink-0 rounded-full px-2 py-1 text-xs ring-1 ${statusClasses[file.status]}`}>
                  {statusLabels[file.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

