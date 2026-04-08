import Link from "next/link";
import { GitCommandTypewriter } from "@/components/home/GitCommandTypewriter";

const steps = [
  { label: "工作区", caption: "编辑文件", x: "left-[8%]", y: "top-[58%]" },
  { label: "暂存区", caption: "git add", x: "left-[35%]", y: "top-[34%]" },
  { label: "本地仓库", caption: "git commit", x: "left-[64%]", y: "top-[50%]" },
  { label: "远端仓库", caption: "同步协作", x: "left-[78%]", y: "top-[18%]" }
];

export function ThreeDGitIntro() {
  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200 bg-white">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:56px_56px]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(248,250,252,0.94))]" />

      <div className="mx-auto grid min-h-[calc(100dvh-73px)] max-w-7xl items-center gap-10 px-4 py-14 md:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:py-16">
        <div className="motion-fade-up max-w-2xl">
          <p className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
            OpenGit Playground
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
            把 <span className="text-[var(--git-orange)]">Git</span> 变成可以触摸的空间
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
            输入命令，观察文件从工作区进入暂存区，再沉淀为提交历史。每一步都有状态反馈，不再靠死记硬背。
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/playground"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >
              进入 Playground
            </Link>
            <a
              href="#workflow"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-500 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >
              查看学习路径
            </a>
          </div>
        </div>

        <div className="scene-stage motion-delay-1 relative min-h-[420px] w-full md:min-h-[520px]">
          <div className="scene-plane absolute left-1/2 top-1/2 h-[360px] w-[520px] max-w-[88vw] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.22)]">
            <div className="absolute inset-0 rounded-lg bg-[linear-gradient(90deg,rgba(15,23,42,0.07)_1px,transparent_1px),linear-gradient(180deg,rgba(15,23,42,0.07)_1px,transparent_1px)] bg-[size:42px_42px]" />

            <div className="trace-flow absolute left-[15%] top-[64%] h-1 w-[30%] origin-left rotate-[-32deg] rounded bg-emerald-500" />
            <div className="trace-flow motion-delay-1 absolute left-[42%] top-[42%] h-1 w-[30%] origin-left rotate-[20deg] rounded bg-emerald-500" />
            <div className="trace-flow motion-delay-2 absolute left-[68%] top-[48%] h-1 w-[18%] origin-left rotate-[-58deg] rounded bg-emerald-500" />

            {steps.map((step, index) => (
              <div
                key={step.label}
                className={`absolute ${step.x} ${step.y} w-32 rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-[0_18px_34px_rgba(15,23,42,0.18)]`}
              >
                <div
                  className={`soft-pulse mb-3 h-4 w-4 rounded-full ${
                    index === 0
                      ? "bg-slate-900"
                      : index === 1
                        ? "bg-emerald-500"
                        : index === 2
                          ? "bg-slate-700"
                          : "bg-teal-700"
                  }`}
                />
                <p className="text-sm font-semibold text-slate-950">{step.label}</p>
                <p className="mt-1 text-xs text-slate-500">{step.caption}</p>
              </div>
            ))}

            <div className="absolute left-[12%] top-[18%] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 shadow-[0_18px_34px_rgba(15,23,42,0.14)]">
              <p className="text-xs font-semibold text-slate-500">HEAD</p>
              <p className="mt-1 font-mono text-sm text-slate-950">main · c000001</p>
            </div>
          </div>
          <GitCommandTypewriter className="absolute inset-x-4 bottom-8 z-10 mx-auto max-w-[520px]" />
        </div>
      </div>
    </section>
  );
}
