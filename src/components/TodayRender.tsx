import { format } from "date-fns"
import { useState } from "react"
import { GeneratedProject, Todo } from "../types"
import { ProjectActions } from "./ProjectActions"
import { ProjectView } from "./ProjectView"
import { TodayTodolist } from "./TodayTodolist"

interface P {
	todos: Todo[]
	currentProject: GeneratedProject
}
export function TodayRender(p: P) {
	const [showCompleted, setShowCompleted] = useState(false)

	return (
		<main>
			<section className="m-4 flex justify-between items-end mb-2">
				<div>
					<p className="text-lg font-bold">
						Today
						<span className="inline-block ml-2 text-sm opacity-75 font-normal">
							{format(Date.now(), `E d MMM`)}
						</span>
					</p>
				</div>
				<div>
					<ProjectActions
						currentProject={p.currentProject}
						showCompleted={showCompleted}
						setShowCompleted={setShowCompleted}
						todos={p.todos}
					/>
					<ProjectView currentProject={p.currentProject} />
				</div>
			</section>

			<section className="m-4 mt-0">
				<TodayTodolist currentProject={p.currentProject} todos={p.todos} />
			</section>
		</main>
	)
}
