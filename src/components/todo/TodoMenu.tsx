import {
	setDoc,
	doc,
	deleteDoc,
	updateDoc,
	Firestore,
	arrayRemove,
} from "firebase/firestore"
import { useRef, useState } from "react"
import { v4 } from "uuid"
import { db } from "../../firebase"
import { useAppSelector } from "../../hooks"
import { FirestoreColl, TagProject, Todo, User } from "../../types"
import { Dialog } from "../Dialog"
import { Menu, MenuType } from "../Menu"

interface P {
	todo: Todo
	setGlobalFormOpen: (id: string, open: boolean) => void
}
export function TodoMenu(p: P) {
	const menuAnchor = useRef<HTMLButtonElement>(null)
	const [menuOpen, setMenuOpen] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const user = useAppSelector((s) => s.user.user as User)
	const tags = useAppSelector((s) => s.projects).filter(
		(project) => project.type === "tag"
	) as TagProject[]

	const menuData: MenuType[] = [
		{
			name: "Edit",
			action: () => p.setGlobalFormOpen(p.todo.id, true),
			icon: "edit",
		},
		{
			name: "Duplicate",
			icon: "content_copy",
			action: () => {
				const newTodo = p.todo
				newTodo.id = v4()
				setDoc(
					doc(
						db,
						`${FirestoreColl.Users}/${user.id}/${FirestoreColl.Todos}/${newTodo.id}`
					),
					newTodo
				)
			},
		},
		{
			action: () => {
				setDeleteDialogOpen(true)
				setMenuOpen(false)
			},
			icon: "delete_forever",
			danger: true,
			name: `Delete`,
			separatorBefore: true,
		},
		// TODO
		// { name: "Set project" },
		// { name: "Set priority" },
		// { name: "Set reminder" },
		// { name: "Schedule" },
	]

	return (
		<>
			<Menu
				trigger={
					<button
						onClick={() => setMenuOpen(!menuOpen)}
						ref={menuAnchor}
						className="button bg-transparent rounded-full shadow-none ml-2 material-icons transition-colors hover:bg-primary hover:shadow-lg min-w-0"
					>
						more_horiz
					</button>
				}
				data={menuData}
			/>
			<Dialog
				action={async () => {
					// deletes the todo
					await deleteDoc(
						doc(
							db,
							`${FirestoreColl.Users}/${user.id}/${FirestoreColl.Todos}/${p.todo.id}`
						)
					)
					const tagsToUpdate = tags.filter((tag) =>
						tag.todoIds.includes(p.todo.id)
					)
					tagsToUpdate.forEach(async (tag) => {
						const tagToUpdate = doc(
							db,
							`${FirestoreColl.Users}/${user.id}/${FirestoreColl.Projects}/${tag.id}`
						)
						await updateDoc(tagToUpdate, { todoIds: arrayRemove(p.todo.id) })
					})
				}}
				setOpen={setDeleteDialogOpen}
				open={deleteDialogOpen}
				text={`Are you sure you want to delete ${p.todo.title}?`}
				danger
				confirmText="Delete it"
			/>
		</>
	)
}
