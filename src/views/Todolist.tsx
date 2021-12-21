import { endOfDay, isAfter, isBefore, isToday } from "date-fns"
import { useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import TodoComp from "../components/TodoComp"
import TodoForm from "../components/TodoForm"
import { DefaultProjects, Project, Tag, Todo } from "../types"

interface P {
	tags: Tag[]
	todos: Todo[]
	projects: Project[]
}

export default function Todolist(p: P) {
	const [open, setOpen] = useState(true)
	const [todoEditOpen, setTodoEditOpen] = useState({
		todoId: null as null | string,
		open: false,
	})
	const params = useParams()
	const navigate = useNavigate()
	const projectId = params.projectId as string
	if (!p.projects.find((proj) => proj.id === projectId))
		return <Navigate to={"/project"} />

	let filteredTodos: Todo[] = []
	const currentProject: Project = p.projects.find(
		(proj) => proj.id === projectId
	)!

	if (currentProject.name === DefaultProjects.Inbox) {
		filteredTodos = p.todos.filter((todo) => todo.scheduledAt === null)
	} else if (currentProject.name === DefaultProjects.Today) {
		filteredTodos = p.todos.filter(
			(todo) =>
				todo.scheduledAt &&
				(isToday(todo.scheduledAt) || isBefore(todo.scheduledAt, new Date()))
		)
	} else if (currentProject.name === DefaultProjects.Upcoming) {
		filteredTodos = p.todos.filter(
			(todo) =>
				todo.scheduledAt && isAfter(todo.scheduledAt, endOfDay(new Date()))
		)
	} else {
		filteredTodos = p.todos.filter((todo) =>
			currentProject.sections.find((section) => section.id === todo.sectionId)
		)
	}

	const onTodoEdit = (todoId: string, open: boolean) => {
		setOpen(false)
		setTodoEditOpen({ todoId, open })
	}

	return (
		<div
			className="grid w-[100vw] h-[100vh]"
			style={{
				gridTemplateColumns: `200px auto`,
				gridTemplateRows: `3rem auto`,
			}}
		>
			{/* APPBAR */}
			<div className="bg-red-400 col-span-full h-12 w-full"></div>
			<Sidebar projects={p.projects} />
			{/* MAIN */}
			<div className="m-4">
				<div className="flex justify-end">
					<button className="m-2 button">Comment</button>
					<button className="m-2 button">Project actions</button>
					<button className="m-2 button">View</button>
				</div>
				{filteredTodos.map((todo) => (
					<TodoComp
						project={currentProject}
						todoFormOpen={todoEditOpen}
						setGlobalFormOpen={onTodoEdit}
						todo={todo}
						key={todo.id}
					/>
				))}
				{open ? (
					<TodoForm
						sectionId={
							currentProject &&
							currentProject.sections.find((s) => s.type === "default")!.id
						}
						setOpen={setOpen}
						tags={p.tags}
					/>
				) : (
					<button className="button" onClick={() => setOpen(true)}>
						Add todo
					</button>
				)}
			</div>
		</div>
	)
}
