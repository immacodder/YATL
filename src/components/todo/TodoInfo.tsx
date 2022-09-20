import { format, isBefore, startOfDay } from "date-fns"
import { useParams } from "react-router-dom"
import { Project, Todo } from "../../types"

interface P {
	todo: Todo
	project: Project
}
export function TodoInfo({ todo, project }: P) {
	const params = useParams()

	return (
		<div className="flex items-center ml-7 text-xs justify-between">
			<p
				className={`mr-2 ${
					todo.scheduledAt
						? isBefore(todo.scheduledAt, startOfDay(new Date()))
							? "text-red-500"
							: "text-green-500"
						: ""
				}`}
			>
				<span className={`material-icons text-xs pr-1`}>calendar_today</span>
				{todo.scheduledAt ? format(todo.scheduledAt, "d MMM") : "No date"}
			</p>
			{(params.projectId === "today" || params.projectId === "upcoming") && (
				<div className="flex items-center">
					<p>{project.name}</p>
					{"color" in project && (
						<div
							className="ml-2 rounded-full w-3 h-3"
							style={{ backgroundColor: project.color }}
						/>
					)}
				</div>
			)}
		</div>
	)
}
