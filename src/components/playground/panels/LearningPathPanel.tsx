import type { LearningChecklistItem } from "@/lib/git-sim/learning-guide";

interface LearningPathPanelProps {
  activeTask?: LearningChecklistItem;
  checklist: LearningChecklistItem[];
  onFillCommand: (command: string) => void;
}

export function LearningPathPanel({ activeTask, checklist, onFillCommand }: LearningPathPanelProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-emerald-700">任务路线</p>
        {activeTask ? (
          <button
            type="button"
            onClick={() => onFillCommand(activeTask.command)}
            className="min-h-9 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition duration-200 hover:border-emerald-500 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            填入下一步
          </button>
        ) : null}
      </div>
      <ol className="mt-3 grid gap-2 sm:grid-cols-5">
        {checklist.map((item, index) => (
          <li
            key={item.id}
            className={`rounded-lg border px-3 py-3 text-xs transition duration-200 ${
              item.completed
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : item.id === activeTask?.id
                  ? "border-[var(--git-orange)] bg-white text-slate-950 shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            <p className="font-mono font-semibold">{String(index + 1).padStart(2, "0")}</p>
            <p className="mt-2 font-semibold">{item.title}</p>
            <p className="mt-2 truncate font-mono opacity-75">{item.command}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
