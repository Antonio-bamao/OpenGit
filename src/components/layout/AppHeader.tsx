import Link from "next/link";

const links = [
  { href: "/", label: "首页" },
  { href: "/scenarios", label: "场景" },
  { href: "/playground", label: "Playground" }
];

// Git logo by Jason Long, CC BY 3.0: https://git-scm.com/community/logos
function GitLogoMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 97 97"
      className="h-8 w-8 shrink-0"
    >
      <path
        fill="#F05133"
        d="M92.71 44.41 52.59 4.29a6.84 6.84 0 0 0-9.68 0l-8.33 8.33 10.57 10.57a8.12 8.12 0 0 1 10.29 10.36l10.19 10.19a8.13 8.13 0 1 1-4.88 4.59l-9.5-9.5v25a8.13 8.13 0 1 1-6.69-.24V38.36a8.13 8.13 0 0 1-4.42-10.65L29.72 17.29 4.29 42.72a6.84 6.84 0 0 0 0 9.68l40.12 40.12a6.84 6.84 0 0 0 9.68 0l38.62-38.62a6.84 6.84 0 0 0 0-9.68Z"
      />
    </svg>
  );
}

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 text-sm text-slate-700 md:px-6">
        <Link href="/" className="inline-flex min-w-0 items-center gap-3 font-semibold text-slate-950">
          <span className="grid h-8 w-8 shrink-0 place-items-center" aria-hidden="true">
            <GitLogoMark />
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
