import { doc, updateDoc } from "firebase/firestore"
import { useState, useEffect } from "react"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import { FirestoreColl, Project, SortBy, User } from "../types"

export function ProjectViewSort(p: { currentProject: Project }) {
	const user = useAppSelector((s) => s.user.user as User)
	const [selected, setSelected] = useState<SortBy>(
		user.preferences.sortBy[p.currentProject.id]
	)

	useEffect(() => {
		updateDoc(doc(db, `${FirestoreColl.Users}/${user.id}`), {
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
				{Object.keys(SortBy).map((k) => {
					const key = k as keyof typeof SortBy
					if (
						key === "project" &&
						!(
							p.currentProject.name === "Today" ||
							p.currentProject.name === "Inbox"
						)
					)
						return null
					return (
						<option key={key} value={SortBy[key]}>
							{SortBy[key]}
						</option>
					)
				})}
			</select>
		</div>
	)
}
