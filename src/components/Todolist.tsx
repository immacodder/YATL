import { isToday, isBefore, isAfter, endOfDay } from "date-fns"
import { Fragment, useState } from "react"
import TodoComp from "../components/TodoComp"
import TodoForm from "../components/TodoFormWrapper"
import { DefaultProjects, Project, Section, Todo } from "../types"

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

	const defSection = p.currentProject.sections.find(
		(sec) => sec.type === "default"
	)!

	function onTodoEdit(todoId: string, open: boolean) {
		setTodoFormOpen(false)
		setTodoEditOpen({ todoId, open })
	}

	if (!selectedSection) setSelectedSection(defSection)

	type SectionMap = Map<Section, Todo[]>
	const newSectionMap: SectionMap = new Map()

	p.currentProject.sections.forEach((section) => {
		let filteredTodos: Todo[] = []

		if (p.currentProject.name === DefaultProjects[0]) {
			filteredTodos = p.todos.filter((todo) => todo.scheduledAt === null)
		} else if (p.currentProject.name === DefaultProjects[1]) {
			filteredTodos = p.todos.filter(
				(todo) =>
					todo.scheduledAt &&
					(isToday(todo.scheduledAt) || isBefore(todo.scheduledAt, new Date()))
			)
		} else if (p.currentProject.name === DefaultProjects[2]) {
			filteredTodos = p.todos.filter(
				(todo) =>
					todo.scheduledAt && isAfter(todo.scheduledAt, endOfDay(new Date()))
			)
		}
		if (p.currentProject.type === "default") {
			return newSectionMap.set(section, filteredTodos)
		}

		newSectionMap.set(
			section,
			p.todos.filter((todo) => todo.sectionId === section.id)
		)
	})

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
							<TodoForm
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
						<TodoForm
							defValues={{ sectionId: defSection.id }}
							setOpen={setTodoFormOpen}
						/>
					)}
				</Fragment>
			)
	}
	return <>{todosJsx}</>
}
