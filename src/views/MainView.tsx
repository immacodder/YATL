import { useState } from "react"
import { Navigate, useParams } from "react-router-dom"
import ProjectActions from "../components/ProjectActions"
import SectionForm from "../components/SectionForm"
import Sidebar from "../components/Sidebar"
import { Project, Todo } from "../types"
import Todolist from "../components/Todolist"

interface P {
	todos: Todo[]
	projects: Project[]
}

export default function MainView(p: P) {
	const params = useParams()

	const [showCompleted, setShowCompleted] = useState(false)

	const projectId = params.projectId as string

	if (!p.projects.find((proj) => proj.id === projectId))
		return <Navigate to={"/project"} />

	const currentProject: Project = p.projects.find(
		(proj) => proj.id === projectId
	)!

	return (
		<div
			className="grid w-[100vw] h-[100vh]"
			style={{
				gridTemplateColumns: `200px auto`,
				gridTemplateRows: `3rem auto`,
			}}
		>
			<nav className="bg-red-400 col-span-full h-12 w-full"></nav>
			<Sidebar />
			<main>
				<ProjectActions
					currentProject={currentProject}
					showCompleted={showCompleted}
					setShowCompleted={setShowCompleted}
					todos={p.todos}
				/>

				<section className="m-4 mt-0">
					<Todolist
						showCompleted={showCompleted}
						setShowCompleted={setShowCompleted}
						todos={p.todos}
						currentProject={currentProject}
					/>
					<SectionForm currentProject={currentProject} />
				</section>
			</main>
		</div>
	)
}
