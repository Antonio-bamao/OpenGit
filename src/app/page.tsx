import Link from "next/link";
import { ThreeDGitIntro } from "@/components/home/ThreeDGitIntro";
import { AppHeader } from "@/components/layout/AppHeader";

const workflow = [
  {
    title: "先看见状态",
    body: "工作区、暂存区、本地仓库和远端仓库并排呈现，命令执行后的变化会逐步浮现。"
  },
  {
    title: "再输入命令",
    body: "从 git init、git add、git commit 开始，逐步建立对 Git 数据流的直觉。"
  },
  {
    title: "最后复盘历史",
    body: "提交记录、HEAD 和分支状态会被保留下来，方便对照每一次操作。"
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader />
      <ThreeDGitIntro />

      <section id="workflow" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="motion-fade-up motion-delay-2 max-w-2xl">
          <p className="text-sm font-semibold text-emerald-700">学习路径</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950 md:text-4xl">
            从一条命令到一张结构图
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {workflow.map((item, index) => (
            <article
              key={item.title}
              className={`motion-fade-up rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] ${
                index === 1 ? "motion-delay-1" : index === 2 ? "motion-delay-2" : ""
              }`}
            >
              <p className="font-mono text-sm font-semibold text-emerald-700">
                0{index + 1}
              </p>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>

        <div className="motion-fade-up motion-delay-3 mt-10 flex flex-wrap gap-3">
          <Link
            href="/scenarios"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            选择练习场景
          </Link>
          <Link
            href="/docs"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            查看命令参考
          </Link>
          <Link
            href="/playground"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            开始第一轮模拟
          </Link>
        </div>
      </section>
    </main>
  );
}
