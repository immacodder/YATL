import { useDispatch } from "react-redux"
import { Navigate, useLocation, useParams, useNavigate } from "react-router-dom"
import { ProjectCreator } from "../components/ProjectCreator"
import { ProjectRender } from "./ProjectRender"
import { Sidebar } from "../components/sidebar/Sidebar"
import { TodayRender } from "./TodayRender"
import { Upcoming } from "./UpcomingRender"
import { useAppDispatch, useAppSelector } from "../hooks"
import { useWindowResize } from "../hooks/useWindowResize"
import { uiStateActions } from "../slices/uiStateSlice"
import {
	DefaultProjectsIcons,
	Delays,
	GeneratedProject,
	Project,
	RegularProject,
	Todo,
} from "../types"
import { TagsRender } from "./TagsRender"
import { useEffect, useState } from "react"
import { Snackbar, SnackbarProps } from "../components/Snackbar"
import { setProjectDeletion, setTodoDeletion } from "../slices/deletionSlice"

interface P {
	todos: Todo[]
	projects: Project[]
}

export function MainView(p: P) {
	const params = useParams()
	const { width } = useWindowResize()
	const isMobile = width < 600
	const uiState = useAppSelector((s) => s.uiState)
	const dispatch = useAppDispatch()
	const deletionState = useAppSelector((s) => s.deletion)
	const [snackbarProps, setSnackbarProps] = useState<SnackbarProps | null>(null)
	const [snackbarOpen, setSnackbarOpen] = useState(false)
	const navigate = useNavigate()

	function snackbarCleanup() {
		setSnackbarOpen(false)
		setSnackbarProps(null)
	}
	useEffect(() => {
		if (!deletionState.project) return

		setTimeout(snackbarCleanup, Delays.ProjectDeletion)
		setSnackbarOpen(true)
		setSnackbarProps({
			message: "Undo project deletion?",
			variant: "Notification",
			timeout: Delays.ProjectDeletion,
			action: {
				handler: () => {
					clearTimeout(deletionState.project!.timeoutId)
					dispatch(setProjectDeletion(null))
					snackbarCleanup()
					navigate(`/project/${deletionState.project!.id}`)
				},
				message: "undo",
			},
		})
	}, [deletionState.project, navigate, dispatch])

	useEffect(() => {
		if (!deletionState.todo) {
			return
		}

		setTimeout(snackbarCleanup, Delays.TodoDeletion)
		setSnackbarOpen(true)
		setSnackbarProps({
			message: "Undo todo deletion?",
			variant: "Notification",
			timeout: Delays.TodoDeletion,
			action: {
				handler: () => {
					clearTimeout(deletionState.todo!.timeoutId)
					dispatch(setTodoDeletion(null))
					snackbarCleanup()
				},
				message: "undo",
			},
		})
	}, [deletionState, dispatch])

	let projectId = params.projectId
	if (location.pathname.includes("tags") && !projectId) projectId = "tags"

	let currentProject = p.projects.find((proj) => proj.id === projectId)!

	if (
		!p.projects.find((proj) => proj.id === projectId) &&
		projectId !== "today" &&
		projectId !== "upcoming" &&
		projectId !== "tags"
	)
		return <Navigate to={"/project"} />

	if (projectId === "today")
		currentProject = p.projects.find(
			(proj) => proj.type === "generated" && proj.name === "Today"
		)!
	if (projectId === "upcoming")
		currentProject = p.projects.find(
			(proj) => proj.type === "generated" && proj.name === "Upcoming"
		)!
	if (projectId === "tags") {
		currentProject = p.projects.find(
			(proj) => proj.type === "generated" && proj.name === "Tags"
		)!
	}

	return (
		<>
			{uiState.projectCreatorOpen && <ProjectCreator />}
			{snackbarOpen && snackbarProps && <Snackbar {...snackbarProps} />}
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
						else if (projectId === "upcoming")
							return (
								<Upcoming
									todos={p.todos}
									currentProject={currentProject as GeneratedProject}
								/>
							)
						else if (projectId === "tags") return <TagsRender todos={p.todos} />
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
