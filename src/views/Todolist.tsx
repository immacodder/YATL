import { endOfDay, isAfter, isBefore, isToday } from "date-fns"
import { arrayUnion, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { Fragment, useRef, useState } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { v4 } from "uuid"
import Dialog from "../components/Dialog"
import { Menu, MenuType } from "../components/Menu"
import Popup from "../components/Popup"
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
	const [currentAddTodoSectionId, setCurrentAddTodoSectionId] = useState<
		string | null
	>(null)

	const params = useParams()

	const user = useAppSelector((s) => s.user.user as User)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [showCompleted, setShowCompleted] = useState(false)

	const projectId = params.projectId as string
	const [projectIdCheck, setProjectIdCheck] = useState(projectId)
	const [projectActionsOpen, setProjectActionsOpen] = useState(false)
	const projectActionsRef = useRef<HTMLButtonElement>(null)

	const [sectionFormOpen, setSectionFormOpen] = useState(false)
	const [sectionName, setSectionName] = useState("")
	const [selectedSection, setSelectedSection] = useState<Section | null>(null)

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
	const defSection = currentProject.sections.find(
		(sec) => sec.type === "default"
	)!

	if (!selectedSection) setSelectedSection(defSection)

	const deleteProject = async () => {
		const todoIDs: string[] = p.todos
			.filter((todo) => {
				return currentProject.sections.find((sec) => sec.id === todo.sectionId)
			})
			.map((todo) => todo.id)

		await Promise.all(
			todoIDs.map(async (id) => {
				await deleteDoc(
					doc(db, `${FireCol.Users}/${user.id}/${FireCol.Todos}/${id}`)
				)
			})
		)

		await deleteDoc(
			doc(
				db,
				`${FireCol.Users}/${user.id}/${FireCol.Projects}/${currentProject.id}`
			)
		)
	}

	const projectActionsData: MenuType[] = [
		{
			name: showCompleted ? "Hide completed" : "Show completed",
			icon: showCompleted ? "remove_done" : "done",
			action: () => setShowCompleted(!showCompleted),
		},
		{
			icon: "delete_forever",
			name: "Delete project",
			danger: true,
			separatorBefore: true,
			action: () => setDeleteDialogOpen(true),
		},
	]

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

	const todosJsx: JSX.Element[] = []
	for (let [section, todos] of newSectionMap) {
		let sectionUsed = false
		const newTodos = todos.map((todo, index, arr) => {
			let sectionJSX: JSX.Element = <></>
			if (!sectionUsed && section.type !== "default") {
				sectionJSX = (
					<Fragment>
						<h3 className="text-lg font-bold mt-4">{section.name}</h3>
						<hr />
					</Fragment>
				)
				sectionUsed = true
			}
			return (
				<Fragment key={todo.id}>
					{sectionJSX}
					{(todo.type !== "completed" || showCompleted) && (
						<TodoComp
							project={currentProject}
							todoFormOpen={todoEditOpen}
							setGlobalFormOpen={onTodoEdit}
							todo={todo}
							key={todo.id}
						/>
					)}
					{todoFormOpen &&
						currentAddTodoSectionId === section.id &&
						todo.id === arr[arr.length - 1].id && (
							// TODO add default section here
							<TodoForm
								setOpen={setTodoFormOpen}
								defaultValues={{ sectionId: section.id }}
								tags={p.tags}
							/>
						)}
					{todo.id === arr[arr.length - 1].id && !todoFormOpen && (
						<button
							className="button"
							onClick={() => {
								setCurrentAddTodoSectionId(section.id)
								setTodoFormOpen(true)
							}}
						>
							Add todo
						</button>
					)}
				</Fragment>
			)
		})
		todosJsx.push(...newTodos)
		if (!todosJsx.length)
			todosJsx.push(
				<Fragment
					key={"I have to include this, otherwise it will raise an error..."}
				>
					<button
						className="button"
						onClick={() => {
							setCurrentAddTodoSectionId(defSection.id)
							setTodoFormOpen(true)
						}}
					>
						Add todo
					</button>
					{todoFormOpen && (
						<TodoForm
							defaultValues={{ sectionId: defSection.id }}
							setOpen={setTodoFormOpen}
							tags={p.tags}
						/>
					)}
				</Fragment>
			)
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
				<section className="m-4 flex justify-end mb-2">
					<button
						onClick={() => setProjectActionsOpen(true)}
						ref={projectActionsRef}
						className="m-2 button mr-0"
					>
						Project actions
					</button>
					{projectActionsOpen && (
						<Menu
							anchor={projectActionsRef.current}
							data={projectActionsData}
							setOpen={setProjectActionsOpen}
						/>
					)}
					{deleteDialogOpen && (
						<Dialog
							action={deleteProject}
							setOpen={setDeleteDialogOpen}
							text={`Are you sure you want to delete ${currentProject.name}`}
							confirmText="Delete"
							danger
						/>
					)}
					<button className="m-2 button mr-0">View</button>
				</section>

				<section className="m-4 mt-0">
					{todosJsx}
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
								autoFocus
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
