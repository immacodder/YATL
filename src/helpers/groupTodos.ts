import { format } from "date-fns"
import { GroupBy, Priorities, Project, TagProject, Todo } from "../types"
import { getSortedByProject } from "./sortTodos"
import { getTodoProject } from "./getTodoProject"

export interface GroupInfo {
	type: "group"
	id: string
	name: string
}
export enum PriorityNames {
	p1 = "Priority 1",
	p2 = "Priority 2",
	p3 = "Priority 3",
	p_none = "Priority not set",
}

type simpleMap = Map<string, Todo[]>
export type groupMap = Map<GroupInfo, Todo[]>

export function groupTodos(
	groupBy: GroupBy,
	initialFilteredTodos: Todo[],
	todos: Todo[],
	projects: Project[]
): groupMap {
	const filteredTodos = initialFilteredTodos

	switch (groupBy) {
		case GroupBy.date_added:
			return transformIntoGroup(byDateAdded())
		case GroupBy.due_date:
			return transformIntoGroup(byDueDate())
		case GroupBy.tag:
			return transformIntoGroup(byTag())
		case GroupBy.priority:
			return transformIntoGroup(byPriority())
		case GroupBy.project:
			return transformIntoGroup(byProject())
		default:
			console.log(groupBy)
			throw new Error(`Case ${groupBy || "undefined"} not handled`)
	}

	function byPriority(): simpleMap {
		const grouped: simpleMap = new Map()
		const none: Todo[] = []
		const p1: Todo[] = []
		const p2: Todo[] = []
		const p3: Todo[] = []

		filteredTodos.forEach((todo) => {
			switch (todo.priority) {
				case Priorities.None:
					none.push(todo)
					break
				case Priorities.P1:
					p1.push(todo)
					break
				case Priorities.P2:
					p2.push(todo)
					break
				case Priorities.P3:
					p3.push(todo)
					break
			}
		})

		grouped.set(PriorityNames.p1, p1)
		grouped.set(PriorityNames.p2, p2)
		grouped.set(PriorityNames.p3, p3)
		grouped.set(PriorityNames.p_none, none)
		return grouped
	}
	function byDueDate(): simpleMap {
		const grouped: simpleMap = new Map()
		filteredTodos.forEach((todo) => {
			const formatted = todo.scheduledAt
				? format(todo.scheduledAt, "d MMM")
				: "Not scheduled"
			if (grouped.has(formatted)) {
				grouped.set(formatted, [...grouped.get(formatted)!, todo])
			} else {
				grouped.set(formatted, [todo])
			}
		})
		return grouped
	}
	function byDateAdded(): simpleMap {
		const newGroupMap: simpleMap = new Map()
		filteredTodos.sort((a, b) => b.createdAt - a.createdAt)
		filteredTodos.forEach((todo) => {
			const formatted = format(todo.createdAt, "d MMM")
			if (newGroupMap.has(formatted)) {
				newGroupMap.set(formatted, [...newGroupMap.get(formatted)!, todo])
			} else {
				newGroupMap.set(formatted, [todo])
			}
		})
		return newGroupMap
	}
	function byTag(): simpleMap {
		const grouped: simpleMap = new Map()
		const tagProjects = projects
			.filter((p) => p.type === "tag")
			.sort((a, b) => a.name.localeCompare(b.name)) as TagProject[]

		tagProjects.forEach((tag) => {
			const todosInTag: Todo[] = []
			tag.todoIds.forEach((todoId) => {
				todosInTag.push(todos.find((todo) => todo.id === todoId)!)
			})
			grouped.set(tag.name, todosInTag)
		})

		return grouped
	}
	function byProject(): simpleMap {
		const grouped: simpleMap = new Map()
		const sortedByProject = getSortedByProject(projects, todos, filteredTodos)
		sortedByProject.forEach((todo) => {
			const todosProject = getTodoProject(todo, projects)
			if (!grouped.has(todosProject.name)) {
				grouped.set(todosProject.name, [todo])
			} else
				grouped.set(todosProject.name, [
					...grouped.get(todosProject.name)!,
					todo,
				])
		})

		return grouped
	}

	function transformIntoGroup(simpleMap: simpleMap): groupMap {
		const groupMap: groupMap = new Map()
		simpleMap.forEach((value, name) => {
			// the reason why I use name for both name and id is that it's staying the same between renders
			const newKey: GroupInfo = { name, id: name, type: "group" }
			groupMap.set(newKey, value)
		})
		return groupMap
	}
}
