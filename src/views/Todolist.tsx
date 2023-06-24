import { Fragment, useState } from "react"
import { TodoComp } from "../components/todo/TodoComp"
import { TodoForm } from "../components/todo/todo_form/TodoForm"
import { useAppSelector } from "../hooks"
import { RegularProject, Section, TagProject, Todo, User } from "../types"
import { TodoEditForm } from "../components/todo/todo_form/TodoEditForm"

interface P {
	currentProject: RegularProject | TagProject
	todos: Todo[]
	showCompleted: boolean
	setShowCompleted: React.Dispatch<React.SetStateAction<any>>
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
	const snackbarState = useAppSelector((s) => s.snackbar)

	const defSection = p.currentProject.sections[0]

	function onTodoEdit(todoId: string, open: boolean) {
		setTodoFormOpen(false)
		setTodoEditOpen({ id: todoId, open })
	}

	if (!selectedSection) setSelectedSection(defSection)

	const newSectionMap: Map<Section, Todo[]> = new Map()

	p.currentProject.sections.forEach((section) => {
		let filteredTodos: Todo[] = []
		// handle the case with TagProject --- done
		// After that, make sure to alter functionality when adding a todo to a tag
		if (p.currentProject.type === "tag") {
			filteredTodos = p.todos.filter((todo) =>
				(p.currentProject as TagProject).todoIds.includes(todo.id)
			)
		} else
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
			function renderTodo() {
				if (
					!snackbarState.todoDeletion ||
					todo.id !== snackbarState.todoDeletion.id
				) {
					if (todo.type !== "completed" || p.showCompleted)
						return (
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
						)
				}
				return null
			}
			return (
				<Fragment key={todo.id}>
					{sectionJSX}
					{renderTodo()}
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
							defValues={{
								sectionId: defSection.id,
								checked:
									p.currentProject.type === "tag" ? [p.currentProject.id] : [],
							}}
							setOpen={setTodoFormOpen}
						/>
					)}
				</Fragment>
			)
	}
	return <>{todosJsx}</>
}
