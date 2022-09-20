import Popup from "reactjs-popup"
import { Project } from "../types"
import { ProjectViewSort } from "./ProjectViewSort"

interface P {
	currentProject: Project
}
export function ProjectView(p: P) {
	return (
		<Popup
			position="left center"
			trigger={<button className="m-2 button mr-0">View</button>}
		>
			<div className="flex flex-row items-start">
				<ProjectViewSort currentProject={p.currentProject} />
			</div>
		</Popup>
	)
}
