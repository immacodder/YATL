import { formatISO } from "date-fns"
import { useAppSelector } from "../hooks"
import { TagProject, Todo } from "../types"
import TodoFormWrapper from "./TodoFormWrapper"

interface P {
	todo: Todo
	isToday?: true
	setGlobalFormOpen: (id: string, open: boolean) => void
}
export default function TodoFormWithDefValues({
	todo,
	setGlobalFormOpen,
	isToday,
}: P) {
	const tags = useAppSelector((s) => s.projects).filter(
		(proj): proj is TagProject => proj.type === "tag"
	)
	const tagsFiltered = tags.filter((tag) => tag.todoIds.includes(todo.id))

	return (
		<div className="mb-2">
			<TodoFormWrapper
				updateId={todo.id}
				defValues={{
					submitButtonText: "Update todo",
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
