import { Fragment, useState } from "react"
import { TodoComp } from "../components/todo/TodoComp"
import { DefValues, TodoForm } from "../components/todo/todo_form/TodoForm"
import { useAppSelector } from "../hooks"
import {
	GroupBy,
	Priorities,
	RegularProject,
	Section,
	TagProject,
	Todo,
	User,
} from "../types"
import { TodoEditForm } from "../components/todo/todo_form/TodoEditForm"
import { sortTodos } from "../helpers/sortTodos"
import { GroupInfo, PriorityNames, groupTodos } from "../helpers/groupTodos"
import { getProjectsTodos } from "../helpers/getProjectsTodos"
import { getTodoProject } from "../helpers/getTodoProject"

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
	const projects = useAppSelector((s) => s.projects)
	const groupBy = user.preferences.groupBy[p.currentProject.id]!
	const grouped = groupBy !== GroupBy.none
	const defSection = p.currentProject.sections[0]

	if (!selectedSection) setSelectedSection(defSection)

	type groupMap = Map<GroupInfo, Todo[]>
	type sectionMap = Map<Section, Todo[]>

	let sectionMap: sectionMap | null = null
	let groupedMap: groupMap | null = null

	if (!grouped) {
		p.currentProject.sections.forEach((section) => {
			let filteredTodos: Todo[] = []

			if (p.currentProject.type === "tag") {
				filteredTodos = p.todos.filter((todo) =>
					(p.currentProject as TagProject).todoIds.includes(todo.id)
				)
			} else
				filteredTodos = p.todos.filter((todo) => todo.sectionId === section.id)

			filteredTodos = sortTodos(
				user,
				filteredTodos,
				p.currentProject,
				p.todos,
				projects
			)

			if (!sectionMap) sectionMap = new Map()
			sectionMap.set(section, filteredTodos)
		})
	} else if (grouped) {
		const projectsTodos = getProjectsTodos(p.currentProject, p.todos)
		const sortedTodos = sortTodos(
			user,
			projectsTodos,
			p.currentProject,
			p.todos,
			projects
		)
		const groupedTodos = groupTodos(groupBy, sortedTodos, p.todos, projects)
		groupedMap = groupedTodos
	}

	const todosJsx: JSX.Element[] = []

	function renderTodos(
		section: Section | GroupInfo,
		sectionTodos: Todo[]
	): void {
		let sectionUsed = false
		const newTodos = sectionTodos.map((todo) => {
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
									key={todo.id + section.id}
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
				<Fragment key={todo.id + section.id}>
					{sectionJSX}
					{renderTodo()}
					{(() => {
						if (
							todoFormOpen &&
							currentAddTodoSectionId === section.id &&
							todo.id === sectionTodos[sectionTodos.length - 1].id
						) {
							let defValues: DefValues = { sectionId: section.id }
							if (grouped) {
								const sectionId = (
									getTodoProject(todo, projects) as RegularProject
								).sections[0].id
								const typedSection = section as GroupInfo

								switch (groupBy) {
									case GroupBy.date_added:
										defValues = { sectionId }
										break
									case GroupBy.due_date:
										defValues = {
											schedule: {
												date: new Date(
													todo.scheduledAt ?? new Date()
												).toLocaleDateString(),
												open: false,
												time: null,
											},
											sectionId,
										}
										break
									case GroupBy.priority:
										let priority: Priorities = Priorities.None
										switch (typedSection.name as PriorityNames) {
											case PriorityNames.p1:
												priority = Priorities.P1
												break
											case PriorityNames.p2:
												priority = Priorities.P2
												break
											case PriorityNames.p3:
												priority = Priorities.P3
												break
										}
										defValues = { sectionId, priority }
										break
									case GroupBy.tag:
										const tagId = projects
											.filter((p) => p.type === "tag")
											.find((tag) => tag.name === typedSection.name)!.id
										defValues = { tags: [tagId], sectionId }
										break
									case GroupBy.project:
										const sectionFromNameId = projects.find(
											(p): p is RegularProject => p.name === typedSection.name
										)!.sections[0].id
										defValues = { sectionId: sectionFromNameId }
										break
								}
							}
							return (
								<TodoForm setOpen={setTodoFormOpen} defValues={defValues} />
							)
						}
					})()}
					{todo.id === sectionTodos[sectionTodos.length - 1].id &&
						!todoFormOpen && (
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
								tags:
									p.currentProject.type === "tag" ? [p.currentProject.id] : [],
							}}
							setOpen={setTodoFormOpen}
						/>
					)}
				</Fragment>
			)
	}

	if (grouped) {
		for (let [key, value] of groupedMap!) {
			renderTodos(key, value)
		}
	} else {
		for (let [key, value] of sectionMap!) {
			renderTodos(key, value)
		}
	}

	return <>{todosJsx}</>

	function onTodoEdit(todoId: string, open: boolean) {
		setTodoFormOpen(false)
		setTodoEditOpen({ id: todoId, open })
	}
}
