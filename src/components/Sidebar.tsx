import { doc, setDoc } from "firebase/firestore"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { v4 } from "uuid"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import {
	DefaultProject,
	FireCol,
	Project,
	ProjectColors,
	User,
	UserCreatedProject,
} from "../types"
import Popup from "./Popup"

interface P {
	projects: Project[]
}
export default function Sidebar(p: P) {
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

		const newProject: UserCreatedProject = {
			type: "userCreated",
			color: projectColor,
			comment: null,
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
			<aside className="bg-white p-2 flex flex-col items-start justify-start">
				<section className="w-full">
					<ul className="flex flex-col items-start list-none">
						{p.projects
							.filter(
								(project): project is DefaultProject =>
									project.type === "default"
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
						p.projects
							.filter(
								(project): project is UserCreatedProject =>
									project.type === "userCreated"
							)
							.map((proj) => (
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
							))}
					<button
						onClick={() => setProjectOpen(true)}
						className="flex mt-2 justify-between w-full items-center"
					>
						<p>New project</p>
						<span className="material-icons">add</span>
					</button>
				</section>
			</aside>
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
									className="button bg-secondary text-white mr-2"
								>
									Cancel
								</button>
								<button
									className="button"
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
		</>
	)
}
