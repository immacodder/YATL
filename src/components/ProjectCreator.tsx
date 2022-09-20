import { doc, setDoc } from "firebase/firestore"
import { useState } from "react"
import Popup from "reactjs-popup"
import { v4 } from "uuid"
import { db } from "../firebase"
import { useAppDispatch, useAppSelector } from "../hooks"
import { uiStateActions } from "../slices/uiStateSlice"
import { FireCol, ProjectColors, RegularProject, User } from "../types"

export function ProjectCreator() {
	const [projectName, setProjectName] = useState("")
	const [projectColor, setProjectColor] = useState(ProjectColors.Cyan)
	const { id: userId } = useAppSelector((s) => s.user.user as User)
	const projectCreatorOpen = useAppSelector((s) => s.uiState.projectCreatorOpen)
	const dispatch = useAppDispatch()

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

	const resetNewProject = () => {
		dispatch(uiStateActions.set({ property: "projectCreator", to: false }))
		setProjectColor(ProjectColors.Cyan)
		setProjectName("")
	}

	return (
		<Popup
			keepTooltipInside
			// dialog
			onClose={() =>
				dispatch(uiStateActions.set({ property: "projectCreator", to: false }))
			}
			open={projectCreatorOpen}
			modal
		>
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
	)
}
