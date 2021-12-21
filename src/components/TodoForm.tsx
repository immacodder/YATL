import { formatISO, isToday } from "date-fns"
import { doc, setDoc } from "firebase/firestore"
import React, { useState, useRef, Fragment } from "react"
import { useParams } from "react-router-dom"
import { v4 } from "uuid"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import {
	Tag,
	FireCol,
	Todo,
	User,
	Project,
	Section,
	UserSection,
	DefaultProjects,
} from "../types"
import Popup from "./Popup"

interface Props {
	tags: Array<{
		id: string
		name: string
	}>
	setOpen: (open: boolean) => void
	defaultValues?: {
		schedule?: PopupState
		remind?: PopupState
		todo?: TodoState
		priority?: Todo["priority"]
		checked?: string[]
		submitButtonText?: string
		sectionId?: string
	}
	updateId?: string
}

interface PopupState {
	date: string | null
	time: string | null
	open: boolean
}
interface TodoState {
	title: string
	description: string
}

export default function TodoForm(p: Props) {
	const timeInISO = formatISO(new Date(), { representation: "time" }).split(
		"+"
	)[0]
	const dateInISO = formatISO(new Date(), { representation: "date" })
	const user = useAppSelector((s) => s.user.user as User)

	const [todo, setTodo] = useState<TodoState>(
		p.defaultValues?.todo ?? { description: "", title: "" }
	)
	const [checked, setChecked] = useState<string[]>(
		p.defaultValues?.checked ?? []
	)
	const params = useParams()

	const projects = useAppSelector((s) => s.projects)
	const projectId = params.projectId!
	const currentProject = projects.find((proj) => proj.id === projectId)!
	const projectButtonRef = useRef<HTMLButtonElement>(null)
	const [projectSelectorOpen, setProjectSelectorOpen] = useState(false)
	const [selectedSection, setSelectedSection] = useState<Section>(
		currentProject.sections.find((sec) => sec.type === "default")!
	)
	const selectedSectionsProject = projects.find((proj) =>
		proj.sections.find((sec) => sec.id === selectedSection.id)
	)!

	const popupStateDefault: PopupState = {
		date: null,
		time: null,
		open: false,
	}
	const scheduleAnchor = useRef<HTMLButtonElement>(null)
	const [schedule, setSchedule] = useState(
		p.defaultValues?.schedule ?? popupStateDefault
	)

	const remindAnchor = useRef<HTMLButtonElement>(null)
	const [remind, setRemind] = useState(
		p.defaultValues?.remind ?? popupStateDefault
	)

	const [priority, setPriority] = useState<Todo["priority"]>(
		p.defaultValues?.priority ?? 4
	)

	const defaultTagInfo = {
		open: false,
		name: "",
	}
	const [tagInfo, setTagInfo] = useState(defaultTagInfo)
	const tagAnchor = useRef<HTMLButtonElement>(null)

	const onCheckboxClick = (id: string) => {
		if (checked.includes(id)) {
			return setChecked(checked.filter((v) => v !== id))
		}
		setChecked([...checked, id])
	}
	const onCreateTag = async () => {
		const newTag: Tag = {
			id: v4(),
			name: tagInfo.name,
			todos: [],
		}
		const ref = doc(
			db,
			`${FireCol.Users}/${user.id}/${FireCol.Tags}/${newTag.id}`
		)
		setDoc(ref, newTag)

		setTagInfo({ ...tagInfo, name: "" })
	}

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
							{p.defaultValues?.submitButtonText ?? "Add todo"}
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
						<button
							onClick={() => setProjectSelectorOpen(true)}
							className="button"
							ref={projectButtonRef}
							type="button"
						>
							{selectedSection.type === "default"
								? selectedSectionsProject.name
								: `${selectedSectionsProject.name}/${selectedSection.name}`}
						</button>
						{projectSelectorOpen && (
							<Popup
								anchor={projectButtonRef.current}
								setOpen={setProjectSelectorOpen}
								type="anchor"
							>
								<ul>
									{projects.map((proj) => {
										const classNames =
											"hover:bg-black p-1 flex items-center hover:bg-opacity-10 rounded hover:cursor-pointer"
										return (
											<Fragment key={proj.id}>
												<li
													className={classNames}
													onClick={() =>
														setSelectedSection(
															proj.sections.find((s) => s.type === "default")!
														)
													}
												>
													{proj.type === "default" ? (
														<span className="material-icons text-slate-700 mr-1">
															{proj.icon}
														</span>
													) : (
														<span
															className="min-w-[.75rem] min-h-[.75rem] m-1 rounded-full"
															style={{ backgroundColor: proj.color }}
														/>
													)}
													{proj.name}
												</li>
												{proj.sections
													.filter(
														(sec): sec is UserSection =>
															sec.type === "userCreated"
													)
													.map((section) => (
														<li
															onClick={() => setSelectedSection(section)}
															key={section.id}
															className={`ml-4 flex items-center ${classNames}`}
														>
															<span className="material-icons mr-1">
																segment
															</span>
															{section.name}
														</li>
													))}
											</Fragment>
										)
									})}
								</ul>
							</Popup>
						)}
						<select
							className="button appearance-none mx-1"
							onChange={({ target: { value } }) =>
								setPriority(+value as Todo["priority"])
							}
							value={priority}
						>
							<option value={1}>P1</option>
							<option value={2}>P2</option>
							<option value={3}>P3</option>
							<option value={4}>Priority</option>
						</select>

						<button
							type="button"
							onClick={() =>
								setSchedule((prev) => ({ ...prev, open: !prev.open }))
							}
							className="flex itmes-center mx-1 button"
							ref={scheduleAnchor}
						>
							{schedule.date && isToday(new Date(schedule.date))
								? `Today`
								: `Schedule`}
							<span className="material-icons ml-1">event</span>
						</button>

						{schedule.open && (
							<Popup
								type="anchor"
								setOpen={(open) => setSchedule({ ...schedule, open })}
								anchor={scheduleAnchor.current}
							>
								<div className="flex items-center">
									<button
										className="button bg-secondary text-white mr-2"
										onClick={() =>
											setSchedule({ ...schedule, date: dateInISO })
										}
									>
										Today
									</button>
									<button className="button bg-secondary text-white">
										Tomorrow
									</button>
								</div>
								<label htmlFor="dueDatePicker">Date: </label>
								<input
									id="dueDatePicker"
									type="date"
									className="button m-1"
									value={schedule.date ?? dateInISO}
									onChange={(e) =>
										setSchedule({ ...schedule, date: e.target.value })
									}
									min={dateInISO}
								/>
								<br />
								<label htmlFor="dueTimePicker">Time: </label>
								<input
									id="dueTimePicker"
									type="time"
									className="button m-1"
									value={schedule.time ?? timeInISO}
									onChange={(e) =>
										setSchedule({ ...schedule, time: e.target.value })
									}
									min={timeInISO}
								/>
							</Popup>
						)}
						<button
							type="button"
							onClick={() => setRemind({ ...remind, open: !remind.open })}
							ref={remindAnchor}
							className="button mx-1 flex items-center"
						>
							Reminder
							<span className="material-icons ml-1">alarm_add</span>
						</button>
						{remind.open && (
							<Popup
								type="anchor"
								setOpen={(open) => setRemind({ ...remind, open })}
								anchor={remindAnchor.current}
							>
								<div className="flex items-center justify-start">
									<label htmlFor="remindDatePicker">Date: </label>
									<input
										id="remindDatePicker"
										type="date"
										className="button m-1"
										onChange={(e) =>
											setRemind({ ...remind, date: e.target.value })
										}
										value={remind.date ?? dateInISO}
										min={formatISO(new Date(), {
											representation: "date",
										})}
									/>
								</div>
								<div className="flex items-center justify-start">
									<label htmlFor="remindTimePicker">Time: </label>
									<input
										id="remindTimePicker"
										type="time"
										className="button m-1"
										onChange={(e) =>
											setRemind({ ...remind, time: e.target.value })
										}
										value={remind.time ?? timeInISO}
										min={timeInISO}
									/>
								</div>
							</Popup>
						)}
						<button
							ref={tagAnchor}
							onClick={() => setTagInfo({ ...tagInfo, open: true })}
							type="button"
							className="button mx-1 flex items-center"
						>
							Tags
							<span className="material-icons ml-1">new_label</span>
						</button>
						{tagInfo.open && (
							<Popup
								type="anchor"
								anchor={tagAnchor.current}
								setOpen={(open) => setTagInfo({ ...tagInfo, open })}
							>
								<>
									{!!p.tags.length && <p className="text-lg">Select tags</p>}
									{p.tags.map((tag) => (
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
											onCreateTag()
										}}
										className="flex items-center justify-start"
									>
										<input
											onChange={(e) =>
												setTagInfo({ ...tagInfo, name: e.target.value })
											}
											value={tagInfo.name}
											placeholder="Tag name"
											className="input"
										/>
										<button
											className="button whitespace-nowrap ml-2"
											type="submit"
											disabled={!tagInfo.name}
										>
											New tag
										</button>
									</form>
								</>
							</Popup>
						)}
					</div>
				</div>
			</form>
		</div>
	)
}
