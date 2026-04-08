import { AppHeader } from "@/components/layout/AppHeader";
import { PlaygroundShell } from "@/components/playground/PlaygroundShell";

export default function PlaygroundPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <AppHeader />
      <div className="p-4 md:p-6">
        <PlaygroundShell />
      </div>
    </main>
  );
}

