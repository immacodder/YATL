import { useState } from "react"
import { RegularProject, Todo } from "../types"
import { ProjectActions } from "../components/ProjectActions"
import { ProjectView } from "../components/ProjectView"
import { SectionForm } from "../components/SectionForm"
import { Todolist } from "./Todolist"

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
				<Todolist
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
