import { format, isBefore, startOfDay } from "date-fns"
import { Project, Todo } from "../types"

interface P {
	todo: Todo
	project: Project
}
export default function TodoInfo({ todo, project }: P) {
	// I have refactored it, because it will get very big very quickly
	// and I don't need another 550LOC component, as I had it with the
	// TodoForm.tsx
	return (
		<div className="flex items-center ml-7 text-xs">
			<p
				className={`mr-2 ${
					todo.scheduledAt
						? isBefore(todo.scheduledAt, startOfDay(new Date()))
							? "text-red-500"
							: "text-green-500"
						: ""
				}`}
			>
				<span className={`material-icons text-xs `}>calendar_today</span>
				{todo.scheduledAt ? format(todo.scheduledAt, "d MMM") : "No date"}
			</p>
			<p className="mr-2">{`#${project.name}`}</p>
		</div>
	)
}
