import { format, formatISO, isBefore, isToday, startOfDay } from "date-fns"
import { doc, updateDoc } from "firebase/firestore"
import { useState } from "react"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import { FirestoreColl, GeneratedProject, Todo, User } from "../types"
import { TodoForm } from "../components/todo/todo_form/TodoForm"
import { TodoRender } from "../components/todo/TodoRender"
import { sortTodos } from "../helpers/sortTodos"

interface P {
	todos: Todo[]
	currentProject: GeneratedProject
}
export function TodayTodolist(p: P) {
	const [todoFormOpen, setTodoFormOpen] = useState(false)
	const projects = useAppSelector((s) => s.projects)
	const user = useAppSelector((s) => s.user.user as User)

	let filteredTodos = p.todos.filter(
		(todo) =>
			todo.scheduledAt &&
			(isToday(todo.scheduledAt) || isBefore(todo.scheduledAt, new Date()))
	)

	sortTodos(user, filteredTodos, p.currentProject, p.todos, projects)

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
					doc(
						db,
						`${FirestoreColl.Users}/${user.id}/${FirestoreColl.Todos}/${todo.id}`
					),
					{ scheduledAt: Date.now() }
				)
			)
		)
	}

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
			{overdueTodos.map((todo) => TodoRender({ setTodoFormOpen, todo }))}
			{regularSectionShowed && overdueSectionShowed && (
				<p className="text-lg font-bold mt-4 mb-2">{`Today, ${format(
					Date.now(),
					`d MMM`
				)}`}</p>
			)}
			{regularTodos.map((todo) => TodoRender({ setTodoFormOpen, todo }))}
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
