import { isToday, isBefore, isAfter, endOfDay } from "date-fns"
import { Fragment, useState } from "react"
import TodoComp from "../components/TodoComp"
import TodoFormWrapper from "../components/TodoFormWrapper"
import { useAppSelector } from "../hooks"
import {
	DefaultProjects,
	Project,
	Section,
	TagProject,
	Todo,
	User,
} from "../types"

interface P {
	currentProject: Project
	todos: Todo[]
	showCompleted: boolean
	setShowCompleted: React.Dispatch<React.SetStateAction<boolean>>
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
	const [selectedSection, setSelectedSection] = useState<Section | null>(null)
	const user = useAppSelector((s) => s.user.user as User)

	const defSection = p.currentProject.sections.find(
		(sec) => sec.type === "default"
	)!

	function onTodoEdit(todoId: string, open: boolean) {
		setTodoFormOpen(false)
		setTodoEditOpen({ todoId, open })
	}

	if (!selectedSection) setSelectedSection(defSection)

	const newSectionMap: Map<Section, Todo[]> = new Map()

	p.currentProject.sections.forEach((section) => {
		let defaultProjectFilteredTodos: Todo[] = []

		if (p.currentProject.name === DefaultProjects[0]) {
			defaultProjectFilteredTodos = p.todos.filter(
				(todo) => todo.scheduledAt === null
			)
		} else if (p.currentProject.name === DefaultProjects[1]) {
			defaultProjectFilteredTodos = p.todos.filter(
				(todo) =>
					todo.scheduledAt &&
					(isToday(todo.scheduledAt) || isBefore(todo.scheduledAt, new Date()))
			)
		} else if (p.currentProject.name === DefaultProjects[2]) {
			defaultProjectFilteredTodos = p.todos.filter(
				(todo) =>
					todo.scheduledAt && isAfter(todo.scheduledAt, endOfDay(new Date()))
			)
		}

		if (p.currentProject.type === "default") {
			return newSectionMap.set(section, defaultProjectFilteredTodos)
		}

		let filteredTodos: Todo[] = []

		if (p.currentProject.type === "tag") {
			filteredTodos = p.todos.filter((todo) => {
				return (p.currentProject as TagProject).todoIds.find(
					(id) => id === todo.id
				)
			})
		} else {
			filteredTodos = p.todos.filter((todo) => todo.sectionId === section.id)
		}

		if (Object.keys(user.preferences.sortBy).includes(p.currentProject.id)) {
			filteredTodos.sort((a, b) => {
				switch (user.preferences.sortBy[p.currentProject.id]) {
					case "alphabetically":
						return a.title.localeCompare(b.title)
					case "date_added":
						return b.createdAt - a.createdAt
					case "due_date":
						return (b.scheduledAt ?? 0) - (a.scheduledAt ?? 0)
					case "priority":
						return a.priority - b.priority
					case "project":
						// TODO
						// test first the ones above, and then do the project grouping
						// This should only be available in Today project, because it doesn't make any sense for other projects
						return 0
					default:
						throw new Error("Case not handled")
				}
			})
		}

		newSectionMap.set(section, filteredTodos)
	})

	const todosJsx: JSX.Element[] = []
	for (let [section, todos] of newSectionMap) {
		let sectionUsed = false
		const newTodos = todos.map((todo, _i, arr) => {
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
					{(todo.type !== "completed" || p.showCompleted) && (
						<TodoComp
							project={p.currentProject}
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
							<TodoFormWrapper
								setOpen={setTodoFormOpen}
								defValues={{ sectionId: section.id }}
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
						<TodoFormWrapper
							defValues={{ sectionId: defSection.id }}
							setOpen={setTodoFormOpen}
						/>
					)}
				</Fragment>
			)
	}
	return <>{todosJsx}</>
}
