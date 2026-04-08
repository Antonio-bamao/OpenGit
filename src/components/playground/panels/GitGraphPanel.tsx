import type { GitGraphViewModel } from "@/lib/git-sim/git-graph-view-model";

interface GitGraphPanelProps {
  graph: GitGraphViewModel;
}

export function GitGraphPanel({ graph }: GitGraphPanelProps) {
  return (
    <div className="motion-fade-up motion-delay-2 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-700">分支图</p>
          <p className="mt-1 text-xs text-slate-500">把 HEAD、branch 和 origin 的指针拆开看</p>
        </div>
        <span className="rounded-md bg-slate-50 px-2.5 py-1 font-mono text-xs font-semibold text-slate-600">
          {graph.currentBranch}
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {graph.nodes.length > 0 ? (
          <ol className="divide-y divide-slate-200">
            {graph.nodes.map((node) => (
              <li key={node.hash} className="grid grid-cols-[64px_minmax(0,1fr)] items-stretch">
                <div className="relative flex items-center justify-center bg-white">
                  <span
                    className="absolute inset-y-0 w-px bg-slate-200"
                    style={{ left: `${20 + node.lane * 16}px` }}
                    aria-hidden="true"
                  />
                  <span
                    className={`relative h-3 w-3 rounded-full border-2 ${
                      node.isHead
                        ? "border-[var(--git-orange)] bg-[var(--git-orange)]"
                        : "border-emerald-500 bg-white"
                    }`}
                    style={{ transform: `translateX(${node.lane * 16}px)` }}
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-slate-950">{node.hash}</span>
                    {node.isHead ? (
                      <span className="rounded-md border border-[var(--git-orange)] bg-white px-2 py-0.5 text-xs font-semibold text-slate-950">
                        HEAD
                      </span>
                    ) : null}
                    {node.refs.map((ref) => (
                      <span
                        key={ref}
                        className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                      >
                        {ref}
                      </span>
                    ))}
                    {node.remoteRefs.map((ref) => (
                      <span
                        key={ref}
                        className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-500"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 truncate text-sm text-slate-600">{node.message}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="px-4 py-6 text-sm text-slate-500">{graph.emptyMessage}</p>
        )}
      </div>
    </div>
  );
}
