import Link from "next/link";
import { getFeaturedDocScenarios } from "@/lib/git-docs";

export function DocsScenarioQuickstart() {
  const scenarios = getFeaturedDocScenarios();

  return (
    <section className="motion-fade-up mt-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold text-emerald-700">Quickstart</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950 md:text-3xl">高频场景，从练习入口开始</h2>
        <p className="mt-3 leading-7 text-slate-600">
          如果你不是先找命令，而是想从真实任务直接进入，这里给你四条最常用的练习路径。
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {scenarios.map((scenario) => (
          <article
            key={scenario.id}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-emerald-700">{scenario.title}</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-950">{scenario.summary}</h3>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                {scenario.id}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">{scenario.objective}</p>
            <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
              {scenario.primaryCommand}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={scenario.playgroundHref}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
              >
                从这个场景开始
              </Link>
              {scenario.primaryDoc ? (
                <Link
                  href={scenario.primaryDoc.detailHref}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                >
                  先看相关命令
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
