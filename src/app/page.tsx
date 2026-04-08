import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />
      <section className="mx-auto flex max-w-5xl flex-col justify-center px-6 py-16 md:min-h-[calc(100vh-73px)]">
        <p className="text-sm font-semibold uppercase text-cyan-300">OpenGit</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          在可操作的终端里学会 Git
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          输入 Git 命令，实时观察工作目录、暂存区、本地仓库和远程仓库的状态变化。
        </p>
        <div className="mt-8">
          <Link
            href="/playground"
            className="inline-flex rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
          >
            进入 Playground
          </Link>
        </div>
      </section>
    </main>
  );
}

