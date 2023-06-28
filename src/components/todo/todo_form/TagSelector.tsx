import { doc, setDoc } from "firebase/firestore"
import React from "react"
import Popup from "reactjs-popup"
import { db } from "../../../firebase"
import { useAppSelector } from "../../../hooks"
import { Colors, FirestoreColl, TagProject, User } from "../../../types"
import { v4 } from "uuid"

interface P {
	tagName: string
	setTagName: (name: string) => void
	currentTodoId: string
	selectedTags: string[]
	setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>
}

export function TagSelector(p: P) {
	const user = useAppSelector((s) => s.user.user as User)
	const tags = useAppSelector((s) => s.projects).filter(
		(project) => project.type === "tag"
	) as TagProject[]

	const onCheckboxClick = (tagId: string) => {
		if (p.selectedTags.includes(tagId)) {
			p.setSelectedTags(p.selectedTags.filter((v) => v !== tagId))
		} else {
			p.setSelectedTags([...p.selectedTags, tagId])
		}
	}

	const onCreateTag = async () => {
		const newTag: TagProject = {
			type: "tag",
			id: v4(),
			name: p.tagName,
			todoIds: [],
			createdAt: new Date().getTime(),
			color: Colors.Slate,
			sections: [{ id: v4(), type: "default" }],
		}
		const ref = doc(
			db,
			`${FirestoreColl.Users}/${user.id}/${FirestoreColl.Projects}/${newTag.id}`
		)
		setDoc(ref, newTag)
		p.setTagName("")
	}

	return (
		<Popup
			keepTooltipInside
			trigger={
				<button type="button" className="button mx-1 flex items-center">
					Tags
					<span className="material-icons ml-1">new_label</span>
				</button>
			}
		>
			<>
				{!!tags.length && <p className="text-lg">Select tags</p>}
				{tags.map((tag) => (
					<div className="flex justify-between" key={tag.id}>
						<div>
							<input
								type="checkbox"
								id={tag.id}
								onChange={() => onCheckboxClick(tag.id)}
								checked={p.selectedTags.includes(tag.id)}
								className="mr-2"
							/>
							<label htmlFor={tag.id}>{tag.name}</label>
							<br />
						</div>

						<div
							className="w-[15px] h-[15px] rounded-full"
							style={{ backgroundColor: tag.color }}
						></div>
					</div>
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
						onChange={(e) => p.setTagName(e.target.value)}
						value={p.tagName}
						placeholder="Tag name"
						className="input"
					/>
					<button
						className="button whitespace-nowrap ml-2"
						type="submit"
						disabled={!p.tagName}
					>
						New tag
					</button>
				</form>
			</>
		</Popup>
	)
}
