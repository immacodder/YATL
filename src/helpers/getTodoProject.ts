import { Project, Todo } from "../types";

export const getTodoProject = (todo: Todo, projects: Project[]) => {
  const project = projects.find(
    (proj) =>
      proj.type === "regular" &&
      proj.sections.find((section) => section.id === todo.sectionId)
  )
  if (!project) throw new Error("getTodoProject couldn't find the project")
  return project
}