import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { getDocsHrefForCommandInput, getFeaturedDocScenarios } from "@/lib/git-docs";
import { scenarioCatalog } from "@/lib/git-sim/scenario-catalog";

export default function ScenariosPage() {
  const featuredScenarioMap = new Map(
    getFeaturedDocScenarios().map((scenario) => [scenario.id, scenario] as const)
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="motion-fade-up max-w-3xl">
          <p className="text-sm font-semibold text-emerald-700">Scenarios</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 md:text-5xl">
            真实开发流程，从场景开始
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            选择一个目标，然后在 Playground 里自己输入命令完成验证。
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            第一次来，建议按“推荐起点 → 协作进阶 → 问题处理 → 历史修复”的顺序往下练。
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {scenarioCatalog.map((scenario, index) => {
            const featuredScenario = featuredScenarioMap.get(scenario.id);

            return (
              <article
                key={scenario.id}
                className={`motion-fade-up rounded-lg border bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] ${
                  featuredScenario?.emphasis === "primary"
                    ? "border-emerald-300 ring-1 ring-emerald-200 hover:border-emerald-400"
                    : "border-slate-200 hover:border-emerald-300"
                } ${index % 2 === 1 ? "motion-delay-1" : ""}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-emerald-700">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-950">{scenario.title}</h2>
                  </div>
                  <span
                    className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                      scenario.status === "ready"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    {scenario.statusLabel}
                  </span>
                </div>

                {featuredScenario ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-2.5 py-1 font-semibold ${
                        featuredScenario.emphasis === "primary"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {featuredScenario.badge}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-semibold text-slate-500">
                      路径 {featuredScenario.pathIndex} / {featuredScenario.pathTotal}
                    </span>
                  </div>
                ) : null}

                <p className="mt-4 leading-7 text-slate-600">{scenario.summary}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{scenario.objective}</p>

                <ol className="mt-5 grid gap-2 sm:grid-cols-2">
                  {scenario.steps.map((step, stepIndex) => (
                    <li
                      key={`${scenario.id}-${step}`}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                    >
                      <span className="font-mono text-xs font-semibold text-slate-400">
                        {String(stepIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="ml-2 font-mono">{step}</span>
                    </li>
                  ))}
                </ol>

                {featuredScenario?.nextScenario ? (
                  <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Next Path</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-950">练完这张后，建议继续下一站</p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          featuredScenario.nextScenario.emphasis === "primary"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border border-slate-200 bg-white text-slate-500"
                        }`}
                      >
                        {featuredScenario.nextScenario.badge}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-emerald-700">
                      {featuredScenario.nextScenario.title}
                    </p>
                    <p className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-700">
                      {featuredScenario.nextScenario.primaryCommand}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Link
                        href={featuredScenario.nextScenario.playgroundHref}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                      >
                        去下一站
                      </Link>
                      {featuredScenario.nextScenario.primaryDoc ? (
                        <Link
                          href={featuredScenario.nextScenario.primaryDoc.detailHref}
                          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                        >
                          先看下一条命令
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {scenario.status === "ready" ? (
                    <Link
                      href={scenario.playgroundHref}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                    >
                      在 Playground 练习
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                      等待命令模型扩展
                    </span>
                  )}
                  <Link
                    href={getDocsHrefForCommandInput(scenario.primaryCommand)}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                  >
                    查看相关命令
                  </Link>
                  <span className="font-mono text-xs text-slate-500">{scenario.primaryCommand}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
