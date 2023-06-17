import { deleteDoc, doc } from "firebase/firestore"
import { useState } from "react"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import { FireCol, Project, RegularProject, Todo, User } from "../types"
import { Dialog } from "./Dialog"
import { Menu, MenuType } from "./Menu"

interface P {
	todos: Todo[]
	setShowCompleted: (completed: boolean) => void
	showCompleted: boolean
	currentProject: Project
}

export function ProjectActions(p: P) {
	const [projectActionsOpen, setProjectActionsOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const user = useAppSelector((s) => s.user.user as User)

	if (p.currentProject.type !== "regular") return null

	const deleteProject = async () => {
		const todoIDs: string[] = p.todos
			.filter((todo) => {
				return (p.currentProject as RegularProject).sections.find(
					(sec) => sec.id === todo.sectionId
				)
			})
			.map((todo) => todo.id)

		await Promise.all(
			todoIDs.map(async (id) => {
				await deleteDoc(
					doc(db, `${FireCol.Users}/${user.id}/${FireCol.Todos}/${id}`)
				)
			})
		)

		await deleteDoc(
			doc(
				db,
				`${FireCol.Users}/${user.id}/${FireCol.Projects}/${p.currentProject.id}`
			)
		)
	}

	const projectActionsData: MenuType[] = [
		{
			name: p.showCompleted ? "Hide completed" : "Show completed",
			icon: p.showCompleted ? "remove_done" : "done",
			action: () => p.setShowCompleted(!p.showCompleted),
		},
		{
			icon: "delete_forever",
			name: "Delete project",
			danger: true,
			separatorBefore: true,
			action: () => setDeleteDialogOpen(true),
		},
	]

	return (
		<>
			<Menu
				data={projectActionsData}
				trigger={<button className="m-2 button mr-0">Project actions</button>}
			/>
			<Dialog
				open={deleteDialogOpen}
				setOpen={setDeleteDialogOpen}
				action={deleteProject}
				text={`Are you sure you want to delete ${p.currentProject.name}`}
				confirmText="Delete"
				danger
			/>
		</>
	)
}
