import { createSelectSchema, createInsertSchema } from "drizzle-zod"
import type { InferSelectModel, InferInsertModel } from "drizzle-orm"
import { todos } from "./schema"

export const todoSelectSchema = createSelectSchema(todos)
export const todoInsertSchema = createInsertSchema(todos)

export type Todo = InferSelectModel<typeof todos>
export type NewTodo = InferInsertModel<typeof todos>
