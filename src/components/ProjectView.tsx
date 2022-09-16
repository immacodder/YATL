import { useRef, useState } from "react"
import { Project } from "../types"
import Popup from "./Popup"
import { ProjectViewSort } from "./ProjectViewSort"

interface P {
	currentProject: Project
}
export function ProjectView(p: P) {
	const anchor = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)

	const menuData = [
		{
			name: "Sort by",
			icon: "sort",
		},
		{
			name: "Group by",
			icon: "flip_to_front",
		},
	]

	return (
		<>
			<button
				ref={anchor}
				onClick={() => setOpen(!open)}
				className="m-2 button mr-0"
			>
				View
			</button>
			{open && (
				<Popup
					anchor={anchor.current}
					setOpen={setOpen}
					type="anchor"
					offsetRight={100}
				>
					<div className="flex flex-row items-start">
						<ProjectViewSort currentProject={p.currentProject} />
					</div>
				</Popup>
			)}
		</>
	)
}
