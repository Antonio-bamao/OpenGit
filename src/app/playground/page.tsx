import { AppHeader } from "@/components/layout/AppHeader";
import { PlaygroundShell } from "@/components/playground/PlaygroundShell";

interface PlaygroundPageProps {
  searchParams?: {
    command?: string;
  };
}

export default function PlaygroundPage({ searchParams }: PlaygroundPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="motion-fade-up mb-6 max-w-3xl">
          <p className="text-sm font-semibold text-emerald-700">Interactive Playground</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950 md:text-5xl">
            一边输入命令，一边看见仓库变化
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            先试试 git init，再执行 git add . 和 git commit -m &quot;first commit&quot;。
          </p>
        </div>
        <PlaygroundShell initialCommand={searchParams?.command ?? ""} />
      </div>
    </main>
  );
}
