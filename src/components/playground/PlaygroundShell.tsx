const zones = ["工作目录", "暂存区", "本地仓库", "远程仓库"];

export function PlaygroundShell() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm font-semibold text-cyan-300">模拟终端</p>
        <pre className="mt-4 min-h-[480px] whitespace-pre-wrap rounded-lg bg-black p-4 text-sm text-green-300">
          {`$ git init
$ git add .
$ git commit -m "first commit"
$ _`}
        </pre>
      </div>

      <div className="grid gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm font-semibold text-cyan-300">可视化面板</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {zones.map((label) => (
              <div key={label} className="rounded-lg border border-slate-700 p-4 text-center">
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm font-semibold text-cyan-300">仓库状态</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>HEAD: main</li>
            <li>暂存区: 1 个文件</li>
            <li>工作目录: clean</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

