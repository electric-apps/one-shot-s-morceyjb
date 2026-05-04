import { describe, it, expect } from "vitest"
import { todoSelectSchema, todoInsertSchema } from "@/db/zod-schemas"
import { generateValidRow, generateRowWithout } from "./helpers/schema-test-utils"

describe("todos schema", () => {
	it("generates a valid row from todoSelectSchema", () => {
		const row = generateValidRow(todoSelectSchema as unknown as Parameters<typeof generateValidRow>[0])
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(true)
	})

	it("rejects a row missing id", () => {
		const row = generateRowWithout(todoSelectSchema as unknown as Parameters<typeof generateValidRow>[0], "id")
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("rejects a row missing title", () => {
		const row = generateRowWithout(
			todoSelectSchema as unknown as Parameters<typeof generateValidRow>[0],
			"title",
		)
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("rejects a row missing completed", () => {
		const row = generateRowWithout(
			todoSelectSchema as unknown as Parameters<typeof generateValidRow>[0],
			"completed",
		)
		const result = todoSelectSchema.safeParse(row)
		expect(result.success).toBe(false)
	})

	it("generates a valid insert row from todoInsertSchema", () => {
		const row = generateValidRow(todoInsertSchema as unknown as Parameters<typeof generateValidRow>[0])
		const result = todoInsertSchema.safeParse(row)
		expect(result.success).toBe(true)
	})
})
