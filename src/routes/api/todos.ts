import { createFileRoute } from "@tanstack/react-router"
import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { todos } from "@/db/schema"
import { todoInsertSchema } from "@/db/zod-schemas"
import { parseDates, generateTxId } from "@/db/utils"

const handleGet = async ({ request }: { request: Request }) => {
	const url = new URL(request.url)
	const electricBase = process.env.ELECTRIC_URL ?? "http://localhost:3000"
	const originUrl = new URL("/v1/shape", electricBase)

	url.searchParams.forEach((v, k) => {
		if ((ELECTRIC_PROTOCOL_QUERY_PARAMS as readonly string[]).includes(k)) {
			originUrl.searchParams.set(k, v)
		}
	})

	originUrl.searchParams.set("table", "todos")

	if (process.env.ELECTRIC_SOURCE_ID && process.env.ELECTRIC_SOURCE_SECRET) {
		originUrl.searchParams.set("source_id", process.env.ELECTRIC_SOURCE_ID)
		originUrl.searchParams.set("secret", process.env.ELECTRIC_SOURCE_SECRET)
	}

	const res = await fetch(originUrl)
	const headers = new Headers(res.headers)
	headers.delete("content-encoding")
	headers.delete("content-length")
	return new Response(res.body, {
		status: res.status,
		statusText: res.statusText,
		headers,
	})
}

const handlePost = async ({ request }: { request: Request }) => {
	const body = parseDates(await request.json())
	const data = todoInsertSchema.parse(body)

	const result = await db.transaction(async (tx) => {
		const [row] = await tx.insert(todos).values(data).returning()
		const txid = await generateTxId(tx)
		return { id: row.id, txid }
	})

	return new Response(JSON.stringify(result), {
		headers: { "Content-Type": "application/json" },
	})
}

const handlePut = async ({ request }: { request: Request }) => {
	const body = parseDates(await request.json())
	const { id, completed, title } = body as {
		id: string
		completed: boolean
		title: string
	}

	const result = await db.transaction(async (tx) => {
		const [row] = await tx
			.update(todos)
			.set({ title, completed, updatedAt: new Date() })
			.where(eq(todos.id, id))
			.returning()
		const txid = await generateTxId(tx)
		return { id: row.id, txid }
	})

	return new Response(JSON.stringify(result), {
		headers: { "Content-Type": "application/json" },
	})
}

const handleDelete = async ({ request }: { request: Request }) => {
	const body = await request.json()
	const { id } = body as { id: string }

	const result = await db.transaction(async (tx) => {
		await tx.delete(todos).where(eq(todos.id, id))
		const txid = await generateTxId(tx)
		return { txid }
	})

	return new Response(JSON.stringify(result), {
		headers: { "Content-Type": "application/json" },
	})
}

export const Route = createFileRoute("/api/todos")({
	server: {
		handlers: {
			GET: handleGet,
			POST: handlePost,
			PUT: handlePut,
			DELETE: handleDelete,
		},
	},
})
