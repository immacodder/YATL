import { doc, updateDoc, arrayUnion } from "firebase/firestore"
import { useState } from "react"
import { v4 } from "uuid"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import { Section, FireCol, User, Project } from "../types"

interface P {
	currentProject: Project
}
export function SectionForm(p: P) {
	const user = useAppSelector((s) => s.user.user as User)
	const [sectionFormOpen, setSectionFormOpen] = useState(false)
	const [sectionName, setSectionName] = useState("")

	const onNewSection = () => {
		const section: Section = {
			type: "userCreated",
			id: v4(),
			name: sectionName,
		}
		const ref = doc(
			db,
			`${FireCol.Users}/${user.id}/${FireCol.Projects}/${p.currentProject.id}`
		)
		updateDoc(ref, {
			sections: arrayUnion(section),
		})
	}

	return (
		<>
			{sectionFormOpen ? (
				<form
					className="p-4 mt-2 bg-white"
					onSubmit={(e) => {
						e.preventDefault()
						onNewSection()
						setSectionFormOpen(false)
					}}
				>
					<input
						id="sectionName"
						className="input"
						placeholder="Section name"
						autoFocus
						type="text"
						onChange={(e) => setSectionName(e.target.value)}
						value={sectionName}
					/>
					<br />
					<button type="submit" className="button mr-2 mt-2">
						Add
					</button>
					<button
						onClick={() => setSectionFormOpen(false)}
						type="button"
						className="button-outline"
					>
						Cancel
					</button>
				</form>
			) : (
				p.currentProject.type !== "generated" &&
				!("isInbox" in p.currentProject) && (
					<div className="flex items-center justify-center w-full mt-2">
						<hr className="w-full border-black mr-2" />
						<button
							onClick={() => setSectionFormOpen(true)}
							className="button min-w-fit"
						>
							Add new section
						</button>
						<hr className="w-full border-black ml-2" />
					</div>
				)
			)}
		</>
	)
}
