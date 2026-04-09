import { AppHeader } from "@/components/layout/AppHeader";
import { DocsExplorer } from "@/components/docs/DocsExplorer";
import { DocsScenarioQuickstart } from "@/components/docs/DocsScenarioQuickstart";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="motion-fade-up max-w-3xl">
          <p className="text-sm font-semibold text-emerald-700">Docs</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 md:text-5xl">
            最小命令参考，从查阅到动手
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            先用轻量命令卡理解语法和使用场景，再一键跳回 Playground 亲手练。
          </p>
        </div>
        <DocsScenarioQuickstart />
        <DocsExplorer />
      </section>
    </main>
  );
}
