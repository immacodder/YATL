import { doc, updateDoc } from "firebase/firestore"
import { useState, useEffect } from "react"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import { DefaultProjects, FireCol, Project, SortBy, User } from "../types"

export function ProjectViewSort(p: { currentProject: Project }) {
	const user = useAppSelector((s) => s.user.user as User)
	const [selected, setSelected] = useState<keyof typeof SortBy>(
		user.preferences.sortBy[p.currentProject.id] ?? "date_added"
	)

	useEffect(() => {
		updateDoc(doc(db, `${FireCol.Users}/${user.id}`), {
			[`preferences.sortBy.${p.currentProject.id}`]: selected,
		})
	}, [user, selected, p.currentProject])

	return (
		<div className="p-2">
			<label htmlFor="sortSelect">Sort by</label>
			<br />
			<select
				className="input p-0"
				id="sortSelect"
				value={selected}
				onChange={(e) => setSelected(e.target.value as any)}
			>
				{Object.keys(SortBy).map((key) => {
					if (
						key === "project" &&
						!(
							p.currentProject.type === "default" &&
							p.currentProject.name === DefaultProjects[1]
						)
					)
						return null
					return (
						<option key={key} value={key}>
							{SortBy[key as keyof typeof SortBy]}
						</option>
					)
				})}
			</select>
		</div>
	)
}
