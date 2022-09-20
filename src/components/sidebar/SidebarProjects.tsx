import { useState } from "react"
import { useDispatch } from "react-redux"
import { Link, useParams } from "react-router-dom"
import { useAppSelector } from "../../hooks"
import { uiStateActions } from "../../slices/uiStateSlice"
import { RegularProject } from "../../types"

export function SidebarProjects() {
	const projects = useAppSelector((s) => s.projects)
	const [projectListExpanded, setProjectListExpanded] = useState(true)
	const { projectId: selectedProjectId } = useParams()
	if (!selectedProjectId) throw new Error("no project id found")
	const dispatch = useDispatch()

	return (
		<>
			<section className="mt-4 w-full p-2">
				<p
					className="text-lg flex justify-between select-none"
					onClick={() => setProjectListExpanded(!projectListExpanded)}
				>
					Projects
					<button className="material-icons">
						{projectListExpanded ? "expand_less" : "expand_more"}
					</button>
				</p>
				{projectListExpanded &&
					projects
						.filter(
							(project): project is RegularProject => project.type === "regular"
						)
						.map((proj) => {
							if (proj.isInbox) return null
							return (
								<Link
									className={`projectLink flex items-center my-2 w-full p-1 pl-0 highlight ${
										proj.id === selectedProjectId ? "selected" : ""
									}`}
									key={proj.id}
									to={`/project/${proj.id}`}
								>
									<div
										className="min-h-[.75rem] min-w-[.75rem] rounded-full mr-2"
										style={{ backgroundColor: proj.color }}
									/>
									{proj.name}
								</Link>
							)
						})}
				<button
					onClick={() => {
						dispatch(
							uiStateActions.set({ property: "projectCreator", to: true })
						)
					}}
					className="newProjectButton flex mt-2 justify-between w-full items-center"
				>
					<p>New project</p>
					<span className="material-icons">add</span>
				</button>
			</section>
		</>
	)
}
