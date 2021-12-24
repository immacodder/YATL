import { Link, useParams } from "react-router-dom"
import { useAppSelector } from "../hooks"
import { DefaultProject } from "../types"

export default function SidebarDefaultProjects() {
	const projects = useAppSelector((s) => s.projects)
	const { projectId: selectedProjectId } = useParams()
	if (!selectedProjectId) throw new Error("no project id found")

	return (
		<section className="w-full">
			<ul className="flex flex-col items-start list-none">
				{projects
					.filter(
						(project): project is DefaultProject => project.type === "default"
					)
					.map((proj) => (
						<li
							key={proj.id}
							className={` w-full ${
								proj.id === selectedProjectId ? "selected" : ""
							}`}
						>
							<Link
								to={`/project/${proj.id}`}
								className="p-2 w-full flex items-center"
							>
								<span className="material-icons mr-2">{proj.icon}</span>
								{proj.name[0].toUpperCase() + proj.name.slice(1)}
							</Link>
						</li>
					))}
			</ul>
		</section>
	)
}
