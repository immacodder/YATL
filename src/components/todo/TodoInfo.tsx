import { format, isBefore, startOfDay } from "date-fns"
import { useParams } from "react-router-dom"
import { Project, TagProject, Todo } from "../../types"
import { useAppSelector } from "../../hooks"

interface P {
	todo: Todo
	project: Project
}
export function TodoInfo({ todo, project }: P) {
	const params = useParams()
	const tags = useAppSelector((s) =>
		s.projects.filter((p) => p.type === "tag")
	) as TagProject[]
	function findTodosTags(todo: Todo): TagProject[] {
		const todosTags = tags.filter((tag) => tag.todoIds.includes(todo.id))
		return todosTags
	}

	return (
		<div className="flex items-center ml-7 text-xs justify-between">
			<div className="flex items-center justify-start">
				<p
					className={`mr-2 ${
						todo.scheduledAt
							? isBefore(todo.scheduledAt, startOfDay(new Date()))
								? "text-red-500"
								: "text-green-500"
							: ""
					}`}
				>
					<span className={`material-icons text-xs`}>calendar_today</span>
				</p>
				{todo.scheduledAt ? format(todo.scheduledAt, "d MMM") : "No date"}
				<div className="ml-2 flex items-center justify-start">
					{findTodosTags(todo).map((tag) => (
						<div className="flex items-center justify-start" key={tag.id}>
							<span
								className="material-icons text-sm mr-1"
								style={{ color: tag.color }}
							>
								sell
							</span>
							<p className="mr-1">{tag.name}</p>
						</div>
					))}
				</div>
			</div>
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
