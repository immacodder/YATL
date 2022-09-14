import { Navigate, useParams } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import { GeneratedProject, Project, RegularProject, Todo } from "../types"
import { ProjectRender } from "../components/RegularProjectRender"
import { TodayRender } from "../components/TodayRender"
import { Upcoming } from "../components/UpcomingRender"
import { useState } from "react"

interface P {
	todos: Todo[]
	projects: Project[]
}

export default function MainView(p: P) {
	const params = useParams()
	const [sidebarOpen, setSidebarOpen] = useState(!(window.innerWidth < 700))

	const projectId = params.projectId as string

	if (
		!p.projects.find((proj) => proj.id === projectId) &&
		projectId !== "today" &&
		projectId !== "upcoming"
	)
		return <Navigate to={"/project"} />

	let currentProject: Project = p.projects.find(
		(proj) => proj.id === projectId
	)!

	if (projectId === "today")
		currentProject = p.projects.find(
			(proj) => proj.type === "generated" && proj.name === "Today"
		)!
	if (projectId === "upcoming")
		currentProject = p.projects.find(
			(proj) => proj.type === "generated" && proj.name === "Upcoming"
		)!

	return (
		<div
			className="grid w-[100vw] h-[100vh]"
			style={{
				gridTemplateColumns: sidebarOpen ? `200px auto` : undefined,
				gridTemplateRows: `3rem auto`,
			}}
		>
			<nav className="bg-red-400 flex items-center px-2 col-span-full h-12 w-full">
				<button
					className="material-icons rounded-full p-2 hover:bg-[rgba(0,0,0,0.15)]"
					onClick={() => setSidebarOpen(!sidebarOpen)}
				>
					menu
				</button>
			</nav>
			{sidebarOpen && <Sidebar />}
			{(() => {
				if (projectId === "today")
					return (
						<TodayRender
							currentProject={currentProject as GeneratedProject}
							todos={p.todos}
						/>
					)
				else if (projectId === "upcoming") return <Upcoming />
				else
					return (
						<ProjectRender
							currentProject={currentProject as RegularProject}
							todos={p.todos}
						/>
					)
			})()}
		</div>
	)
}
