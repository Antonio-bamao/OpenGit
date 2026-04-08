"use client";

import { useMemo, useState } from "react";
import { buildGitGraphViewModel } from "@/lib/git-sim/git-graph-view-model";
import { buildPlaygroundViewModel } from "@/lib/git-sim/playground-view-model";
import { createInitialGitState, executeGitCommand } from "@/lib/git-sim/git-simulator";
import type { CommandResult } from "@/lib/git-sim/types";
import { CommandTerminalPanel } from "./panels/CommandTerminalPanel";
import { GitGraphPanel } from "./panels/GitGraphPanel";
import { GitWorkflowPanel } from "./panels/GitWorkflowPanel";
import { LearningPathPanel } from "./panels/LearningPathPanel";
import { RepositoryInsightPanel } from "./panels/RepositoryInsightPanel";

interface PlaygroundShellProps {
  initialCommand?: string;
}

function createWelcomeEntry(initialCommand = ""): CommandResult {
  const trimmedCommand = initialCommand.trim();

  return {
    state: createInitialGitState(),
    output: trimmedCommand
      ? `已填入 ${trimmedCommand}，按 Enter 运行后继续跟随任务路线。`
      : "输入 git init 开始个人项目，或试试 git clone https://github.com/opengit/example.git 加入团队项目。随后可以运行 git status、git branch、git fetch、git pull。",
    hint: {
      title: "Playground 已就绪",
      body: "这里先用可控 Git 状态模型模拟基础命令，帮助你把命令和仓库结构对应起来。"
    }
  };
}

export function PlaygroundShell({ initialCommand = "" }: PlaygroundShellProps) {
  const [gitState, setGitState] = useState(createInitialGitState);
  const [input, setInput] = useState(initialCommand);
  const [history, setHistory] = useState<CommandResult[]>(() => [createWelcomeEntry(initialCommand)]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  const viewModel = useMemo(
    () => buildPlaygroundViewModel(gitState, history.at(-1)?.effect),
    [gitState, history]
  );
  const graphViewModel = useMemo(
    () => buildGitGraphViewModel(gitState, history.at(-1)?.effect),
    [gitState, history]
  );

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
    setHistory([createWelcomeEntry(initialCommand)]);
    setCommandHistory([]);
    setHistoryIndex(null);
    setInput(initialCommand);
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      <CommandTerminalPanel
        commandHistory={commandHistory}
        history={history}
        input={input}
        onInputChange={setInput}
        onNavigateHistory={navigateHistory}
        onReset={resetPlayground}
        onRunCommand={runCommand}
      />

      <div className="grid gap-4">
        <GitWorkflowPanel viewModel={viewModel} />
        <GitGraphPanel graph={graphViewModel} />
        <div className="motion-fade-up motion-delay-2 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <LearningPathPanel
            activeTask={viewModel.activeTask}
            checklist={viewModel.learningChecklist}
            scenario={viewModel.learningScenario}
            onFillCommand={setInput}
          />
          <RepositoryInsightPanel gitState={gitState} viewModel={viewModel} />
        </div>
      </div>
    </section>
  );
}
