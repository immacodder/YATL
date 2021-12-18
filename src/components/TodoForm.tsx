// if i don't do this, there will be an infinite rerendering loop
/* eslint-disable react-hooks/exhaustive-deps */
import { formatISO } from "date-fns"
import { doc, setDoc } from "firebase/firestore"
import React, { useState, useCallback } from "react"
import { v4 } from "uuid"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import {
	Priority,
	Tag,
	CollectionFire,
	Todo,
	TodoType,
	Indentation,
	User,
} from "../types"
import Popup from "./Popup"

interface Props {
	tags: Tag[]
}
export default function (p: Props) {
	const timeInISO = formatISO(new Date(), { representation: "time" }).split(
		"+"
	)[0]
	const dateInISO = formatISO(new Date(), { representation: "date" })
	const user = useAppSelector((s) => s.user.user as User)

	const [todo, setTodo] = useState({
		title: "",
		description: "",
	})
	const [checked, setChecked] = useState<string[]>([])

	interface PopupState {
		date: string | null
		time: string | null
		open: boolean
		anchor: HTMLElement | null
	}
	const popupStateDefault: PopupState = {
		date: null,
		time: null,
		open: false,
		anchor: null,
	}
	const [due, setDue] = useState(popupStateDefault)
	const [remind, setRemind] = useState(popupStateDefault)

	const [priority, setPriority] = useState<Priority>(Priority.P4)
	const defaultTagInfo = {
		open: false,
		anchor: null as null | HTMLElement,
		name: "",
	}
	const [tagInfo, setTagInfo] = useState(defaultTagInfo)

	const onRemindButtonAnchorChange = useCallback(
		(node: PopupState["anchor"]) => setRemind({ ...remind, anchor: node }),
		[]
	)
	const onDueButtonAnchorChange = useCallback(
		(node: PopupState["anchor"]) => setDue({ ...due, anchor: node }),
		[]
	)
	const onTagAnchorChange = useCallback(
		(node: typeof tagInfo["anchor"]) =>
			setTagInfo({ ...tagInfo, anchor: node }),
		[]
	)

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
			`${CollectionFire.Users}/${user.id}/${CollectionFire.Tags}/${newTag.id}`
		)
		setDoc(ref, newTag)

		setTagInfo({ ...tagInfo, name: "" })
	}

	const onAddTodoFormSubmit = async () => {
		debugger
		let dueUntil: number | null = null
		let remindAt: number | null = null

		if (due.date && !due.time) dueUntil = new Date(due.date).getTime()
		if (due.date && due.time)
			dueUntil = new Date(due.date + " " + due.time).getTime()

		if (remind.date && remind.time)
			remindAt = new Date(remind.date + " " + remind.time).getTime()

		const newTodo: Todo = {
			type: TodoType.Default,
			createdAt: new Date().getTime(),
			description: todo.description.trim() || null,
			title: todo.title.trim(),
			children: [],
			id: v4(),
			indentation: Indentation.Level0,
			parentTodo: null,
			priority,
			// TODO: implement natural language date recognition
			repeatedAt: "",
			tags: checked,
			dueUntil,
			remindAt,
		}

		const ref = doc(
			db,
			`${CollectionFire.Users}/${user.id}/${CollectionFire.Todos}/${newTodo.id}`
		)
		await setDoc(ref, newTodo)

		// reset everything to default values
		setDue({ ...popupStateDefault, anchor: due.anchor })
		setRemind({ ...popupStateDefault, anchor: remind.anchor })
		setTodo({ description: "", title: "" })
		setPriority(Priority.P4)
		setTagInfo({ ...defaultTagInfo, anchor: tagInfo.anchor })
		setChecked([])
	}

	return (
		<div className="">
			<form
				onSubmit={(e) => {
					e.preventDefault()
					onAddTodoFormSubmit()
				}}
				className="bg-white m-2 p-2 border-2 shadow"
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
					<button
						disabled={!todo.title.trim()}
						className="button"
						type="submit"
					>
						Add todo
					</button>
					<div className="flex items-center">
						<select
							className="button appearance-none mx-1"
							onChange={({ target: { value } }) =>
								setPriority(Priority[value as keyof typeof Priority])
							}
							value={priority}
						>
							<option value={Priority.P1}>P1</option>
							<option value={Priority.P2}>P2</option>
							<option value={Priority.P3}>P3</option>
							<option value={Priority.P4}>Priority</option>
						</select>

						<button
							type="button"
							onClick={() => setDue((prev) => ({ ...prev, open: !prev.open }))}
							className="flex itmes-center mx-1 button"
							ref={onDueButtonAnchorChange}
						>
							Due date
							<span className="material-icons ml-1">event</span>
						</button>

						{due.open && (
							<Popup
								setOpen={(open) => setDue({ ...due, open })}
								anchor={due.anchor}
							>
								<label htmlFor="dueDatePicker">Date: </label>
								<input
									id="dueDatePicker"
									type="date"
									className="button m-1"
									value={due.date ?? dateInISO}
									onChange={(e) => setDue({ ...due, date: e.target.value })}
									min={dateInISO}
								/>
								<br />
								<label htmlFor="dueTimePicker">Time: </label>
								<input
									id="dueTimePicker"
									type="time"
									className="button m-1"
									value={due.time ?? timeInISO}
									onChange={(e) => setDue({ ...due, time: e.target.value })}
									min={timeInISO}
								/>
							</Popup>
						)}
						<button
							type="button"
							onClick={() => setRemind({ ...remind, open: !remind.open })}
							ref={onRemindButtonAnchorChange}
							className="button mx-1 flex items-center"
						>
							Reminder
							<span className="material-icons ml-1">alarm_add</span>
						</button>
						{remind.open && (
							<Popup
								setOpen={(open) => setRemind({ ...remind, open })}
								anchor={remind.anchor}
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
							ref={onTagAnchorChange}
							onClick={() => setTagInfo({ ...tagInfo, open: true })}
							type="button"
							className="button mx-1 flex items-center"
						>
							<span className="material-icons">new_label</span>
							Tags
						</button>
						{tagInfo.open && (
							<Popup
								anchor={tagInfo.anchor}
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
