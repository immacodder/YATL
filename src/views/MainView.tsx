import { useDispatch } from "react-redux"
import { Navigate, useParams } from "react-router-dom"
import { ProjectCreator } from "../components/ProjectCreator"
import { ProjectRender } from "../components/RegularProjectRender"
import { Sidebar } from "../components/Sidebar"
import { TodayRender } from "../components/TodayRender"
import { Upcoming } from "../components/UpcomingRender"
import { useAppSelector } from "../hooks"
import { useWindowResize } from "../hooks/useWindowResize"
import { uiStateActions } from "../slices/uiStateSlice"
import { GeneratedProject, Project, RegularProject, Todo } from "../types"

interface P {
	todos: Todo[]
	projects: Project[]
}

export default function MainView(p: P) {
	const params = useParams()
	const { width } = useWindowResize()
	const isMobile = width < 600
	const uiState = useAppSelector((s) => s.uiState)
	const dispatch = useDispatch()

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
		<>
			{uiState.projectCreatorOpen && <ProjectCreator />}
			<div
				className="grid w-[100vw] h-[100vh]"
				style={{
					gridTemplateColumns:
						uiState.sidebarOpen && !isMobile ? `200px auto` : undefined,
					gridTemplateRows: `3rem auto`,
				}}
			>
				<nav className="bg-red-400 flex items-center px-2 col-span-full h-12 w-full z-10">
					<button
						className="material-icons rounded-full p-2 hover:bg-[rgba(0,0,0,0.15)]"
						onClick={() => dispatch(uiStateActions.toggle("sidebar"))}
					>
						menu
					</button>
				</nav>
				<Sidebar isMobile={isMobile} />
				<main className="mx-auto max-w-4xl w-full">
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
				</main>
			</div>
		</>
	)
}
