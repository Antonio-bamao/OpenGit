"use client";

import { useMemo, useState } from "react";
import { createInitialGitState, executeGitCommand } from "@/lib/git-sim/git-simulator";
import type { CommandResult, GitFileStatus, GitFlowZone } from "@/lib/git-sim/types";

const zones = [
  { key: "working", label: "工作区", description: "尚未暂存的文件" },
  { key: "staging", label: "暂存区", description: "下一次提交的内容" },
  { key: "local", label: "本地仓库", description: "已经写入的提交" },
  { key: "remote", label: "远端仓库", description: "后续模拟 push / pull" }
] as const;

const statusLabels: Record<GitFileStatus, string> = {
  untracked: "未跟踪",
  modified: "已修改",
  staged: "已暂存",
  tracked: "已提交"
};

const statusClasses: Record<GitFileStatus, string> = {
  untracked: "border-rose-200 bg-rose-50 text-rose-700",
  modified: "border-amber-200 bg-amber-50 text-amber-800",
  staged: "border-emerald-200 bg-emerald-50 text-emerald-800",
  tracked: "border-slate-200 bg-slate-100 text-slate-700"
};

const flowLinks: Array<{ from: GitFlowZone; to: GitFlowZone }> = [
  { from: "working", to: "staging" },
  { from: "staging", to: "local" },
  { from: "local", to: "remote" }
];

function createWelcomeEntry(): CommandResult {
  return {
    state: createInitialGitState(),
    output:
      "输入 git init 开始。随后试试 git status、git add .、git commit -m \"first commit\"、git diff --staged、git push。",
    hint: {
      title: "Playground 已就绪",
      body: "这里先用可控 Git 状态模型模拟基础命令，帮助你把命令和仓库结构对应起来。"
    }
  };
}

