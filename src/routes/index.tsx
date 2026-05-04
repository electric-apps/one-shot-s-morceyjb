import { createFileRoute } from "@tanstack/react-router"
import { useLiveQuery } from "@tanstack/react-db"
import { useState } from "react"
import { Button } from "@radix-ui/themes"
import { todoCollection } from "@/db/collections/todos"

export const Route = createFileRoute("/")({
	ssr: false,
	component: App,
})

type Filter = "all" | "active" | "completed"

function App() {
	const [input, setInput] = useState("")
	const [filter, setFilter] = useState<Filter>("all")

	const { data: todos = [] } = useLiveQuery((q) =>
		q.from({ todo: todoCollection }).orderBy(({ todo }) => todo.createdAt, "asc"),
	)

	const filteredTodos = todos.filter((todo) => {
		if (filter === "active") return !todo.completed
		if (filter === "completed") return todo.completed
		return true
	})

	const activeCount = todos.filter((t) => !t.completed).length

	const handleAdd = () => {
		const title = input.trim()
		if (!title) return
		todoCollection.insert({
			id: crypto.randomUUID(),
			title,
			completed: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		setInput("")
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") handleAdd()
	}

	const handleToggle = (id: string, completed: boolean) => {
		todoCollection.update(id, (draft) => {
			draft.completed = !completed
		})
	}

	const handleDelete = (id: string) => {
		todoCollection.delete(id)
	}

	return (
		<div className="flex min-h-svh flex-col items-center py-16 px-4">
			<div className="w-full max-w-md">
				<h1 className="mb-8 text-center text-3xl font-bold">Todos</h1>

				<div className="mb-4 flex gap-2">
					<input
						className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
						placeholder="What needs to be done?"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
					/>
					<Button onClick={handleAdd} disabled={!input.trim()}>
						Add
					</Button>
				</div>

				<div className="mb-4 flex gap-2">
					{(["all", "active", "completed"] as Filter[]).map((f) => (
						<Button
							key={f}
							variant={filter === f ? "solid" : "soft"}
							onClick={() => setFilter(f)}
						>
							{f.charAt(0).toUpperCase() + f.slice(1)}
						</Button>
					))}
				</div>

				<div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
					{filteredTodos.length === 0 && (
						<div className="p-4 text-center text-sm text-gray-400">
							No todos here!
						</div>
					)}
					{filteredTodos.map((todo) => (
						<div key={todo.id} className="flex items-center gap-3 p-3">
							<input
								type="checkbox"
								className="h-4 w-4 cursor-pointer accent-blue-500"
								checked={todo.completed}
								onChange={() => handleToggle(todo.id, todo.completed)}
							/>
							<span
								className={`flex-1 text-sm ${
									todo.completed ? "text-gray-400 line-through" : ""
								}`}
							>
								{todo.title}
							</span>
							<button
								className="ml-auto text-lg leading-none text-gray-400 hover:text-red-500"
								onClick={(e) => {
									e.stopPropagation()
									handleDelete(todo.id)
								}}
								aria-label="Delete todo"
							>
								×
							</button>
						</div>
					))}
				</div>

				<div className="mt-4 text-sm text-gray-500">
					{activeCount} {activeCount === 1 ? "item" : "items"} left
				</div>
			</div>
		</div>
	)
}
