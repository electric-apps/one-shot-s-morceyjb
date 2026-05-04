import { createCollection } from "@tanstack/react-db"
import { electricCollectionOptions } from "@tanstack/electric-db-collection"
import { snakeCamelMapper } from "@electric-sql/client"
import { todoSelectSchema } from "../zod-schemas"
import { absoluteApiUrl } from "@/lib/client-url"

export const todoCollection = createCollection(
	electricCollectionOptions({
		id: "todos",
		schema: todoSelectSchema,
		getKey: (row) => row.id,
		shapeOptions: {
			url: absoluteApiUrl("/api/todos"),
			columnMapper: snakeCamelMapper(),
			parser: {
				timestamptz: (v: string) => new Date(v),
				timestamp: (v: string) => new Date(v),
			},
		},
		onInsert: async ({ transaction }) => {
			const { modified: newTodo } = transaction.mutations[0]
			const res = await fetch("/api/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newTodo),
			})
			const data = await res.json()
			return { txid: data.txid }
		},
		onUpdate: async ({ transaction }) => {
			const { modified: updated } = transaction.mutations[0]
			const res = await fetch("/api/todos", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updated),
			})
			const data = await res.json()
			return { txid: data.txid }
		},
		onDelete: async ({ transaction }) => {
			const { original: deleted } = transaction.mutations[0]
			const res = await fetch("/api/todos", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: deleted.id }),
			})
			const data = await res.json()
			return { txid: data.txid }
		},
	}),
)