export function PlaygroundShell() {
  const [gitState, setGitState] = useState(createInitialGitState);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandResult[]>(() => [createWelcomeEntry()]);
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
      remote: gitState.remoteCommits.length
    };
  }, [gitState]);

  const latestEffect = history.at(-1)?.effect;
  const flowItems = useMemo(
    () => ({
      working: gitState.files
        .filter((file) => file.status === "untracked" || file.status === "modified")
        .map((file) => ({
          id: file.path,
          label: file.path,
          meta: statusLabels[file.status],
          status: file.status
        })),
      staging: gitState.files
        .filter((file) => file.status === "staged")
        .map((file) => ({
          id: file.path,
          label: file.path,
          meta: "下一次提交",
          status: file.status
        })),
      local: gitState.commits.map((commit) => ({
        id: commit.hash,
        label: commit.hash,
        meta: commit.message,
        status: "tracked" as const
      })),
      remote: gitState.remoteCommits.map((commit) => ({
        id: commit.hash,
        label: commit.hash,
        meta: `origin/${gitState.branch}`,
        status: "tracked" as const
      }))
    }),
    [gitState]
  );

  function isFlowActive(from: GitFlowZone, to: GitFlowZone) {
    return (
      (latestEffect?.from === from && latestEffect.to === to) ||
      (latestEffect?.from === to && latestEffect.to === from)
    );
  }

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

  function resetPlayground() {
    const freshState = createInitialGitState();
    setGitState(freshState);
    setHistory([createWelcomeEntry()]);
    setCommandHistory([]);
    setHistoryIndex(null);
    setInput("");
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <div className="motion-fade-up rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-700">模拟终端</p>
            <p className="mt-1 text-xs text-slate-500">支持方向键回看命令历史</p>
          </div>
          <button
            type="button"
            onClick={resetPlayground}
            className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            重置
          </button>
        </div>

        <div className="mt-4 min-h-[480px] rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800">
          <div className="space-y-4">
            {history.map((entry, index) => {
              const command = commandHistory[index - 1];

              return (
                <div key={`${entry.output}-${index}`} className="motion-fade-up whitespace-pre-wrap">
                  {command ? (
                    <p className="mb-1 text-emerald-700">
                      <span className="text-slate-400">$</span> {command}
                    </p>
                  ) : null}
                  <p className="leading-6">{entry.output}</p>
                  {entry.hint ? (
                    <div className="mt-3 border-l-2 border-emerald-500 bg-white px-3 py-2 font-sans text-slate-700 shadow-sm">
                      <p className="text-xs font-semibold text-emerald-700">{entry.hint.title}</p>
                      <p className="mt-1 text-sm leading-6">{entry.hint.body}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <form
            className="mt-5 flex min-h-12 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 transition duration-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100"
            onSubmit={(event) => {
              event.preventDefault();
              runCommand(input);
            }}
          >
            <span className="text-slate-400">$</span>
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
              className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none placeholder:text-slate-400"
              placeholder="git init"
            />
          </form>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="motion-fade-up motion-delay-1">
          <p className="text-sm font-semibold text-emerald-700">可视化面板</p>
          <div className="mt-4 grid items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)_32px_minmax(0,1fr)_32px_minmax(0,1fr)]">
            {zones.map((zone, index) => (
              <div key={zone.key} className="contents">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 transition duration-200 hover:border-emerald-300 hover:bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{zone.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{zone.description}</p>
                    </div>
                    <span className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-emerald-700 shadow-sm">
                      {zoneCounts[zone.key]}
                    </span>
                  </div>

                  <div className="mt-4 min-h-28 space-y-2">
                    {flowItems[zone.key].length > 0 ? (
                      flowItems[zone.key].map((item) => (
                        <div
                          key={item.id}
                          className={`flow-chip rounded-md border bg-white px-2.5 py-2 text-xs shadow-sm ${
                            statusClasses[item.status]
                          }`}
                        >
                          <p className="truncate font-mono font-semibold">{item.label}</p>
                          <p className="mt-1 truncate opacity-75">{item.meta}</p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-md border border-dashed border-slate-300 px-2.5 py-3 text-center text-xs leading-5 text-slate-400">
                        等待流入
                      </p>
                    )}
                  </div>
                </div>
                {index < flowLinks.length ? (
                  <div
                    className={`flow-link hidden self-center md:block ${
                      isFlowActive(flowLinks[index].from, flowLinks[index].to) ? "flow-link-active" : ""
                    }`}
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="motion-fade-up motion-delay-2 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold text-emerald-700">仓库状态</p>
          <dl className="mt-4 grid overflow-hidden border-y border-slate-200 text-sm text-slate-600 sm:grid-cols-4 sm:border-x">
            <div className="border-b border-slate-200 p-3 sm:border-b-0 sm:border-r">
              <dt className="text-xs font-semibold text-slate-500">Initialized</dt>
              <dd className="mt-1 font-mono text-slate-950">{gitState.initialized ? "yes" : "no"}</dd>
            </div>
            <div className="border-b border-slate-200 p-3 sm:border-b-0 sm:border-r">
              <dt className="text-xs font-semibold text-slate-500">HEAD</dt>
              <dd className="mt-1 truncate font-mono text-slate-950">{gitState.head ?? "(no commits)"}</dd>
            </div>
            <div className="p-3">
              <dt className="text-xs font-semibold text-slate-500">Branch</dt>
              <dd className="mt-1 font-mono text-slate-950">{gitState.branch}</dd>
            </div>
            <div className="border-t border-slate-200 p-3 sm:border-l sm:border-t-0">
              <dt className="text-xs font-semibold text-slate-500">Remote</dt>
              <dd className="mt-1 font-mono text-slate-950">{gitState.remoteCommits.length} commits</dd>
            </div>
          </dl>

          <div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200">
            {gitState.files.map((file) => (
              <div
                key={file.path}
                className="flex items-center justify-between gap-3 bg-white px-3 py-3 text-sm transition duration-200 hover:bg-slate-50"
              >
                <span className="min-w-0 truncate font-mono text-slate-700">{file.path}</span>
                <span
                  className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${statusClasses[file.status]}`}
                >
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
