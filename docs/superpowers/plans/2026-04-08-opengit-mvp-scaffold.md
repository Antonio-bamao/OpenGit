# OpenGit MVP Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first runnable OpenGit MVP application scaffold with a Next.js App Router shell and a `/playground` page ready for terminal, Git state, and visualization work.

**Architecture:** Start with the smallest stable application shell: Next.js routes, global styling, a landing page, and a static Playground layout. Keep behavior-heavy Git simulation out of this scaffold pass; later tasks will add tested parser/state modules before wiring interactive UI.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, pnpm, ESLint.

---

## File Structure

- Create: `package.json` for scripts and dependencies.
- Create: `pnpm-lock.yaml` through dependency installation.
- Create: `next.config.mjs`, `tsconfig.json`, `.eslintrc.json`, `postcss.config.mjs`, `tailwind.config.ts`.
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/playground/page.tsx`, `src/app/globals.css`.
- Create: `src/components/layout/AppHeader.tsx` for shared navigation.
- Create: `src/components/playground/PlaygroundShell.tsx` for the static MVP workspace.
- Modify: `README.md` to add local development commands.
- Modify: `.context/current-status.md` and `.context/work-log.md` after verification.

## Task 1: Commit Repository Baseline

**Files:**
- Add: `.context/*`
- Add: `.gitignore`
- Add: `README.md`
- Add: `OpenGit — 全局计划落地方案.md`
- Add: `docs/superpowers/plans/2026-04-08-opengit-mvp-scaffold.md`

- [x] **Step 1: Check working tree**

Run: `git status --short`

Expected: only initial project files are untracked.

- [x] **Step 2: Stage baseline files**

Run: `git add .context .gitignore README.md "OpenGit — 全局计划落地方案.md" docs/superpowers/plans/2026-04-08-opengit-mvp-scaffold.md`

Expected: command exits with status 0.

- [x] **Step 3: Commit baseline**

Run: `git commit -m "chore: initialize opengit project context"`

Expected: a root commit is created.

## Task 2: Scaffold Next.js App

Status: skipped in favor of Task 3 manual scaffold, to keep the project pinned to Next.js 14 and avoid a `create-next-app@latest` version drift.

**Files:**
- Create: `package.json`
- Create: `pnpm-lock.yaml`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `.eslintrc.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/playground/page.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Generate the app scaffold**

Run:

```powershell
pnpm dlx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

Expected: Next.js app files are created in the repository root. If the generator refuses to run because the directory is not empty, use manual file creation in Task 3 instead of forcing overwrite.

- [ ] **Step 2: Verify dependency installation**

Run: `pnpm install`

Expected: dependencies install successfully and `pnpm-lock.yaml` exists.

- [ ] **Step 3: Run baseline lint/build checks**

Run: `pnpm lint`

Expected: lint exits with status 0.

Run: `pnpm build`

Expected: production build exits with status 0.

## Task 3: Manual Scaffold Fallback

Use this task only if Task 2 generator cannot safely run in the non-empty directory.

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `.eslintrc.json`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/playground/page.tsx`
- Create: `src/app/globals.css`

- [x] **Step 1: Create `package.json`**

```json
{
  "name": "opengit",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@types/node": "20.17.10",
    "@types/react": "18.3.18",
    "@types/react-dom": "18.3.5",
    "autoprefixer": "10.4.20",
    "eslint": "8.57.1",
    "eslint-config-next": "14.2.23",
    "next": "14.2.23",
    "postcss": "8.4.49",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "tailwindcss": "3.4.17",
    "typescript": "5.7.2"
  }
}
```

- [x] **Step 2: Create framework config files**

`next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`.eslintrc.json`:

```json
{
  "extends": ["next/core-web-vitals"]
}
```

`postcss.config.mjs`:

```js
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

`tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

export default config;
```

- [x] **Step 3: Create app routes**

`src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenGit",
  description: "Interactive Git and GitHub visualization learning platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`:

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          OpenGit
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          在可操作的终端里学会 Git
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          输入 Git 命令，实时观察工作目录、暂存区、本地仓库和远程仓库的状态变化。
        </p>
        <div className="mt-8">
          <Link
            href="/playground"
            className="inline-flex rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300"
          >
            进入 Playground
          </Link>
        </div>
      </section>
    </main>
  );
}
```

`src/app/playground/page.tsx`:

```tsx
export default function PlaygroundPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 md:p-6">
      <section className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm font-semibold text-cyan-300">模拟终端</p>
          <pre className="mt-4 min-h-[480px] whitespace-pre-wrap rounded-lg bg-black p-4 text-sm text-green-300">
            {`$ git init\n$ git add .\n$ git commit -m "first commit"\n$ _`}
          </pre>
        </div>
        <div className="grid gap-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm font-semibold text-cyan-300">可视化面板</p>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {["工作目录", "暂存区", "本地仓库", "远程仓库"].map((label) => (
                <div key={label} className="rounded-lg border border-slate-700 p-4 text-center">
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm font-semibold text-cyan-300">仓库状态</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>HEAD: main</li>
              <li>暂存区: 1 个文件</li>
              <li>工作目录: clean</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
```

`src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}
```

- [x] **Step 4: Install dependencies**

Run: `pnpm install`

Expected: dependencies install successfully and `pnpm-lock.yaml` is created.

- [x] **Step 5: Verify**

Run: `pnpm lint`

Expected: lint exits with status 0.

Run: `pnpm build`

Expected: production build exits with status 0.

## Task 4: Extract MVP Layout Components

**Files:**
- Create: `src/components/layout/AppHeader.tsx`
- Create: `src/components/playground/PlaygroundShell.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/playground/page.tsx`

- [x] **Step 1: Create `AppHeader`**

```tsx
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
```

- [x] **Step 2: Create `PlaygroundShell`**

```tsx
const zones = ["工作目录", "暂存区", "本地仓库", "远程仓库"];

export function PlaygroundShell() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm font-semibold text-cyan-300">模拟终端</p>
        <pre className="mt-4 min-h-[480px] whitespace-pre-wrap rounded-lg bg-black p-4 text-sm text-green-300">
          {`$ git init\n$ git add .\n$ git commit -m "first commit"\n$ _`}
        </pre>
      </div>
      <div className="grid gap-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm font-semibold text-cyan-300">可视化面板</p>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {zones.map((label) => (
              <div key={label} className="rounded-lg border border-slate-700 p-4 text-center">
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm font-semibold text-cyan-300">仓库状态</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>HEAD: main</li>
            <li>暂存区: 1 个文件</li>
            <li>工作目录: clean</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [x] **Step 3: Use shared components in routes**

`src/app/page.tsx` should import `AppHeader` and render it above the landing section.

`src/app/playground/page.tsx` should import `AppHeader` and `PlaygroundShell`, then render:

```tsx
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
```

- [x] **Step 4: Verify and commit**

Run: `pnpm lint`

Expected: lint exits with status 0.

Run: `pnpm build`

Expected: build exits with status 0.

Run:

```powershell
git add package.json pnpm-lock.yaml next.config.mjs tsconfig.json .eslintrc.json postcss.config.mjs tailwind.config.ts src README.md .context docs/superpowers/plans/2026-04-08-opengit-mvp-scaffold.md
git commit -m "feat: scaffold opengit mvp app"
```

Expected: scaffold commit is created.

## Self-Review

- Spec coverage: Covers Phase 1 from `.context/master-plan.md`: Next.js App Router scaffold, Tailwind, TypeScript, base home page, `/playground` route shell, and structure for later terminal/visualization modules.
- Scope limits: Does not implement parser, Git state, xterm.js, isomorphic-git, auth, database, Docker sandbox, MDX docs, or GitHub teaching modules. Those belong to later plans.
- Placeholder scan: No unfinished marker or unspecified implementation steps remain.
- Type consistency: Component names and import paths are consistent across planned route files.
