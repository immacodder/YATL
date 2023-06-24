import { Project, Todo, User } from "../types"

export function getFilteredByProject(
  projects: Project[],
  todos: Todo[],
  filteredTodos: Todo[]
) {
  let projectList = new Set<string>()
  const sortedTodos: Todo[] = []

  filteredTodos.forEach((todo) =>
    projectList.add(getProject(todo.sectionId, projects).id)
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
      if (getProject(todo.sectionId, projects).id === projectId)
        sortedTodos.push(todo)
    })
  }

  return sortedTodos
}

function getProject(sectionId: string, projects: Project[]) {
  return projects.find(
    (proj) =>
      proj.type === "regular" &&
      proj.sections.find((section) => section.id === sectionId)
  )!
}

export function sortTodos(user: User, initialFilteredTodos: Todo[], currentProject: Project, todos: Todo[], projects: Project[]) {
  let filteredTodos = initialFilteredTodos

  if (Object.keys(user.preferences.sortBy).includes(currentProject.id)) {
    filteredTodos.sort((a, b) => {
      switch (user.preferences.sortBy[currentProject.id]) {
        case "alphabetically":
          return a.title.localeCompare(b.title)
        case "date_added":
          return b.createdAt - a.createdAt
        case "due_date":
          return (b.scheduledAt ?? 0) - (a.scheduledAt ?? 0)
        case "priority":
          return a.priority - b.priority
        case "project":
          filteredTodos = getFilteredByProject(
            projects,
            todos,
            filteredTodos
          )
          return 0
        default:
          throw new Error("Case not handled")
      }
    })
  }
  return filteredTodos
}