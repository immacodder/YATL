import { useNavigate } from "react-router-dom"
import { useAppSelector } from "../../hooks"
import { TagProject } from "../../types"

export function SidebarTags() {
	const tagProjects = useAppSelector((s) => s.projects).filter(
		(proj): proj is TagProject => proj.type === "tag"
	)
	const navigate = useNavigate()

	return (
		<>
			<ul className="w-full mt-2">
				{tagProjects.map((tagProject) => (
					<li
						role="button"
						onClick={() => navigate(`/tag/${tagProject.id}`)}
						key={tagProject.id}
						className="highlight flex items-center p-2"
					>
						<span className="material-icons mr-2">local_offer</span>
						{tagProject.name}
					</li>
				))}
			</ul>
		</>
	)
}
