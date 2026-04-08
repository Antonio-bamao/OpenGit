import { statusLabels, type PlaygroundViewModel } from "@/lib/git-sim/playground-view-model";
import type { GitState } from "@/lib/git-sim/types";
import { statusClasses } from "./panel-styles";

interface RepositoryInsightPanelProps {
  gitState: GitState;
  viewModel: PlaygroundViewModel;
}

export function RepositoryInsightPanel({ gitState, viewModel }: RepositoryInsightPanelProps) {
  return (
    <>
      <p className="text-sm font-semibold text-emerald-700">仓库状态</p>
      <dl className="mt-4 grid overflow-hidden border-y border-slate-200 text-sm text-slate-600 sm:grid-cols-4 sm:border-x">
        <div className="border-b border-slate-200 p-3 sm:border-b-0 sm:border-r">
          <dt className="text-xs font-semibold text-slate-500">Initialized</dt>
          <dd className="mt-1 font-mono text-slate-950">{gitState.initialized ? "yes" : "no"}</dd>
        </div>
        <div className="border-b border-slate-200 p-3 sm:border-b-0 sm:border-r">
          <dt className="text-xs font-semibold text-slate-500">HEAD</dt>
          <dd className="mt-1 truncate font-mono text-slate-950">{gitState.head ?? "(no commits)"}</dd>
        </div>
        <div className="p-3">
          <dt className="text-xs font-semibold text-slate-500">Branch</dt>
          <dd className="mt-1 font-mono text-slate-950">{gitState.branch}</dd>
        </div>
        <div className="border-t border-slate-200 p-3 sm:border-l sm:border-t-0">
          <dt className="text-xs font-semibold text-slate-500">Remote</dt>
          <dd className="mt-1 font-mono text-slate-950">{viewModel.syncStatus.summary}</dd>
        </div>
      </dl>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-emerald-700">引用指针</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)_28px_minmax(0,1fr)]">
          <div className="rounded-md border border-slate-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold text-slate-500">HEAD</p>
            <p className="mt-1 font-mono text-sm text-slate-950">{gitState.branch}</p>
          </div>
          <div className="hidden self-center border-t-2 border-slate-300 md:block" aria-hidden="true" />
          <div className="rounded-md border border-slate-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold text-slate-500">branch</p>
            <p className="mt-1 font-mono text-sm text-slate-950">{viewModel.headCommit}</p>
          </div>
          <div className="hidden self-center border-t-2 border-slate-300 md:block" aria-hidden="true" />
          <div className="rounded-md border border-slate-200 bg-white px-3 py-3">
            <p className="text-xs font-semibold text-slate-500">origin/{gitState.branch}</p>
            <p className="mt-1 font-mono text-sm text-slate-950">{viewModel.remoteHead}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            {viewModel.syncStatus.branchLabel}
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
            ahead {viewModel.syncStatus.ahead}
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
            behind {viewModel.syncStatus.behind}
          </span>
          {gitState.branches.map((branch) => (
            <span
              key={branch}
              className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                branch === gitState.branch
                  ? "border-[var(--git-orange)] bg-white text-slate-950"
                  : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              {branch === gitState.branch ? "HEAD -> " : ""}
              {branch}
            </span>
          ))}
        </div>
        {viewModel.remoteRefs.length > 0 ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold text-slate-500">远端分支</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {viewModel.remoteRefs.map((ref) => (
                <span
                  key={ref.name}
                  className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
                    ref.isCurrentBranch
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="font-mono">{ref.name}</span>
                  <span className="ml-1 font-mono opacity-70">{ref.target}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200">
        {gitState.files.map((file) => (
          <div
            key={file.path}
            className="flex items-center justify-between gap-3 bg-white px-3 py-3 text-sm transition duration-200 hover:bg-slate-50"
          >
            <span className="min-w-0 truncate font-mono text-slate-700">{file.path}</span>
            <span
              className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${statusClasses[file.status]}`}
            >
              {statusLabels[file.status]}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
