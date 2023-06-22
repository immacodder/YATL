import { Link } from "react-router-dom"
import { useAppSelector } from "../hooks"
import {
	Colors,
	DefaultProjectsIcons,
	FirestoreColl,
	TagProject,
	Todo,
} from "../types"
import { useState } from "react"
import Popup from "reactjs-popup"
import { deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"

interface P {
	todos: Todo[]
}
export function TagsRender(p: P) {
	const [deleteConfirm, setDeleteConfirm] = useState(false)
	const [editPopup, setEditPopup] = useState(false)
	const [tagName, setTagName] = useState("")
	const [deleteTodos, setDeleteTodos] = useState(false)
	const [selectedTagId, setSelectedTagId] = useState("")
	const user = useAppSelector((s) => s.user)
	const tags = useAppSelector((s) => s.projects).filter(
		(project) => project.type === "tag"
	) as TagProject[]
	const [selectedColor, setSelectedColor] = useState(Colors.Slate)

	async function onTagDelete(tagId: string, deleteAssignedTodos: boolean) {
		// add a checkbox if you also want to delete todos that are assigned to the tag
		const selectedTag = tags.find((t) => t.id === selectedTagId)!

		const tagRef = doc(
			db,
			`${FirestoreColl.Users}/${user.user!.id}/${
				FirestoreColl.Projects
			}/${tagId}`
		)
		await deleteDoc(tagRef)

		if (deleteAssignedTodos) {
			selectedTag.todoIds.forEach((todoId) => {
				const todoRef = doc(
					db,
					`${FirestoreColl.Users}/${user.user!.id}/${
						FirestoreColl.Todos
					}/${todoId}`
				)
				deleteDoc(todoRef)
			})
		}
	}
	function onDeleteClick(tagId: string) {
		setSelectedTagId(tagId)
		setDeleteConfirm(true)
		setDeleteTodos(false)
	}
	async function onTagEdit(newName: string) {
		const tagRef = doc(
			db,
			`${FirestoreColl.Users}/${user.user!.id}/${
				FirestoreColl.Projects
			}/${selectedTagId}`
		)
		await updateDoc(tagRef, { name: newName.trim(), color: selectedColor })
		setEditPopup(false)
	}
	function onEditClick(tagId: string) {
		const selectedTag = tags.find((t) => t.id === tagId)!
		setSelectedTagId(tagId)
		setTagName(selectedTag.name.trim())
		setEditPopup(true)
		setSelectedColor(selectedTag.color)
	}

	if (!tags.length)
		return (
			<div className="my-8 text-xl flex justify-center w-full">
				<p>Pretty empty here, mate, wanna add some tags?</p>
			</div>
		)

	return (
		<>
			{editPopup && (
				<Popup
					contentStyle={{
						padding: "1rem",
						margin: "auto auto",
						height: "fit-content",
					}}
					open={editPopup}
					onClose={() => setEditPopup(false)}
					modal
				>
					<>
						<p className="text-lg">Edit Tag</p>
						<input
							autoFocus
							placeholder="New tag name"
							className="input my-2"
							value={tagName}
							onChange={(e) => setTagName(e.target.value)}
						/>
						<div className="flex justify-start items-center">
							<select
								onChange={(e) => setSelectedColor(e.target.value as Colors)}
								className="input "
								value={selectedColor}
							>
								{Object.keys(Colors).map((colorName) => {
									const colorValue = Colors[colorName as keyof typeof Colors]
									return (
										<option key={colorName} value={colorValue}>
											{colorName}
										</option>
									)
								})}
							</select>
							<div
								className="rounded-full min-h-[20px] min-w-[20px] ml-1"
								style={{ backgroundColor: selectedColor }}
							/>
						</div>
						<div className="mt-2">
							<button
								onClick={() => {
									onTagEdit(tagName)
								}}
								className={`button hover:bg-red-500 mr-2`}
							>
								Confirm
							</button>
							<button
								onClick={() => {
									setEditPopup(false)
								}}
								className="button-outline"
							>
								Cancel
							</button>
						</div>
					</>
				</Popup>
			)}

			{deleteConfirm && (
				<Popup
					contentStyle={{
						padding: "1rem",
						margin: "auto auto",
						height: "fit-content",
					}}
					open={deleteConfirm}
					onClose={() => setDeleteConfirm(false)}
					modal
				>
					<>
						<p className="text-lg">Delete Tag?</p>
						<div>
							<input
								id="deleteTodosCheckbox"
								type="checkbox"
								checked={deleteTodos}
								onChange={() => setDeleteTodos(!deleteTodos)}
							/>
							<label
								className="ml-1 text-red-500"
								htmlFor="deleteTodosCheckbox"
							>
								Delete all todos assigned to the tag?
							</label>
						</div>
						<div className="mt-2">
							<button
								onClick={() => {
									setDeleteConfirm(false)
									if (!selectedTagId) throw new Error("No selected tag id")
									onTagDelete(selectedTagId, deleteTodos)
								}}
								className={`button hover:bg-red-500 mr-2`}
							>
								Confirm
							</button>
							<button
								onClick={() => setDeleteConfirm(false)}
								className="button-outline"
							>
								Cancel
							</button>
						</div>
					</>
				</Popup>
			)}

			<div className="m-4">
				{tags.map((tag) => (
					<Link
						to={`/tags/${tag.id}`}
						className="flex justify-between p-2 pr-3 bg-white mb-2 rounded-md"
						key={tag.id}
					>
						<div className="px-1 flex justify-start">
							<span
								className="material-icons mr-2 text-base"
								style={{ color: tag.color }}
							>
								{DefaultProjectsIcons.Tags}
							</span>
							<p>{tag.name}</p>
						</div>
						<div className="flex items-center justify-end">
							<p>{tag.todoIds.length}</p>
							<div className="ml-2 flex">
								<button
									className="material-icons px-1"
									onClick={(e) => {
										e.preventDefault()
										onEditClick(tag.id)
									}}
								>
									edit
								</button>
								<button
									className="material-icons px-1"
									onClick={(e) => {
										e.preventDefault()
										onDeleteClick(tag.id)
									}}
								>
									delete
								</button>
							</div>
						</div>
					</Link>
				))}
			</div>
		</>
	)
}
/*


I need tags stored somewhere
I need to render all the tags that are there in a neat list, with a number next to them, 
indicating the amount of todos assigned to the aforementioned tag
I need to be able to click on the tag to show all the todos in a project assigned to it in a project format

Questions:
Where to store the tags?
How do I get all the todos with a specific tag?
How do I handle the display and navigation of those tag projects? 


Steps:
X	Check the code to make sure that todoIds is updated
X	Remove the todo from todoIds on a tag when deleting todo
X	Apply the changes when editing the todo
X	Update the UI to show a tag color
X Render a simple UI with a tag list
X On tags view, add a delete, edit and new button, as well as add an click on title to edit feature
X	When adding todo in the tags project, automatically assign the tag to the todo
X	Render tags on the todoinfo
X	Allow changing the tag colour


*/
