import Link from "next/link";

const links = [
  { href: "/", label: "首页" },
  { href: "/playground", label: "Playground" }
];

export function AppHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/95">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-sm text-slate-200 md:px-6">
        <Link href="/" className="font-semibold text-cyan-300">
          OpenGit
        </Link>
        <div className="flex gap-4">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-cyan-300">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

