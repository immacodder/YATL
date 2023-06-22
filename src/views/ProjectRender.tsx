import { useState } from "react"
import {
	DefaultProjectsIcons,
	FirestoreColl,
	RegularProject,
	TagProject,
	Todo,
} from "../types"
import { ProjectActions } from "../components/ProjectActions"
import { ProjectView } from "../components/ProjectView"
import { SectionForm } from "../components/SectionForm"
import { Todolist } from "./Todolist"
import { doc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"

interface P {
	todos: Todo[]
	currentProject: RegularProject | TagProject
}
export function ProjectRender(p: P) {
	const [showCompleted, setShowCompleted] = useState(false)
	const [projectName, setProjectName] = useState(p.currentProject.name)
	const [projectNameOpen, setProjectNameOpen] = useState(false)
	const user = useAppSelector((s) => s.user)
	async function changeProjectName(projectName: string) {
		const ref = doc(
			db,
			`${FirestoreColl.Users}/${user.user!.id}/${FirestoreColl.Projects}/${
				p.currentProject.id
			}`
		)

		await updateDoc(ref, { name: projectName.trim() })
		setProjectName(projectName.trim())
		setProjectNameOpen(false)
	}
	const inputId = `projectNameForm-${p.currentProject.id}`

	return (
		<>
			<section className="m-4 flex justify-between mb-2 items-center">
				<form
					onSubmit={(e) => {
						e.preventDefault()
						changeProjectName(projectName)
					}}
				>
					{projectNameOpen ? (
						<div className="flex justify-start">
							<input
								autoFocus
								className="input"
								type="text"
								id={inputId}
								value={projectName}
								onChange={(e) => setProjectName(e.target.value)}
							/>
							<button type="submit" className="button ml-2">
								Accept
							</button>
							<button
								type="button"
								onClick={() => setProjectNameOpen(false)}
								className="button-outline highlight-danger ml-1"
							>
								Cancel
							</button>
						</div>
					) : (
						<h2
							onClick={() =>
								p.currentProject.name !== "Inbox" && setProjectNameOpen(true)
							}
							className={`text-xl font-bold h-max rounded-sm border-2 py-1
							${
								p.currentProject.name !== "Inbox" ?? "hover:border-black"
							} border-transparent`}
						>
							{p.currentProject.name}
							{p.currentProject.type === "tag" ? (
								<span
									className="material-icons text-base ml-2"
									style={{ color: p.currentProject.color }}
								>
									{DefaultProjectsIcons.Tags}
								</span>
							) : null}
						</h2>
					)}
				</form>
				<div className="flex justify-end ">
					<ProjectActions
						currentProject={p.currentProject}
						showCompleted={showCompleted}
						setShowCompleted={setShowCompleted}
						todos={p.todos}
					/>
					<ProjectView currentProject={p.currentProject} />
				</div>
			</section>

			<section className="m-4 mt-0">
				<Todolist
					showCompleted={showCompleted}
					setShowCompleted={setShowCompleted}
					todos={p.todos}
					currentProject={p.currentProject}
				/>
				<SectionForm currentProject={p.currentProject} />
			</section>
		</>
	)
}
