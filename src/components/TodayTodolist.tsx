import { isToday, isBefore, startOfDay, format } from "date-fns"
import { Fragment, useState } from "react"
import { useAppSelector } from "../hooks"
import { GeneratedProject, Todo } from "../types"
import TodoComp from "./TodoComp"
import TodoFormWithDefValues from "./TodoFormWithDefValues"
import TodoFormWrapper from "./TodoFormWrapper"

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

	function onTodoEdit(todoId: string, open: boolean) {
		setTodoFormOpen(false)
		setTodoEditOpen({ id: todoId, open })
	}

	const filteredTodos = p.todos.filter(
		(todo) =>
			todo.scheduledAt &&
			(isToday(todo.scheduledAt) || isBefore(todo.scheduledAt, new Date()))
	)

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

	const getTodoProject = (todo: Todo) =>
		projects.find(
			(proj) =>
				proj.type === "regular" &&
				proj.sections.find((section) => section.id === todo.sectionId)
		)!

	return (
		<>
			{overdueSectionShowed && (
				<div className="flex items-center justify-between mb-2">
					<p className="text-lg font-bold text-[#db1421]">Overdue</p>
					<button className="hover:underline ">Reschedule</button>
				</div>
			)}
			{overdueTodos.map((todo) => (
				<TodoComp
					project={getTodoProject(todo)}
					setGlobalFormOpen={onTodoEdit}
					todo={todo}
					key={todo.id}
				/>
			))}
			{regularSectionShowed && overdueSectionShowed && (
				<p className="text-lg font-bold mt-4 mb-2">{`Today, ${format(
					Date.now(),
					`d MMM`
				)}`}</p>
			)}
			{regularTodos.map((todo) => (
				<Fragment key={todo.id}>
					<TodoComp
						project={getTodoProject(todo)}
						setGlobalFormOpen={onTodoEdit}
						todo={todo}
					/>
					{todoEditOpen.open && todoEditOpen.id === todo.id && (
						<TodoFormWithDefValues setGlobalFormOpen={onTodoEdit} todo={todo} />
					)}
					{todoFormOpen && todo.id === p.todos[p.todos.length - 1].id && (
						<TodoFormWrapper setOpen={setTodoFormOpen} />
					)}
					{todo.id === p.todos[p.todos.length - 1].id && !todoFormOpen && (
						<button
							className="button"
							onClick={() => {
								setTodoFormOpen(true)
							}}
						>
							Add todo
						</button>
					)}
				</Fragment>
			))}
		</>
	)
}
