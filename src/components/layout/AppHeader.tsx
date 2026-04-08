import Link from "next/link";

const links = [
  { href: "/", label: "首页" },
  { href: "/playground", label: "Playground" }
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 text-sm text-slate-700 md:px-6">
        <Link href="/" className="inline-flex min-w-0 items-center gap-3 font-semibold text-slate-950">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-950 text-xs text-white">
            OG
          </span>
          <span className="truncate">OpenGit</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 font-medium transition duration-200 hover:bg-white hover:text-emerald-800 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
