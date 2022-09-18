import { isToday, isBefore, startOfDay, format, formatISO } from "date-fns"
import { doc, updateDoc } from "firebase/firestore"
import { Fragment, useState } from "react"
import { db } from "../firebase"
import { getTodoProject } from "../helpers/getTodoProject"
import { useAppSelector } from "../hooks"
import { FireCol, GeneratedProject, Todo, User } from "../types"
import TodoComp from "./TodoComp"
import TodoEditForm from "./TodoEditForm"
import { TodoForm } from "./TodoForm"

interface P {
	todos: Todo[]
	currentProject: GeneratedProject
}
export function TodayTodolist(p: P) {
	const [todoFormOpen, setTodoFormOpen] = useState(false)
	const [todoEditOpen, setTodoEditOpen] = useState({
		id: null as null | string,
		open: false,
	})
	const projects = useAppSelector((s) => s.projects)
	const user = useAppSelector((s) => s.user.user as User)

	function onTodoEdit(todoId: string, open: boolean) {
		setTodoFormOpen(false)
		setTodoEditOpen({ id: todoId, open })
	}

	let filteredTodos = p.todos.filter(
		(todo) =>
			todo.scheduledAt &&
			(isToday(todo.scheduledAt) || isBefore(todo.scheduledAt, new Date()))
	)
	if (Object.keys(user.preferences.sortBy).includes(p.currentProject.id)) {
		const getProject = (sectionId: string) =>
			projects.find(
				(proj) =>
					proj.type === "regular" &&
					proj.sections.find((section) => section.id === sectionId)
			)!

		function getFilteredByProject(todos: Todo[]) {
			let projectList = new Set<string>()
			const sortedTodos: Todo[] = []

			filteredTodos.forEach((todo) =>
				projectList.add(getProject(todo.sectionId).id)
			)

			// order by alphabet
			projectList = new Set(
				[...projectList].sort((a, b) => {
					const getProjectById = (id: string) =>
						projects.find((proj) => proj.id === id)!
					return getProjectById(a).name.localeCompare(getProjectById(b).name)
				})
			)

			for (let projectId of projectList) {
				todos.forEach((todo) => {
					if (getProject(todo.sectionId).id === projectId)
						sortedTodos.push(todo)
				})
			}

			return sortedTodos
		}

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
					filteredTodos = getFilteredByProject(filteredTodos)
					return 0

				default:
					throw new Error("Case not handled")
			}
		})
	}

	let overdueSectionShowed = false
	let regularSectionShowed = false
	const regularTodos: Todo[] = []
	const overdueTodos: Todo[] = []

	function isTodoOverdue(todo: Todo) {
		return isBefore(todo.scheduledAt as number, startOfDay(new Date()))
	}

	filteredTodos.forEach((todo) => {
		const todoOverdue = isTodoOverdue(todo)
		if (todoOverdue) {
			overdueTodos.push(todo)
			return (overdueSectionShowed = true)
		}
		regularTodos.push(todo)
		regularSectionShowed = true
	})

	function onRescheduleClick() {
		return Promise.all(
			overdueTodos.map((todo) =>
				updateDoc(
					doc(db, `${FireCol.Users}/${user.id}/${FireCol.Todos}/${todo.id}`),
					{ scheduledAt: Date.now() }
				)
			)
		)
	}

	const renderTodo = (todo: Todo) => (
		<Fragment key={todo.id}>
			{!(todoEditOpen.open && todoEditOpen.id === todo.id) && (
				<TodoComp
					project={getTodoProject(todo, projects)}
					setGlobalFormOpen={onTodoEdit}
					todo={todo}
				/>
			)}
			{todoEditOpen.open && todoEditOpen.id === todo.id && (
				<TodoEditForm setGlobalFormOpen={onTodoEdit} todo={todo} />
			)}
		</Fragment>
	)

	return (
		<>
			{overdueSectionShowed && (
				<div className="flex items-center justify-between mb-2">
					<p className="text-lg font-bold text-[#db1421]">Overdue</p>
					<button className="hover:underline" onClick={onRescheduleClick}>
						Reschedule
					</button>
				</div>
			)}
			{overdueTodos.map((todo) => renderTodo(todo))}
			{regularSectionShowed && overdueSectionShowed && (
				<p className="text-lg font-bold mt-4 mb-2">{`Today, ${format(
					Date.now(),
					`d MMM`
				)}`}</p>
			)}
			{regularTodos.map((todo) => renderTodo(todo))}
			{todoFormOpen && (
				<TodoForm
					defValues={{
						schedule: {
							date: formatISO(Date.now(), { representation: "date" }),
							time: null,
							open: false,
						},
					}}
					setOpen={setTodoFormOpen}
				/>
			)}
			{!todoFormOpen && (
				<button
					className="button"
					onClick={() => {
						setTodoFormOpen(true)
					}}
				>
					Add todo
				</button>
			)}
		</>
	)
}
