import { Fragment, useState } from "react"
import TodoComp from "../components/todo/TodoComp"
import { TodoForm } from "../components/todo/todo_form/TodoForm"
import { useAppSelector } from "../hooks"
import { RegularProject, Section, Todo, User } from "../types"
import TodoEditForm from "../components/todo/todo_form/TodoEditForm"

interface P {
	currentProject: RegularProject
	todos: Todo[]
	showCompleted: boolean
	setShowCompleted: React.Dispatch<React.SetStateAction<boolean>>
}
export function Todolist(p: P) {
	const [todoFormOpen, setTodoFormOpen] = useState(false)
	const [todoEditOpen, setTodoEditOpen] = useState({
		id: null as null | string,
		open: false,
	})
	const [currentAddTodoSectionId, setCurrentAddTodoSectionId] = useState<
		string | null
	>(null)
	const [selectedSection, setSelectedSection] = useState<Section | null>(null)
	const user = useAppSelector((s) => s.user.user as User)

	const defSection = p.currentProject.sections[0]

	function onTodoEdit(todoId: string, open: boolean) {
		setTodoFormOpen(false)
		setTodoEditOpen({ id: todoId, open })
	}

	if (!selectedSection) setSelectedSection(defSection)

	const newSectionMap: Map<Section, Todo[]> = new Map()

	p.currentProject.sections.forEach((section) => {
		let filteredTodos: Todo[] = []
		filteredTodos = p.todos.filter((todo) => todo.sectionId === section.id)

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
		const newTodos = todos.map((todo, _i) => {
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
						<>
							<TodoComp
								project={p.currentProject}
								setGlobalFormOpen={onTodoEdit}
								todo={todo}
								key={todo.id}
							/>
							{todoEditOpen.open && todoEditOpen.id === todo.id && (
								<TodoEditForm setGlobalFormOpen={onTodoEdit} todo={todo} />
							)}
						</>
					)}
					{todoFormOpen &&
						currentAddTodoSectionId === section.id &&
						todo.id === todos[todos.length - 1].id && (
							<TodoForm
								setOpen={setTodoFormOpen}
								defValues={{ sectionId: section.id }}
							/>
						)}
					{todo.id === todos[todos.length - 1].id && !todoFormOpen && (
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
