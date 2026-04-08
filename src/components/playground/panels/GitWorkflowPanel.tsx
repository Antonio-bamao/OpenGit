import { flowLinks, flowZones, type PlaygroundViewModel } from "@/lib/git-sim/playground-view-model";
import { statusClasses } from "./panel-styles";

interface GitWorkflowPanelProps {
  viewModel: PlaygroundViewModel;
}

export function GitWorkflowPanel({ viewModel }: GitWorkflowPanelProps) {
  return (
    <div className="motion-fade-up motion-delay-1">
      <p className="text-sm font-semibold text-emerald-700">可视化面板</p>
      <div className="mt-4 grid items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_32px_minmax(0,1fr)_32px_minmax(0,1fr)_32px_minmax(0,1fr)]">
        {flowZones.map((zone, index) => (
          <div key={zone.key} className="contents">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 transition duration-200 hover:border-emerald-300 hover:bg-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{zone.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{zone.description}</p>
                </div>
                <span className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-emerald-700 shadow-sm">
                  {viewModel.zoneCounts[zone.key]}
                </span>
              </div>

              <div className="mt-4 min-h-28 space-y-2">
                {viewModel.flowItems[zone.key].length > 0 ? (
                  viewModel.flowItems[zone.key].map((item) => (
                    <div
                      key={item.id}
                      className={`flow-chip rounded-md border bg-white px-2.5 py-2 text-xs shadow-sm ${
                        statusClasses[item.status]
                      }`}
                    >
                      <p className="truncate font-mono font-semibold">{item.label}</p>
                      <p className="mt-1 truncate opacity-75">{item.meta}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-md border border-dashed border-slate-300 px-2.5 py-3 text-center text-xs leading-5 text-slate-400">
                    等待流入
                  </p>
                )}
              </div>
            </div>
            {index < flowLinks.length ? (
              <div
                className={`flow-link hidden self-center md:block ${
                  viewModel.isFlowActive(flowLinks[index].from, flowLinks[index].to)
                    ? "flow-link-active"
                    : ""
                }`}
                aria-hidden="true"
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
