import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  getAllCommandDocSlugs,
  getCommandDocBySlug,
  getFeaturedScenarioMeta,
  getNextFeaturedScenarioForCommandDoc,
  getGroupedCommandDocs,
  getPracticeGuidanceForCommandDoc
} from "@/lib/git-docs";

interface CommandDocDetailPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return getAllCommandDocSlugs().map((slug) => ({ slug }));
}

export default function CommandDocDetailPage({ params }: CommandDocDetailPageProps) {
  const doc = getCommandDocBySlug(params.slug);

  if (!doc) {
    notFound();
  }

  const practiceGuidance = getPracticeGuidanceForCommandDoc(doc.id);
  const practicePriority = practiceGuidance ? getFeaturedScenarioMeta(practiceGuidance.scenario.id) : undefined;
  const nextFeaturedScenario = getNextFeaturedScenarioForCommandDoc(doc.id);
  const siblingCommands =
    getGroupedCommandDocs()
      .find((group) => group.id === doc.category)
      ?.items.filter((item) => item.id !== doc.id) ?? [];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader />
      <section className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <div className="motion-fade-up">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/docs" className="transition duration-200 hover:text-emerald-800">
              Docs
            </Link>
            <span>/</span>
            <span>{doc.command}</span>
          </div>

          <p className="mt-4 text-sm font-semibold text-emerald-700">{doc.command}</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 md:text-5xl">{doc.syntax}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">{doc.summary}</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
          <article className="motion-fade-up rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700">适用场景</p>
            <ul className="mt-4 space-y-2">
              {doc.useCases.map((useCase) => (
                <li key={useCase} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                  {useCase}
                </li>
              ))}
            </ul>

            {practiceGuidance ? (
              <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Recommended Flow
                </p>
                {practicePriority ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        practicePriority.emphasis === "primary"
                          ? "border border-emerald-200 bg-white text-emerald-800"
                          : "border border-emerald-200 bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {practicePriority.badge}
                    </span>
                  </div>
                ) : null}
                <h2 className="mt-3 text-lg font-semibold text-slate-950">
                  适合从「{practiceGuidance.scenario.title}」进入
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{practiceGuidance.scenario.summary}</p>

                <div className="mt-4 rounded-md border border-emerald-200 bg-white px-3 py-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-950">
                    第 {practiceGuidance.step.stepNumber} / {practiceGuidance.step.totalSteps} 步：
                    {practiceGuidance.step.title}
                  </p>
                  <p className="mt-2 leading-6 text-slate-600">{practiceGuidance.step.goal}</p>
                  <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                    {practiceGuidance.step.command}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={practiceGuidance.step.href}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                  >
                    直接练这一步
                  </Link>
                  <Link
                    href="/scenarios"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                  >
                    先看场景总览
                  </Link>
                </div>
              </div>
            ) : null}

            {nextFeaturedScenario ? (
              <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Next Path</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-950">练完这条后，建议继续这个场景</h2>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      nextFeaturedScenario.emphasis === "primary"
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    {nextFeaturedScenario.badge}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-emerald-700">{nextFeaturedScenario.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{nextFeaturedScenario.summary}</p>
                <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                  {nextFeaturedScenario.primaryCommand}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={nextFeaturedScenario.playgroundHref}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                  >
                    去下一个场景
                  </Link>
                  {nextFeaturedScenario.primaryDoc ? (
                    <Link
                      href={nextFeaturedScenario.primaryDoc.detailHref}
                      className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                    >
                      先看下一条命令
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Try It</p>
              <p className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-700">
                {doc.playgroundCommand}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={doc.playgroundHref}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                >
                  在 Playground 试试
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                >
                  返回命令总览
                </Link>
              </div>
            </div>
          </article>

          <aside className="motion-fade-up motion-delay-1 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-emerald-700">同分类命令</p>
            <div className="mt-4 space-y-2">
              {siblingCommands.map((item) => (
                <Link
                  key={item.id}
                  href={item.detailHref}
                  className="block rounded-md border border-slate-200 bg-slate-50 px-3 py-3 transition duration-200 hover:border-emerald-300 hover:bg-white"
                >
                  <p className="font-mono text-sm font-semibold text-slate-900">{item.command}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.summary}</p>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
