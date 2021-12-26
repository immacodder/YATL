import { doc, setDoc } from "firebase/firestore"
import React, { useRef, useState } from "react"
import { v4 } from "uuid"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import { FireCol, TagProject, User } from "../types"
import Popup from "./Popup"
import { DefValues } from "./TodoFormWrapper"

interface P {
	defValues?: DefValues
	tagInfo: {
		open: boolean
		name: string
	}
	setTagInfo: (info: P["tagInfo"]) => void
}

export default function TagSelector(p: P) {
	const tagAnchor = useRef<HTMLButtonElement>(null)
	const [checked, setChecked] = useState<string[]>(p.defValues?.checked ?? [])
	const user = useAppSelector((s) => s.user.user as User)
	const tagProjects = useAppSelector((s) => s.projects).filter(
		(proj): proj is TagProject => proj.type === "tag"
	)

	const onCheckboxClick = (id: string) => {
		if (checked.includes(id)) {
			return setChecked(checked.filter((v) => v !== id))
		}
		setChecked([...checked, id])
	}

	const onCreateTag = async () => {
		const newTag: TagProject = {
			type: "tag",
			id: v4(),
			name: p.tagInfo.name,
			todoIds: [],
			createdAt: new Date().getTime(),
			sections: [{ type: "default", id: v4() }],
		}
		const ref = doc(
			db,
			`${FireCol.Users}/${user.id}/${FireCol.Projects}/${newTag.id}`
		)
		setDoc(ref, newTag)

		p.setTagInfo({ ...p.tagInfo, name: "" })
	}

	return (
		<>
			<button
				ref={tagAnchor}
				onClick={() => p.setTagInfo({ ...p.tagInfo, open: true })}
				type="button"
				className="button mx-1 flex items-center"
			>
				Tags
				<span className="material-icons ml-1">new_label</span>
			</button>
			{p.tagInfo.open && (
				<Popup
					type="anchor"
					anchor={tagAnchor.current}
					setOpen={(open) => p.setTagInfo({ ...p.tagInfo, open })}
				>
					<>
						{!!tagProjects.length && <p className="text-lg">Select tags</p>}
						{tagProjects.map((tag) => (
							<React.Fragment key={tag.id}>
								<input
									type="checkbox"
									id={tag.id}
									onChange={() => onCheckboxClick(tag.id)}
									checked={checked.includes(tag.id)}
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
			)}
		</>
	)
}
