# Helpdesk

AI-powered ticket management system. See [project-scope.md](project-scope.md), [tech-stack.md](tech-stack.md) and [implementation-plan.md](implementation-plan.md).

## Stack

- **Runtime / package manager:** [Bun](https://bun.sh) (workspaces, test runner, `--watch`)
- **API:** Express 5 + TypeScript (`apps/server`)
- **Web:** React 19 + Vite 8 + Tailwind CSS v4 (`apps/web`)
- **Shared:** types and enums used by both (`packages/shared`)

```
apps/server      Express API (runs on Bun, port 3000)
apps/web         React SPA (Vite dev server, port 5173, proxies /api → 3000)
packages/shared  Shared TS types/enums (imported as @helpdesk/shared)
```

## Getting started

```sh
bun install
cp .env.example .env    # optional
bun run dev             # starts API + web together
```

Open http://localhost:5173. The page calls `/api/health` through the Vite proxy.

## Scripts (run from the repo root)

| Command | What it does |
|---|---|
| `bun run dev` | API (watch mode) + Vite dev server |
| `bun run dev:server` / `dev:web` | Run one side only |
| `bun test` | Run tests with Bun's test runner |
| `bun run typecheck` | `tsc --noEmit` in every workspace |
| `bun run build` | Typecheck + production build of the web app → `apps/web/dist` |
| `bun run start` | Start the API without watch |

## Adding dependencies

```sh
bun add <pkg> --cwd apps/server
bun add <pkg> --cwd apps/web
```
