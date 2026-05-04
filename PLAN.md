# Plan: Todo App

A real-time todo app built on TanStack Start + Electric SQL. Users can create, complete, and delete todos, with changes syncing instantly across tabs/clients via Electric.

## User Flows

1. User opens the app and sees all todos (active and completed).
2. User types a title in an input field and presses Enter or clicks "Add" to create a new todo.
3. User clicks a checkbox next to a todo to toggle its completed state.
4. User clicks a delete button on a todo to remove it.
5. User can filter the list by All / Active / Completed using tabs at the top.
6. Counts of remaining active todos are shown at the bottom.

## Data Model

```ts
// src/db/schema.ts
import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

## Key Technical Decisions

- **Sync**: Electric shape proxy at `src/routes/api/todos.ts` syncs the `todos` table to the client. The TanStack DB collection at `src/db/collections/todos.ts` subscribes to the shape.
- **Mutations**: Insert / update / delete go through server API route handlers (`POST /api/todos`, `PUT /api/todos`, `DELETE /api/todos`) which write to Postgres; Electric propagates the change back to all clients.
- **IDs**: Use `crypto.randomUUID()` on the client before sending insert so the UI can optimistically render immediately.
- **Optimistic updates**: TanStack DB handles optimistic state automatically via `collection.insert/update/delete`.
- **SSR**: The index route (`src/routes/index.tsx`) sets `ssr: false` since it depends on `useLiveQuery`.
- **Filtering**: Client-side filter state (All / Active / Completed) held in React `useState`; no server round-trip needed.
- **Timestamps**: `updatedAt` updated server-side on PUT.

## Implementation Phases

### Phase 1 – Schema & Migration

- [ ] Add `todos` table to `src/db/schema.ts`.
- [ ] Add Zod schema to `src/db/zod-schemas.ts` (use `drizzle-zod` `createInsertSchema` / `createSelectSchema`).
- [ ] Run `drizzle-kit generate && drizzle-kit migrate` to create the table.

### Phase 2 – API Routes & Electric Shape Proxy

- [ ] Create `src/routes/api/todos.ts`:
  - `GET`: Electric shape proxy (forward to Electric Cloud with secret).
  - `POST`: Insert a new todo (validate with Zod insert schema).
  - `PUT`: Update a todo (toggle completed or rename). Validate with Zod.
  - `DELETE`: Delete a todo by id.
- [ ] Create `src/db/collections/todos.ts`: TanStack DB Electric collection pointing at `/api/todos`.

### Phase 3 – UI

- [ ] Update `src/routes/index.tsx` (set `ssr: false`):
  - `useLiveQuery` from the todos collection.
  - Filter tabs: All / Active / Completed.
  - Input + Add button to create todos.
  - List of todos, each with:
    - Checkbox to toggle `completed`.
    - Title text (strike-through when completed).
    - Delete button (`×`).
  - Footer showing count of active items remaining.
- [ ] Style with Tailwind utility classes; use shadcn/ui `Button`, `Input`, `Checkbox` where appropriate.

### Phase 4 – Build & Verify

- [ ] Run `pnpm build` and confirm it succeeds with no type errors.
- [ ] Run the preflight script (`node scripts/preflight.mjs`) and fix any SSR or `useLiveQuery` pattern violations.

### Phase 5 – Tests

- [ ] Add `tests/todos.test.ts` using Vitest:
  - Schema shape test: `generateValidRow` for `todos`, assert all required fields are present.
  - `generateRowWithout` tests for each required field (id, title, completed).

### Phase 6 – README

- [ ] Update `README.md` with:
  - App description.
  - Local dev setup (`pnpm install`, `pnpm dev`).
  - Required env vars (`DATABASE_URL`, `ELECTRIC_SOURCE_ID`, `ELECTRIC_SECRET`).

### Phase 7 – Deploy

- [ ] Confirm `.env.example` lists all required variables.
- [ ] No extra infrastructure needed beyond Postgres + Electric Cloud.
