import Link from "next/link";
import type { LearningChecklistItem, LearningScenario } from "@/lib/git-sim/learning-guide";
import { getDocsHrefForCommandInput, type CommandDoc } from "@/lib/git-docs";

interface LearningPathPanelProps {
  activeTask?: LearningChecklistItem;
  activeTaskDoc?: CommandDoc;
  checklist: LearningChecklistItem[];
  scenario: LearningScenario;
  onFillCommand: (command: string) => void;
}

export function LearningPathPanel({
  activeTask,
  activeTaskDoc,
  checklist,
  scenario,
  onFillCommand
}: LearningPathPanelProps) {
  const docsHref = activeTask ? getDocsHrefForCommandInput(activeTask.command) : "/docs";
  const relatedPracticeScenario =
    activeTaskDoc?.practiceScenario && activeTaskDoc.practiceScenario.id !== scenario.id
      ? activeTaskDoc.practiceScenario
      : undefined;

  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-700">{scenario.title}</p>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{scenario.summary}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            进度 {scenario.progressLabel}
          </p>
        </div>
        {activeTask ? (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={docsHref}
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition duration-200 hover:border-emerald-500 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >
              查看当前命令解释
            </Link>
            <button
              type="button"
              onClick={() => onFillCommand(activeTask.command)}
              className="min-h-9 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition duration-200 hover:border-emerald-500 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >
              填入下一步
            </button>
          </div>
        ) : null}
      </div>
      {activeTask && activeTaskDoc ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 text-sm text-slate-700">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">当前命令</p>
              <p className="mt-2 font-mono text-sm font-semibold text-slate-950">{activeTaskDoc.syntax}</p>
              <p className="mt-2 max-w-2xl leading-6 text-slate-600">{activeTaskDoc.summary}</p>
            </div>
            {relatedPracticeScenario ? (
              <Link
                href={relatedPracticeScenario.href}
                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
              >
                去相关场景
              </Link>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1">
              命令：{activeTaskDoc.command}
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">
              推荐练习：{activeTaskDoc.practiceScenario?.title ?? "当前 Playground"}
            </span>
          </div>
        </div>
      ) : null}
      <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-2">
        <p>
          <span className="font-semibold text-slate-950">目标：</span>
          {scenario.objective}
        </p>
        <p>
          <span className="font-semibold text-slate-950">验收：</span>
          {scenario.successCriteria}
        </p>
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
            <p className="mt-2 text-[11px] leading-4 opacity-75">{item.goal}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
