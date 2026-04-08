import type { CommandResult } from "@/lib/git-sim/types";

interface CommandTerminalPanelProps {
  commandHistory: string[];
  history: CommandResult[];
  input: string;
  onInputChange: (value: string) => void;
  onNavigateHistory: (direction: "up" | "down") => void;
  onReset: () => void;
  onRunCommand: (command: string) => void;
}

export function CommandTerminalPanel({
  commandHistory,
  history,
  input,
  onInputChange,
  onNavigateHistory,
  onReset,
  onRunCommand
}: CommandTerminalPanelProps) {
  return (
    <div className="motion-fade-up rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-700">模拟终端</p>
          <p className="mt-1 text-xs text-slate-500">支持方向键回看命令历史</p>
        </div>
        <button
          type="button"
          onClick={onReset}
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
            onRunCommand(input);
          }}
        >
          <span className="text-slate-400">$</span>
          <input
            aria-label="输入 Git 命令"
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowUp") {
                event.preventDefault();
                onNavigateHistory("up");
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                onNavigateHistory("down");
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none placeholder:text-slate-400"
            placeholder="git init"
          />
        </form>
      </div>
    </div>
  );
}
