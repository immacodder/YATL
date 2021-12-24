import { doc, setDoc } from "firebase/firestore"
import { useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { v4 } from "uuid"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import { FireCol, Todo, User, Section } from "../types"
import DateSelector from "./DateSelector"
import PrioritySelector from "./PrioritySelector"
import ProjectSelector from "./ProjectSelector"
import RemindSelector from "./RemindSelector"
import TagSelector from "./TagSelector"

export interface DefValues {
	schedule?: PopupState
	remind?: PopupState
	todo?: TodoState
	priority?: Todo["priority"]
	checked?: string[]
	submitButtonText?: string
	sectionId?: string
}

interface P {
	tags: Array<{
		id: string
		name: string
	}>
	setOpen: (open: boolean) => void
	defValues?: DefValues
	updateId?: string
}

export interface PopupState {
	date: string | null
	time: string | null
	open: boolean
}

export const popupStateDefault: PopupState = {
	date: null,
	time: null,
	open: false,
}

interface TodoState {
	title: string
	description: string
}

export default function TodoForm(p: P) {
	const user = useAppSelector((s) => s.user.user as User)

	const [todo, setTodo] = useState<TodoState>(
		p.defValues?.todo ?? { description: "", title: "" }
	)
	const [checked, setChecked] = useState<string[]>(p.defValues?.checked ?? [])
	const params = useParams()

	const projects = useAppSelector((s) => s.projects)
	const projectId = params.projectId!
	const currentProject = projects.find((proj) => proj.id === projectId)!

	const selectedSectionDefault = currentProject.sections.find((sec) => {
		if (p.defValues?.sectionId) return sec.id === p.defValues.sectionId
		return sec.type === "default"
	})!

	const [selectedSection, setSelectedSection] = useState<Section>(
		selectedSectionDefault
	)

	const [schedule, setSchedule] = useState(
		p.defValues?.schedule ?? popupStateDefault
	)

	const [remind, setRemind] = useState(p.defValues?.remind ?? popupStateDefault)

	const [priority, setPriority] = useState<Todo["priority"]>(
		p.defValues?.priority ?? 4
	)

	const defaultTagInfo = {
		open: false,
		name: "",
	}
	const [tagInfo, setTagInfo] = useState(defaultTagInfo)

	const onAddTodoFormSubmit = async () => {
		let dueUntil: number | null = null
		let remindAt: number | null = null

		if (schedule.date && !schedule.time)
			dueUntil = new Date(schedule.date).getTime()
		if (schedule.date && schedule.time)
			dueUntil = new Date(schedule.date + " " + schedule.time).getTime()

		if (remind.date && remind.time)
			remindAt = new Date(remind.date + " " + remind.time).getTime()

		const tags: Todo["tags"] = {}
		checked.forEach((tagId) => {
			tags[tagId] = p.tags.filter((tag) => tag.id === tagId)[0].name
		})

		const newTodo: Todo = {
			type: "default",
			createdAt: new Date().getTime(),
			description: todo.description.trim() || null,
			title: todo.title.trim(),
			children: [],
			id: p.updateId ?? v4(),
			indentation: 0,
			parentTodo: null,
			priority,
			// TODO: implement natural language date recognition
			repeatedAt: "",
			tags,
			scheduledAt: dueUntil,
			remindAt,
			sectionId: selectedSection.id,
		}

		const ref = doc(
			db,
			`${FireCol.Users}/${user.id}/${FireCol.Todos}/${newTodo.id}`
		)

		await setDoc(ref, newTodo)
		resetState()

		if (p.updateId) p.setOpen(false)

		function resetState() {
			setSchedule({ ...popupStateDefault })
			setRemind({ ...popupStateDefault })
			setTodo({ description: "", title: "" })
			setPriority(4)
			setTagInfo({ ...defaultTagInfo })
			setChecked([])
		}
	}

	return (
		<div>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					onAddTodoFormSubmit()
				}}
				className="bg-white p-2 border-2 shadow"
			>
				<input
					className="input mb-2"
					autoFocus
					onChange={(e) => setTodo({ ...todo, title: e.target.value })}
					value={todo.title}
					placeholder="Todo name"
				/>
				<textarea
					value={todo.description}
					onChange={(e) => setTodo({ ...todo, description: e.target.value })}
					className="input"
					placeholder="Description"
				/>
				<div className="flex justify-between">
					<div>
						<button
							disabled={!todo.title.trim()}
							className="button mr-2"
							type="submit"
						>
							{p.defValues?.submitButtonText ?? "Add todo"}
						</button>
						<button
							onClick={() => p.setOpen(false)}
							className="button text-white bg-secondary hover:bg-red-500"
							type="button"
						>
							Cancel
						</button>
					</div>
					<div className="flex items-center">
						<ProjectSelector
							selectedSection={selectedSection}
							setSelectedSection={setSelectedSection}
							defValues={p.defValues}
						/>
						<PrioritySelector
							priority={priority}
							setPriority={(prio: any) => setPriority(prio)}
						/>
						<DateSelector
							schedule={schedule}
							setSchedule={setSchedule}
							defValues={p.defValues}
						/>
						<RemindSelector
							remind={remind}
							setRemind={setRemind}
							defValues={p.defValues}
						/>
						<TagSelector
							tagInfo={tagInfo}
							setTagInfo={setTagInfo}
							tags={p.tags}
							defValues={p.defValues}
						/>
					</div>
				</div>
			</form>
		</div>
	)
}