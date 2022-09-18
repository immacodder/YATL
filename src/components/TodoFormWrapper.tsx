import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { v4 } from "uuid"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import {
	FireCol,
	Todo,
	User,
	Section,
	RegularProject,
	DefaultSection,
} from "../types"
import DateSelector from "./DateSelector"
import PrioritySelector from "./PrioritySelector"
import ProjectSelector from "./ProjectSelector"
import RemindSelector from "./RemindSelector"
import TagSelector from "./TagSelector"

export interface DefValues {
	schedule?: PopupState
	remind?: PopupState
	todoState?: TodoState
	priority?: Todo["priority"]
	checked?: string[]
	submitButtonText?: string
	sectionId?: string
	originalTodo?: Todo
}

interface P {
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

export default function TodoFormWrapper(p: P) {
	const user = useAppSelector((s) => s.user.user as User)

	const [todo, setTodo] = useState<TodoState>(
		p.defValues?.todoState ?? { description: "", title: "" }
	)
	const params = useParams()

	const projects = useAppSelector((s) => s.projects)
	const projectId =
		params.projectId === "today" || params.projectId === "upcoming"
			? projects.find((proj) => "isInbox" in proj)!.id
			: params.projectId

	let currentProject = projects.find((proj) => proj.id === projectId)!

	const todoId = p.updateId ?? v4()

	let selectedSectionDefault: DefaultSection = projects.find(
		(proj): proj is RegularProject => "isInbox" in proj
	)!.sections[0]

	if (currentProject.type === "regular") {
		selectedSectionDefault = projects.find((proj): proj is RegularProject => {
			if (proj.type === "regular") {
				const defaultSection = proj.sections.find(
					(sec): sec is DefaultSection => {
						if (p.defValues?.sectionId) return sec.id === p.defValues.sectionId
						return sec.type === "default"
					}
				)
				return !!defaultSection
			}
			return false
		})!.sections[0]
	}

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

	const [checkedTags, setCheckedTags] = useState<string[]>(
		p.defValues?.checked ?? currentProject.type === "tag"
			? [currentProject.id]
			: []
	)

	const defaultTagInfo = {
		open: false,
		name: "",
	}
	const [tagInfo, setTagInfo] = useState(defaultTagInfo)

	const onCreateTodo = async () => {
		let dueUntil: number | null = null
		let remindAt: number | null = null

		if (schedule.date && !schedule.time)
			dueUntil = new Date(schedule.date).getTime()
		if (schedule.date && schedule.time)
			dueUntil = new Date(schedule.date + " " + schedule.time).getTime()

		if (remind.date && remind.time)
			remindAt = new Date(remind.date + " " + remind.time).getTime()

		const newTodo: Todo = {
			type: "default",
			createdAt: new Date().getTime(),
			description: todo.description.trim() || null,
			title: todo.title.trim(),
			children: [],
			id: todoId,
			indentation: 0,
			parentTodo: null,
			priority,
			// TODO: implement natural language date recognition
			repeatedAt: "",
			scheduledAt: dueUntil,
			remindAt,
			sectionId: selectedSection.id,
		}

		const todoRef = doc(
			db,
			`${FireCol.Users}/${user.id}/${FireCol.Todos}/${newTodo.id}`
		)

		await setDoc(todoRef, newTodo)
		await updateTags()

		resetState()

		if (p.updateId) p.setOpen(false)

		async function updateTags() {
			await Promise.all(
				checkedTags.map(async (tagId) => {
					const tagRef = doc(
						db,
						`${FireCol.Users}/${user.id}/${FireCol.Projects}/${tagId}`
					)
					await updateDoc(tagRef, { todoIds: arrayUnion(newTodo.id) })
				})
			)
		}

		function resetState() {
			setSchedule({ ...popupStateDefault })
			setRemind({ ...popupStateDefault })
			setTodo({ description: "", title: "" })
			setPriority(4)
			setTagInfo({ ...defaultTagInfo })
		}
	}

	return (
		<div>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					onCreateTodo()
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
				<div className="flex justify-between flex-wrap">
					<div>
						<button
							disabled={!todo.title.trim()}
							className="button mr-2 mb-1"
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
					<div className="todo-form-options-wrapper flex items-center flex-wrap">
						<ProjectSelector
							selectedSection={selectedSection}
							setSelectedSection={setSelectedSection}
							defValues={p.defValues}
						/>
						<PrioritySelector
							priority={priority}
							setPriority={(prio: any) => setPriority(prio)}
						/>
						<DateSelector schedule={schedule} setSchedule={setSchedule} />
						<RemindSelector
							remind={remind}
							setRemind={setRemind}
							defValues={p.defValues}
						/>
						<TagSelector
							checked={checkedTags}
							setChecked={setCheckedTags}
							currentTodoId={todoId}
							tagInfo={tagInfo}
							setTagInfo={setTagInfo}
						/>
					</div>
				</div>
			</form>
		</div>
	)
}
