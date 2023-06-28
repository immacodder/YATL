import { updateDoc, doc } from "firebase/firestore"
import { useState, useEffect } from "react"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import { Project, User, FirestoreColl, GroupBy } from "../types"

export function ProjectViewGroup(p: { currentProject: Project }) {
	const user = useAppSelector((s) => s.user.user as User)
	const [selected, setSelected] = useState<GroupBy>(
		user.preferences.groupBy[p.currentProject.id]
	)

	useEffect(() => {
		updateDoc(doc(db, `${FirestoreColl.Users}/${user.id}`), {
			[`preferences.groupBy.${p.currentProject.id}`]: selected,
		})
	}, [user, selected, p.currentProject])

	return (
		<div className="p-2">
			<label htmlFor="groupBy">Group by</label>
			<br />
			<select
				className="input p-0"
				id="groupBy"
				value={selected}
				onChange={(e) => setSelected(e.target.value as any)}
			>
				{Object.keys(GroupBy).map((k) => {
					const key = k as keyof typeof GroupBy
					if (
						GroupBy[key] === (GroupBy.project as string) &&
						!(p.currentProject.name === "Today")
					) {
						console.table(p.currentProject)
						return null
					}
					return (
						<option key={key} value={GroupBy[key]}>
							{GroupBy[key]}
						</option>
					)
				})}
			</select>
		</div>
	)
}
