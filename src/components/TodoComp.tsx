import { format, formatISO, isBefore, startOfDay } from "date-fns"
import { deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore"
import React, { useRef, useState } from "react"
import { v4 } from "uuid"
import { db } from "../firebase"
import { useAppSelector } from "../hooks"
import { FireCol, Project, Todo, User } from "../types"
import Dialog from "./Dialog"
import { Menu, MenuType } from "./Menu"
import Popup from "./Popup"
import TodoForm from "./TodoForm"

interface P {
	todo: Todo
	setGlobalFormOpen: (id: string, open: boolean) => void
	project: Project
	todoFormOpen: {
		todoId: string | null
		open: boolean
	}
}
export default function TodoComp(p: P) {
	const user = useAppSelector((s) => s.user.user as User)
	const moreAnchor = useRef<HTMLButtonElement>(null)
	const [moreOpen, setMoreOpen] = useState(false)
	const todo = p.todo
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

	const menuData: MenuType[] = [
		{
			name: "Edit",
			action: () => p.setGlobalFormOpen(todo.id, true),
			icon: "edit",
		},
		// { name: "Set project" },
		// { name: "Set priority" },
		// { name: "Set reminder" },
		// { name: "Schedule" },
		{
			name: "Duplicate",
			icon: "content_copy",
			action: () => {
				const newTodo = p.todo
				newTodo.id = v4()
				setDoc(
					doc(db, `${FireCol.Users}/${user.id}/${FireCol.Todos}/${newTodo.id}`),
					newTodo
				)
			},
		},
		{
			action: () => {
				setDeleteDialogOpen(true)
				setMoreOpen(false)
			},
			icon: "delete_forever",
			danger: true,
			name: `Delete`,
			separatorBefore: true,
		},
	]

	const onTodoCheck = () => {
		const ref = doc(
			db,
			`${FireCol.Users}/${user.id}/${FireCol.Todos}/${todo.id}`
		)
		if (todo.type === "completed")
			updateDoc(ref, { type: "default" } as { type: Todo["type"] })
		if (todo.type === "default")
			updateDoc(ref, { type: "completed" } as { type: Todo["type"] })
	}

	return (
		<>
			{deleteDialogOpen && (
				<Dialog
					action={async () => {
						await deleteDoc(
							doc(db, `${FireCol.Users}/${user.id}/${FireCol.Todos}/${todo.id}`)
						)
					}}
					setOpen={setDeleteDialogOpen}
					text={`Are you sure you want to delete ${todo.title}`}
					danger
					confirmText="Delete it"
				/>
			)}
			{!(p.todoFormOpen.open && p.todoFormOpen.todoId === todo.id) && (
				<div className="bg-white p-2 mb-2">
					<div className="flex items-center">
						<button
							onClick={onTodoCheck}
							className={`${
								todo.type === "completed" ? "bg-slate-400" : ""
							} rounded-full mr-2 w-5 h-5 inline-block border-[2px] border-primary hover:cursor-pointer hover:bg-accent`}
						/>
						<p className={`${todo.type === "completed" ? "line-through" : ""}`}>
							{todo.title}
						</p>
						<button
							onClick={() => p.setGlobalFormOpen(todo.id, true)}
							className="button bg-transparent rounded-full shadow-none material-icons ml-auto transition-colors hover:bg-primary hover:shadow-lg min-w-0"
						>
							edit
						</button>
						<button
							onClick={() => setMoreOpen(!moreOpen)}
							ref={moreAnchor}
							className="button bg-transparent rounded-full shadow-none ml-2 material-icons transition-colors hover:bg-primary hover:shadow-lg min-w-0"
						>
							more_horiz
						</button>
						{moreOpen && (
							<Menu
								anchor={moreAnchor.current}
								data={menuData}
								setOpen={setMoreOpen}
							/>
						)}
					</div>
					{todo.description && (
						<p className="ml-7 mb-2 text-sm">{todo.description}</p>
					)}
					<div className="flex items-center ml-7 text-xs">
						<p
							className={`mr-2 ${
								todo.scheduledAt
									? isBefore(todo.scheduledAt, startOfDay(new Date()))
										? "text-red-500"
										: "text-green-500"
									: ""
							}`}
						>
							<span className={`material-icons text-xs `}>calendar_today</span>
							{todo.scheduledAt ? format(todo.scheduledAt, "d MMM") : "No date"}
						</p>
						<p className="mr-2">{`#${p.project.name}`}</p>
					</div>
				</div>
			)}
			{p.todoFormOpen.open && p.todoFormOpen.todoId === todo.id && (
				<div className="mb-2">
					<TodoForm
						tags={Object.keys(todo.tags).map((key) => ({
							id: key,
							name: todo.tags[key],
						}))}
						updateId={todo.id}
						defaultValues={{
							submitButtonText: "Update todo",
							checked: Object.keys(todo.tags),
							priority: todo.priority,
							todo: {
								title: todo.title,
								description: todo.description ?? "",
							},
							schedule: {
								date: todo.scheduledAt
									? formatISO(todo.scheduledAt, { representation: "date" })
									: null,
								time: todo.scheduledAt
									? formatISO(todo.scheduledAt, {
											representation: "time",
									  }).split("+")[0]
									: null,
								open: false,
							},
							sectionId: todo.sectionId,
							remind: {
								date: todo.remindAt
									? formatISO(todo.remindAt, { representation: "date" })
									: null,
								time: todo.remindAt
									? formatISO(todo.remindAt, { representation: "time" }).split(
											"+"
									  )[0]
									: null,
								open: false,
							},
						}}
						setOpen={(open) => p.setGlobalFormOpen(todo.id, open)}
					/>
				</div>
			)}
		</>
	)
}
