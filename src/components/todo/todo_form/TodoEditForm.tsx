import { formatISO } from "date-fns"
import { useAppSelector } from "../../../hooks"
import { TagProject, Todo } from "../../../types"
import { TodoForm } from "./TodoForm"

interface P {
	todo: Todo
	setGlobalFormOpen: (id: string, open: boolean) => void
}
export function TodoEditForm({ todo, setGlobalFormOpen }: P) {
	const tags = useAppSelector((s) => s.projects).filter(
		(proj): proj is TagProject => proj.type === "tag"
	)
	const tagsFiltered = tags.filter((tag) => tag.todoIds.includes(todo.id))

	return (
		<div className="mb-2">
			<TodoForm
				updateId={todo.id}
				defValues={{
					submitButtonText: "Update",
					checked: tagsFiltered.map((tag) => tag.id),
					priority: todo.priority,
					originalTodo: todo,
					todoState: { description: todo.description ?? "", title: todo.title },
					schedule: {
						date: todo.scheduledAt
							? formatISO(todo.scheduledAt, { representation: "date" })
							: null,
						time: todo.scheduledAt
							? formatISO(todo.scheduledAt, {
									representation: "time",
							  }).split("+")[0]
							: null,
						open: false,
					},
					sectionId: todo.sectionId,
					remind: {
						date: todo.remindAt
							? formatISO(todo.remindAt, { representation: "date" })
							: null,
						time: todo.remindAt
							? formatISO(todo.remindAt, { representation: "time" }).split(
									"+"
							  )[0]
							: null,
						open: false,
					},
				}}
				setOpen={(open) => setGlobalFormOpen(todo.id, open)}
			/>
		</div>
	)
}
