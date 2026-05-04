# Todo App

A real-time todo app built with TanStack Start + Electric SQL. Create, complete, and delete todos — changes sync instantly across all open tabs and clients via Electric.

## Features

- Add todos with an input field (Enter or click Add)
- Toggle completion with a checkbox
- Delete todos
- Filter by All / Active / Completed
- Live item count

## Local Dev Setup

```bash
pnpm install
pnpm dev
```

The dev server starts on `http://localhost:5174`.

You need a running Postgres instance and Electric SQL service. Copy `.env.example` to `.env` and fill in the values, then run migrations:

```bash
pnpm generate
pnpm migrate
```

## Required Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `ELECTRIC_SOURCE_ID` | Electric Cloud source ID |
| `ELECTRIC_SOURCE_SECRET` | Electric Cloud auth secret |
| `ELECTRIC_URL` | Electric service URL (defaults to `http://localhost:3000`) |

## Stack

- **Framework**: TanStack Start (React, file-based routing, SSR)
- **Sync**: Electric SQL → TanStack DB → `useLiveQuery`
- **Database**: Postgres (Drizzle ORM)
- **Styling**: Tailwind CSS + Radix Themes
