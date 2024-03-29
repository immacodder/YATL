import { Link, useParams } from "react-router-dom"
import { useAppSelector } from "../../hooks"
import {
	DefaultProjectsIcons,
	GeneratedProject,
	RegularProject,
} from "../../types"

export function DefaultProjects() {
	const projects = useAppSelector((s) => s.projects)
	let { projectId: selectedProjectId } = useParams()
	if (location.pathname.includes("tags")) selectedProjectId = "tags"
	if (!selectedProjectId) throw new Error("no project id found")

	return (
		<section className="w-full">
			<ul className="flex flex-col items-start list-none">
				{projects
					.filter(
						(project): project is GeneratedProject | RegularProject =>
							project.type === "generated" || "isInbox" in project
					)
					.map((proj) => {
						let selected = false
						let id = proj.id
						if (
							(selectedProjectId === "today" && proj.name === "Today") ||
							(selectedProjectId === "upcoming" && proj.name === "Upcoming") ||
							(selectedProjectId === "tags" && proj.name === "Tags") ||
							proj.id === selectedProjectId
						)
							selected = true
						if (proj.name === "Today") id = "today"
						if (proj.name === "Upcoming") id = "upcoming"
						if (proj.name === "Tags") id = "tags"

						return (
							<li
								key={proj.id}
								className={`projectLink w-full ${selected ? "selected" : ""}`}
							>
								<Link
									to={id === "tags" ? "/tags" : `/project/${id}`}
									className="p-2 w-full flex items-center"
								>
									<span className="material-icons mr-2">
										{"icon" in proj ? proj.icon : DefaultProjectsIcons.Inbox}
									</span>
									{proj.name[0].toUpperCase() + proj.name.slice(1)}
								</Link>
							</li>
						)
					})}
			</ul>
		</section>
	)
}
