import type { GitFileStatus } from "@/lib/git-sim/types";

export const statusClasses: Record<GitFileStatus, string> = {
  untracked: "border-rose-200 bg-rose-50 text-rose-700",
  modified: "border-amber-200 bg-amber-50 text-amber-800",
  staged: "border-emerald-200 bg-emerald-50 text-emerald-800",
  tracked: "border-slate-200 bg-slate-100 text-slate-700"
};
