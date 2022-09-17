import { useState } from "react"
import { RegularProject, Todo } from "../types"
import { ProjectActions } from "./ProjectActions"
import { ProjectView } from "./ProjectView"
import SectionForm from "./SectionForm"
import { RegularTodolist } from "./RegularTodolist"

interface P {
	todos: Todo[]
	currentProject: RegularProject
}
export function ProjectRender(p: P) {
	const [showCompleted, setShowCompleted] = useState(false)

	return (
		<>
			<section className="m-4 flex justify-end mb-2">
				<ProjectActions
					currentProject={p.currentProject}
					showCompleted={showCompleted}
					setShowCompleted={setShowCompleted}
					todos={p.todos}
				/>
				<ProjectView currentProject={p.currentProject} />
			</section>

			<section className="m-4 mt-0">
				<RegularTodolist
					showCompleted={showCompleted}
					setShowCompleted={setShowCompleted}
					todos={p.todos}
					currentProject={p.currentProject}
				/>
				<SectionForm currentProject={p.currentProject} />
			</section>
		</>
	)
}
