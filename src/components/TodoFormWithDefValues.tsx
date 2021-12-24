import { formatISO } from "date-fns"
import { Todo } from "../types"
import TodoForm from "./TodoFormWrapper"

interface P {
	todo: Todo
	setGlobalFormOpen: (id: string, open: boolean) => void
}
export default function TodoFormWithDefValues({ todo, setGlobalFormOpen }: P) {
	return (
		<div className="mb-2">
			<TodoForm
				tags={Object.keys(todo.tags).map((key) => ({
					id: key,
					name: todo.tags[key],
				}))}
				updateId={todo.id}
				defValues={{
					submitButtonText: "Update todo",
					checked: Object.keys(todo.tags),
					priority: todo.priority,
					todo: {
						title: todo.title,
						description: todo.description ?? "",
					},
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
