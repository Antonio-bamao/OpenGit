"use client";

import { useEffect, useState } from "react";

const commands = [
  "git init",
  "git status",
  "git add .",
  'git commit -m "first commit"',
  "git log --oneline"
];

type TypingPhase = "typing" | "holding" | "deleting";

export function GitCommandTypewriter() {
  const [commandIndex, setCommandIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<TypingPhase>("typing");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDisplayed(commands[0]);
      return;
    }

    const command = commands[commandIndex];
    const delay = phase === "holding" ? 1200 : phase === "typing" ? 46 : 24;

    const timer = window.setTimeout(() => {
      if (phase === "typing") {
        if (displayed.length < command.length) {
          setDisplayed(command.slice(0, displayed.length + 1));
          return;
        }
        setPhase("holding");
        return;
      }

      if (phase === "holding") {
        setPhase("deleting");
        return;
      }

      if (displayed.length > 0) {
        setDisplayed(command.slice(0, displayed.length - 1));
        return;
      }

      setCommandIndex((index) => (index + 1) % commands.length);
      setPhase("typing");
    }, delay);

    return () => window.clearTimeout(timer);
  }, [commandIndex, displayed, phase]);

  return (
    <div className="motion-fade-up motion-delay-1 mt-6 max-w-xl rounded-lg border border-slate-200 bg-white/90 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <p className="text-xs font-semibold text-slate-500">常用命令</p>
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-[var(--git-orange)]" />
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="h-2 w-2 rounded-full bg-slate-300" />
        </div>
      </div>
      <p className="mt-3 min-h-7 overflow-hidden whitespace-nowrap font-mono text-base font-semibold text-slate-950 sm:text-lg">
        <span className="text-[var(--git-orange)]">$</span>{" "}
        <span>{displayed}</span>
        <span
          className="typewriter-caret ml-1 inline-block h-5 w-2 translate-y-0.5 bg-[var(--git-orange)]"
          aria-hidden="true"
        />
      </p>
    </div>
  );
}
