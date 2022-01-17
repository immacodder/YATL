import { setDoc, doc } from "firebase/firestore"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { v4 } from "uuid"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import { RegularProject, ProjectColors, FireCol, User } from "../types"
import Popup from "./Popup"

export default function SidebarProjects() {
	const projects = useAppSelector((s) => s.projects)
	const [projectOpen, setProjectOpen] = useState(false)
	const [projectName, setProjectName] = useState("")
	const [projectColor, setProjectColor] = useState(ProjectColors.Cyan)
	const { id: userId } = useAppSelector((s) => s.user.user as User)
	const [projectListExpanded, setProjectListExpanded] = useState(true)
	const { projectId: selectedProjectId } = useParams()
	if (!selectedProjectId) throw new Error("no project id found")

	const resetNewProject = () => {
		setProjectOpen(false)
		setProjectColor(ProjectColors.Cyan)
		setProjectName("")
	}
	const onNewProjectAdd = async () => {
		if (
			projectName.trim().length < 2 ||
			["today", "upcoming", "inbox"].includes(projectName.toLowerCase())
		)
			return

		const newProject: RegularProject = {
			type: "regular",
			color: projectColor,
			createdAt: new Date().getTime(),
			id: v4(),
			name: projectName.trim(),
			sections: [{ id: v4(), type: "default" }],
		}

		await setDoc(
			doc(
				db,
				`${FireCol.Users}/${userId}/${FireCol.Projects}/${newProject.id}`
			),
			newProject
		)
		resetNewProject()
	}

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
									className={`flex items-center my-2 w-full p-1 pl-0 highlight ${
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
					onClick={() => setProjectOpen(true)}
					className="flex mt-2 justify-between w-full items-center"
				>
					<p>New project</p>
					<span className="material-icons">add</span>
				</button>
				{projectOpen && (
					<Popup type="dialog" anchor={null} setOpen={setProjectOpen}>
						<form onSubmit={(e) => e.preventDefault()}>
							<header>
								<h3 className="text-lg mb-2">Create a new project</h3>
							</header>
							<label className="mt-2" htmlFor="projectColor w-full">
								Select a color
							</label>
							<br />
							<div className="flex items-center flex-wrap mb-2">
								<div
									style={{ backgroundColor: projectColor }}
									className="w-4 h-4 rounded-full"
								/>
								<select
									value={projectColor}
									id="projectColor"
									className="button bg-white border-2 p-1 ml-2 outline-none"
									onChange={(e) => setProjectColor(e.target.value as any)}
								>
									{Object.keys(ProjectColors).map((key) => (
										<option
											key={key}
											value={ProjectColors[key as keyof typeof ProjectColors]}
										>
											{key}
										</option>
									))}
								</select>
							</div>
							<label htmlFor="projectNameInput">Name your project</label>
							<br />
							<input
								id="projectNameInput"
								maxLength={20}
								type="text"
								value={projectName}
								onChange={(e) => setProjectName(e.target.value)}
								className="input w-[300px]"
							/>
							<footer>
								<div className="flex justify-end mt-2">
									<button
										onClick={resetNewProject}
										type="button"
										className="button bg-secondary text-white mr-2"
									>
										Cancel
									</button>
									<button
										className="button"
										type="submit"
										onClick={onNewProjectAdd}
										disabled={projectName.trim().length < 2}
									>
										Add
									</button>
								</div>
							</footer>
						</form>
					</Popup>
				)}
			</section>
		</>
	)
}
