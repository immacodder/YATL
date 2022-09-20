import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore"
import React, { useRef } from "react"
import Popup from "reactjs-popup"
import { db } from "../../../firebase"
import { useAppSelector } from "../../../hooks"
import { FireCol, TagProject, User } from "../../../types"

interface P {
	tagInfo: {
		open: boolean
		name: string
	}
	setTagInfo: (info: P["tagInfo"]) => void
	currentTodoId: string
	checked: string[]
	setChecked: React.Dispatch<React.SetStateAction<string[]>>
}

export function TagSelector(p: P) {
	const user = useAppSelector((s) => s.user.user as User)
	const tagProjects = useAppSelector((s) => s.projects).filter(
		(proj): proj is TagProject => proj.type === "tag"
	)

	const onCheckboxClick = (id: string) => {
		let data: object
		if (p.checked.includes(id)) {
			p.setChecked(p.checked.filter((v) => v !== id))
			data = { todoIds: arrayRemove(p.currentTodoId) }
		} else {
			p.setChecked([...p.checked, id])
			data = { todoIds: arrayUnion(p.currentTodoId) }
		}

		updateDoc(
			doc(db, `${FireCol.Users}/${user.id}/${FireCol.Projects}/${id}`),
			data
		)
	}

	const onCreateTag = async () => {
		// TODO fix it
		// const newTag: TagProject = {
		// 	type: "tag",
		// 	id: v4(),
		// 	name: p.tagInfo.name,
		// 	todoIds: [],
		// 	createdAt: new Date().getTime(),
		// 	sections: [{ type: "default", id: v4() }],
		// }
		// const ref = doc(
		// 	db,
		// 	`${FireCol.Users}/${user.id}/${FireCol.Projects}/${newTag.id}`
		// )
		// setDoc(ref, newTag)
		// p.setTagInfo({ ...p.tagInfo, name: "" })
	}

	return (
		<Popup
			keepTooltipInside
			trigger={
				<button
					onClick={() => p.setTagInfo({ ...p.tagInfo, open: true })}
					type="button"
					className="button mx-1 flex items-center"
				>
					Tags
					<span className="material-icons ml-1">new_label</span>
				</button>
			}
		>
			<>
				{!!tagProjects.length && <p className="text-lg">Select tags</p>}
				{tagProjects.map((tag) => (
					<React.Fragment key={tag.id}>
						<input
							type="checkbox"
							id={tag.id}
							onChange={() => onCheckboxClick(tag.id)}
							checked={p.checked.includes(tag.id)}
							className="mr-2"
						/>
						<label htmlFor={tag.id}>{tag.name}</label>
						<br />
					</React.Fragment>
				))}
				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						onCreateTag()
					}}
					className="flex items-center justify-start"
				>
					<input
						onChange={(e) =>
							p.setTagInfo({ ...p.tagInfo, name: e.target.value })
						}
						value={p.tagInfo.name}
						placeholder="Tag name"
						className="input"
					/>
					<button
						className="button whitespace-nowrap ml-2"
						type="submit"
						disabled={!p.tagInfo.name}
					>
						New tag
					</button>
				</form>
			</>
		</Popup>
	)
}
