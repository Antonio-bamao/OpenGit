import Link from "next/link";
import type { LearningChecklistItem, LearningScenario } from "@/lib/git-sim/learning-guide";
import { getDocsHrefForCommandInput, type CommandDoc, type FeaturedDocScenario } from "@/lib/git-docs";
import type { ScenarioTransitionCallout } from "@/lib/git-sim/playground-view-model";

interface LearningPathPanelProps {
  activeTask?: LearningChecklistItem;
  activeTaskDoc?: CommandDoc;
  nextTask?: LearningChecklistItem;
  nextTaskDoc?: CommandDoc;
  upcomingNextScenario?: FeaturedDocScenario;
  upcomingNextScenarioCallout?: ScenarioTransitionCallout;
  completionNextScenario?: FeaturedDocScenario;
  completionNextScenarioCallout?: ScenarioTransitionCallout;
  checklist: LearningChecklistItem[];
  scenario: LearningScenario;
  onFillCommand: (command: string) => void;
}

export function LearningPathPanel({
  activeTask,
  activeTaskDoc,
  nextTask,
  nextTaskDoc,
  upcomingNextScenario,
  upcomingNextScenarioCallout,
  completionNextScenario,
  completionNextScenarioCallout,
  checklist,
  scenario,
  onFillCommand
}: LearningPathPanelProps) {
  const docsHref = activeTask ? getDocsHrefForCommandInput(activeTask.command) : "/docs";
  const relatedPracticeScenario =
    activeTaskDoc?.practiceScenario && activeTaskDoc.practiceScenario.id !== scenario.id
      ? activeTaskDoc.practiceScenario
      : undefined;
  const activePracticeBadgeClass =
    activeTaskDoc?.practiceScenario?.emphasis === "primary"
      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border border-slate-200 bg-slate-50 text-slate-500";
  const nextPracticeScenario = nextTaskDoc?.practiceScenario;
  const nextPracticeIsCurrentScenario = nextPracticeScenario?.id === scenario.id;
  const nextPracticeBadgeClass =
    nextPracticeScenario?.emphasis === "primary"
      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border border-slate-200 bg-slate-50 text-slate-500";
  const teachingNoteClassMap = {
    conflict: {
      container: "border-rose-200 bg-rose-50/80",
      eyebrow: "text-rose-700",
      title: "text-rose-900"
    },
    release: {
      container: "border-sky-200 bg-sky-50/80",
      eyebrow: "text-sky-700",
      title: "text-sky-900"
    },
    worktree: {
      container: "border-amber-200 bg-amber-50/80",
      eyebrow: "text-amber-700",
      title: "text-amber-900"
    }
  } as const;
  const teachingNoteClasses = scenario.teachingNote ? teachingNoteClassMap[scenario.teachingNote.tone] : undefined;

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
      {scenario.teachingNote && teachingNoteClasses ? (
        <div className={`mt-3 rounded-lg border p-4 text-sm ${teachingNoteClasses.container}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${teachingNoteClasses.eyebrow}`}>
            {scenario.teachingNote.eyebrow}
          </p>
          <p className={`mt-2 font-semibold ${teachingNoteClasses.title}`}>{scenario.teachingNote.title}</p>
          <p className="mt-2 leading-6 text-slate-700">{scenario.teachingNote.body}</p>
        </div>
      ) : null}
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
          {activeTaskDoc.practiceScenario?.badge ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className={`rounded-full px-2.5 py-1 ${activePracticeBadgeClass}`}>
                {activeTaskDoc.practiceScenario.badge}
              </span>
            </div>
          ) : null}
          {nextTask && nextTaskDoc ? (
            <div className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-950">做完这一步后，建议先看下一条命令</p>
              <p className="mt-2 font-mono text-sm text-slate-900">{nextTaskDoc.syntax}</p>
              <p className="mt-2 leading-5">{nextTask.goal}</p>
              {nextPracticeScenario ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className={`rounded-full px-2.5 py-1 ${nextPracticeBadgeClass}`}>
                    {nextPracticeScenario.badge ?? "延伸练习"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                    {nextPracticeIsCurrentScenario ? "当前场景" : nextPracticeScenario.title}
                  </span>
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={nextTaskDoc.detailHref}
                  className="inline-flex min-h-8 items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition duration-200 hover:border-emerald-500 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                >
                  看下一条命令解释
                </Link>
                {!nextPracticeIsCurrentScenario && nextPracticeScenario ? (
                  <Link
                    href={nextPracticeScenario.href}
                    className="inline-flex min-h-8 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                  >
                    去相关场景
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => onFillCommand(nextTask.command)}
                  className="min-h-8 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition duration-200 hover:border-emerald-500 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                >
                  预填下一条命令
                </button>
              </div>
            </div>
          ) : null}
          {!nextTask && upcomingNextScenario && upcomingNextScenarioCallout ? (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50/70 px-3 py-3 text-xs text-slate-600">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                {upcomingNextScenarioCallout.eyebrow}
              </p>
              <p className="mt-2 font-semibold text-slate-950">{upcomingNextScenarioCallout.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 ${
                    upcomingNextScenario.emphasis === "primary"
                      ? "border border-emerald-200 bg-white text-emerald-800"
                      : "border border-amber-200 bg-white text-slate-600"
                  }`}
                >
                  {upcomingNextScenario.badge}
                </span>
                <span className="rounded-full border border-amber-200 bg-white px-2.5 py-1">
                  {upcomingNextScenario.title}
                </span>
              </div>
              <p className="mt-3 leading-5 text-slate-600">{upcomingNextScenario.summary}</p>
              <p className="mt-3 rounded-md border border-amber-200 bg-white px-3 py-2 font-mono text-sm text-slate-700">
                {upcomingNextScenario.primaryCommand}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={upcomingNextScenario.playgroundHref}
                  className="inline-flex min-h-8 items-center justify-center rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  {upcomingNextScenarioCallout.primaryActionLabel}
                </Link>
                {upcomingNextScenario.primaryDoc ? (
                  <Link
                    href={upcomingNextScenario.primaryDoc.detailHref}
                    className="inline-flex min-h-8 items-center justify-center rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-xs font-semibold text-slate-700 transition duration-200 hover:border-amber-400 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    {upcomingNextScenarioCallout.secondaryActionLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
      {!activeTask && scenario.isComplete && completionNextScenario && completionNextScenarioCallout ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-slate-700">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {completionNextScenarioCallout.eyebrow}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-slate-950">{completionNextScenarioCallout.title}</p>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                completionNextScenario.emphasis === "primary"
                  ? "border border-emerald-200 bg-white text-emerald-800"
                  : "border border-slate-200 bg-white text-slate-500"
              }`}
            >
              {completionNextScenario.badge}
            </span>
          </div>
          <p className="mt-3 text-sm font-semibold text-emerald-700">{completionNextScenario.title}</p>
          <p className="mt-2 leading-6 text-slate-600">{completionNextScenario.summary}</p>
          <p className="mt-3 rounded-md border border-emerald-200 bg-white px-3 py-2 font-mono text-sm text-slate-700">
            {completionNextScenario.primaryCommand}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href={completionNextScenario.playgroundHref}
              className="inline-flex min-h-9 items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >
              {completionNextScenarioCallout.primaryActionLabel}
            </Link>
            {completionNextScenario.primaryDoc ? (
              <Link
                href={completionNextScenario.primaryDoc.detailHref}
                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition duration-200 hover:border-emerald-500 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
              >
                {completionNextScenarioCallout.secondaryActionLabel}
              </Link>
            ) : null}
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
