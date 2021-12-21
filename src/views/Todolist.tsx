import { endOfDay, isAfter, isBefore, isToday } from "date-fns"
import { arrayUnion, doc, updateDoc } from "firebase/firestore"
import { Fragment, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { v4 } from "uuid"
import Sidebar from "../components/Sidebar"
import TodoComp from "../components/TodoComp"
import TodoForm from "../components/TodoForm"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import {
	DefaultProjects,
	FireCol,
	Project,
	Section,
	Tag,
	Todo,
	User,
} from "../types"

interface P {
	tags: Tag[]
	todos: Todo[]
	projects: Project[]
}

export default function Todolist(p: P) {
	const [todoFormOpen, setTodoFormOpen] = useState(false)
	const [todoEditOpen, setTodoEditOpen] = useState({
		todoId: null as null | string,
		open: false,
	})
	const [sectionFormOpen, setSectionFormOpen] = useState(false)
	const params = useParams()
	const user = useAppSelector((s) => s.user.user as User)
	const projectId = params.projectId as string
	const [projectIdCheck, setProjectIdCheck] = useState(projectId)
	const [sectionName, setSectionName] = useState("")

	if (projectIdCheck !== projectId) {
		setTodoFormOpen(false)
		setSectionFormOpen(false)
		setSectionName("")
		setProjectIdCheck(projectId)
	}

	if (!p.projects.find((proj) => proj.id === projectId))
		return <Navigate to={"/project"} />

	const currentProject: Project = p.projects.find(
		(proj) => proj.id === projectId
	)!

	type SectionMap = Map<Section, Todo[]>
	const newSectionMap: SectionMap = new Map()

	currentProject.sections.forEach((section) => {
		let filteredTodos: Todo[] = []

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
		}
		if (currentProject.type === "default") {
			return newSectionMap.set(section, filteredTodos)
		}

		newSectionMap.set(
			section,
			p.todos.filter((todo) => todo.sectionId === section.id)
		)
	})

	const onTodoEdit = (todoId: string, open: boolean) => {
		setTodoFormOpen(false)
		setTodoEditOpen({ todoId, open })
	}
	const onNewSection = () => {
		const section: Section = {
			type: "userCreated",
			id: v4(),
			name: sectionName,
		}
		const ref = doc(
			db,
			`${FireCol.Users}/${user.id}/${FireCol.Projects}/${currentProject.id}`
		)
		updateDoc(ref, {
			sections: arrayUnion(section),
		})
	}

	console.log(newSectionMap)
	const todosJsx: JSX.Element[] = []
	for (let [section, todos] of newSectionMap) {
		const newTodos = todos.map((todo) => (
			<Fragment key={todo.id}>
				{section.type !== "default" && (
					<Fragment>
						<h3 className="text-lg font-bold">{section.name}</h3>
						<hr />
						<br />
					</Fragment>
				)}
				<TodoComp
					project={currentProject}
					todoFormOpen={todoEditOpen}
					setGlobalFormOpen={onTodoEdit}
					todo={todo}
					key={todo.id}
				/>
			</Fragment>
		))
		todosJsx.push(...newTodos)
	}

	return (
		<div
			className="grid w-[100vw] h-[100vh]"
			style={{
				gridTemplateColumns: `200px auto`,
				gridTemplateRows: `3rem auto`,
			}}
		>
			<nav className="bg-red-400 col-span-full h-12 w-full"></nav>
			<Sidebar projects={p.projects} />
			<main>
				<section className="m-4 mb-2">
					<div className="flex justify-end">
						<button className="m-2 button">Comment</button>
						<button className="m-2 button">Project actions</button>
						<button className="m-2 button mr-0">View</button>
					</div>
				</section>

				<section className="m-4 mt-0">
					{todosJsx}
					{todoFormOpen ? (
						<TodoForm setOpen={setTodoFormOpen} tags={p.tags} />
					) : (
						<button className="button" onClick={() => setTodoFormOpen(true)}>
							Add todo
						</button>
					)}
					{sectionFormOpen ? (
						<form
							className="p-4 mt-2 bg-white"
							onSubmit={(e) => {
								e.preventDefault()
								onNewSection()
								setSectionFormOpen(false)
							}}
						>
							<input
								id="sectionName"
								className="input"
								placeholder="Section name"
								type="text"
								onChange={(e) => setSectionName(e.target.value)}
								value={sectionName}
							/>
							<br />
							<button
								onClick={() => setSectionFormOpen(false)}
								type="button"
								className="button-outline"
							>
								Cancel
							</button>
							<button type="submit" className="button m-2">
								Add
							</button>
						</form>
					) : (
						currentProject.type !== "default" && (
							<div className="flex items-center justify-center w-full mt-2">
								<hr className="w-full border-black mr-2" />
								<button
									onClick={() => setSectionFormOpen(true)}
									className="button min-w-fit"
								>
									Add new section
								</button>
								<hr className="w-full border-black ml-2" />
							</div>
						)
					)}
				</section>
			</main>
		</div>
	)
}
