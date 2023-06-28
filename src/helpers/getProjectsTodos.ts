import { RegularProject, TagProject, Todo } from "../types"

export function getProjectsTodos(
	project: RegularProject | TagProject,
	todos: Todo[]
): Todo[] {
	const filteredTodos: Todo[] = []
	project.sections.forEach((section) => {
		filteredTodos.push(...todos.filter((todo) => section.id === todo.sectionId))
	})

	return filteredTodos
}
