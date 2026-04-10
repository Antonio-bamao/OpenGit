"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { searchGroupedCommandDocs } from "@/lib/git-docs";

export function DocsExplorer() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const groups = searchGroupedCommandDocs(deferredQuery);
  const teachingNoteClassMap = {
    conflict: {
      container: "border-rose-200 bg-rose-50/80",
      eyebrow: "text-rose-700",
      title: "text-rose-900"
    },
    release: {
      container: "border-sky-200 bg-sky-50/80",
      eyebrow: "text-sky-700",
      title: "text-sky-900"
    },
    worktree: {
      container: "border-amber-200 bg-amber-50/80",
      eyebrow: "text-amber-700",
      title: "text-amber-900"
    }
  } as const;

  return (
    <>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label htmlFor="docs-search" className="text-sm font-semibold text-emerald-700">
          搜索命令
        </label>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            id="docs-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="试试 pull、worktree、发布、冲突..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 md:max-w-md"
          />
          <p className="text-sm text-slate-500">
            {deferredQuery.trim().length === 0
              ? "支持按命令名、语法、简介和用途过滤。"
              : `当前匹配 ${groups.reduce((count, group) => count + group.items.length, 0)} 条命令。`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {groups.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:border-emerald-300 hover:text-emerald-800"
          >
            {group.label}
          </a>
        ))}
      </div>

      {groups.length > 0 ? (
        <div className="mt-8 space-y-10">
          {groups.map((group, groupIndex) => (
            <section
              key={group.id}
              id={group.id}
              className={`motion-fade-up ${groupIndex > 0 ? "motion-delay-1" : ""}`}
            >
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-emerald-700">{group.label}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">{group.description}</h2>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {group.items.map((doc) => (
                  <article
                    key={doc.id}
                    id={doc.command.replace(/\s+/g, "-")}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
                  >
                    <p className="font-mono text-sm font-semibold text-emerald-700">{doc.command}</p>
                    <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                      {doc.syntax}
                    </p>
                    <p className="mt-4 leading-7 text-slate-600">{doc.summary}</p>

                    {doc.practiceTeachingNote ? (
                      <div
                        className={`mt-4 rounded-lg border p-4 text-sm ${
                          teachingNoteClassMap[doc.practiceTeachingNote.tone].container
                        }`}
                      >
                        <p
                          className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            teachingNoteClassMap[doc.practiceTeachingNote.tone].eyebrow
                          }`}
                        >
                          {doc.practiceTeachingNote.eyebrow}
                        </p>
                        <p
                          className={`mt-2 font-semibold ${teachingNoteClassMap[doc.practiceTeachingNote.tone].title}`}
                        >
                          {doc.practiceTeachingNote.title}
                        </p>
                        <p className="mt-2 leading-6 text-slate-700">{doc.practiceTeachingNote.body}</p>
                      </div>
                    ) : null}

                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {doc.useCases.map((useCase) => (
                        <li key={useCase} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                          {useCase}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {doc.practiceScenario ? (
                        <Link
                          href={doc.practiceScenario.href}
                          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                        >
                          练这个场景
                        </Link>
                      ) : null}
                      <Link
                        href={doc.detailHref}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                      >
                        查看详情
                      </Link>
                      <Link
                        href={doc.playgroundHref}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                      >
                        在 Playground 试试
                      </Link>
                      <span className="font-mono text-xs text-slate-500">{doc.playgroundCommand}</span>
                    </div>
                    {doc.practiceScenario ? (
                      <p className="mt-3 text-xs text-slate-500">推荐练习：{doc.practiceScenario.title}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="motion-fade-up mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">没有找到匹配的命令</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            可以换个关键词试试，比如 `pull`、`reset`、`发布`、`冲突` 或 `worktree`。
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["回滚", "远程协作", "热修复", "撤销暂存"].map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => setQuery(keyword)}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition duration-200 hover:border-emerald-300 hover:bg-white hover:text-emerald-800"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
