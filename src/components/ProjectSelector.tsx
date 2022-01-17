import { useRef, useState, Fragment } from "react"
import { useAppSelector } from "../hooks"
import { Section, UserSection } from "../types"
import Popup from "./Popup"
import { DefValues } from "./TodoFormWrapper"

interface P {
	defValues?: DefValues
	selectedSection: Section
	setSelectedSection: (sec: Section) => void
}
export default function ProjectSelector(p: P) {
	const projectButtonRef = useRef<HTMLButtonElement>(null)
	const [projectSelectorOpen, setProjectSelectorOpen] = useState(false)

	const projects = useAppSelector((s) => s.projects)

	const selectedSectionsProject = projects.find((proj) =>
		"sections" in proj
			? proj.sections?.find((sec) => sec.id === p.selectedSection.id)
			: false
	)!

	let projectName = ""
	projectName =
		p.selectedSection.type === "default"
			? selectedSectionsProject.name
			: `${selectedSectionsProject.name}/${p.selectedSection.name}`

	if (selectedSectionsProject.type === "tag") projectName = "Inbox"

	return (
		<>
			<button
				onClick={() => setProjectSelectorOpen(true)}
				className="button"
				ref={projectButtonRef}
				type="button"
			>
				{projectName}
			</button>
			{projectSelectorOpen && (
				<Popup
					anchor={projectButtonRef.current}
					setOpen={setProjectSelectorOpen}
					type="anchor"
				>
					<ul onClick={() => setProjectSelectorOpen(false)}>
						{projects.map((proj) => {
							if (proj.type !== "regular") return null
							const classNames =
								"hover:bg-black p-1 flex items-center hover:bg-opacity-10 rounded hover:cursor-pointer my-1"
							return (
								<Fragment key={proj.id}>
									{
										<li
											role="button"
											className={`${classNames} ${
												proj.sections.find((s) => s.id === p.selectedSection.id)
													? "bg-primary bg-opacity-50"
													: ""
											}`}
											onClick={() =>
												p.setSelectedSection(
													proj.sections.find((s) => s.type === "default")!
												)
											}
										>
											{
												<span
													className="min-w-[.75rem] min-h-[.75rem] m-1 rounded-full"
													style={{ backgroundColor: proj.color }}
												/>
											}
											{proj.name}
										</li>
									}
									{proj.sections
										.filter(
											(sec): sec is UserSection => sec.type === "userCreated"
										)
										.map((section) => (
											<li
												role="button"
												onClick={() => p.setSelectedSection(section)}
												className={`ml-4 flex items-center ${classNames} ${
													section.id === p.selectedSection.id
														? " bg-primary bg-opacity-50"
														: ""
												}`}
												key={section.id}
											>
												<span className="material-icons mr-1">segment</span>
												{section.name}
											</li>
										))}
								</Fragment>
							)
						})}
					</ul>
				</Popup>
			)}
		</>
	)
}
