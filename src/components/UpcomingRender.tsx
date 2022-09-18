import {
	addDays,
	format,
	formatISO,
	isSameDay,
	isToday,
	isTomorrow,
	sub,
} from "date-fns/esm"
import { useEffect, useState } from "react"
import { v4 } from "uuid"
import { getTodoProject } from "../helpers/getTodoProject"
import { useAppSelector } from "../hooks"
import { GeneratedProject, Todo } from "../types"
import TodoComp from "./TodoComp"
import { TodoForm } from "./TodoForm"

interface P {
	todos: Todo[]
	currentProject: GeneratedProject
}
interface section {
	day: string
	todos: Todo[]
	formattedDate: string
	timestamp: number
	id: string
}

function generateSections(todos: Todo[], amount: number = 20) {
	const timestamps: number[] = []
	// Starts as yesterday
	let currentDate = sub(Date.now(), { days: 1 })
	for (let i = 0; i <= amount; i++) {
		currentDate = addDays(currentDate, 1)
		timestamps.push(currentDate.getTime())
	}
	return timestamps.map((timestamp) => generateSection(timestamp, todos))
}

function generateSection(timestamp: number, todos: Todo[]): section {
	let day
	const dayOfTheWeek = format(timestamp, "EEEE", { weekStartsOn: 1 })
	if (isToday(timestamp)) day = `Today ‧ ${dayOfTheWeek}`
	else if (isTomorrow(timestamp))
		day = `Tomorrow ‧ ${format(timestamp, "EEEE", { weekStartsOn: 1 })}`
	else day = dayOfTheWeek

	let formattedDate = format(timestamp, "d MMM")

	const datesTodos = todos.filter((todo) => {
		if (!todo.scheduledAt) return
		if (isSameDay(todo.scheduledAt, timestamp)) return todo
	})

	return { timestamp, day, formattedDate, id: v4(), todos: datesTodos }
}

export function Upcoming(p: P) {
	const [sections, setSections] = useState<section[]>([])
	const [todoFormOpen, setTodoFormOpen] = useState(false)
	const [currentAddTodoSectionId, setCurrentAddTodoSectionId] = useState<
		string | null
	>(null)
	const projects = useAppSelector((s) => s.projects)

	useEffect(() => {
		setSections(generateSections(p.todos, 200))
	}, [p.todos])

	return (
		<section className="m-4">
			{sections.map((section) => {
				return (
					<section key={section.id}>
						<h3 className="text-lg font-bold mt-4 mb-2">{`${section.formattedDate} ‧ ${section.day}`}</h3>
						<hr />
						{section.todos
							.filter((todo) => todo.type !== "completed")
							.map((todo) => (
								<TodoComp
									project={getTodoProject(todo, projects)}
									setGlobalFormOpen={(id, open) => {
										setTodoFormOpen(open)
										setCurrentAddTodoSectionId(id)
									}}
									todo={todo}
									key={todo.id}
								/>
							))}
						{todoFormOpen && currentAddTodoSectionId === section.id ? (
							<TodoForm
								setOpen={setTodoFormOpen}
								defValues={{
									schedule: {
										date: formatISO(section.timestamp, {
											representation: "date",
										}),
										open: false,
										time: null,
									},
								}}
							/>
						) : (
							<button
								className="button"
								onClick={() => {
									setTodoFormOpen(true)
									setCurrentAddTodoSectionId(section.id)
								}}
							>
								Add todo
							</button>
						)}
					</section>
				)
			})}
		</section>
	)
}
