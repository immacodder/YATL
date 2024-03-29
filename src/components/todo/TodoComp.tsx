import { doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { Delays, FirestoreColl, Project, Todo, User } from "../../types"
import { TodoInfo } from "./TodoInfo"
import { TodoMenu } from "./TodoMenu"
import { setTodoCompletion } from "../../slices/snackbarSlice"

export async function toggleCompletion(user: User, todo: Todo) {
	const ref = doc(
		db,
		`${FirestoreColl.Users}/${user.id}/${FirestoreColl.Todos}/${todo.id}`
	)
	if (todo.type === "completed")
		await updateDoc(ref, { type: "default" } as { type: Todo["type"] })
	if (todo.type === "default")
		await updateDoc(ref, { type: "completed" } as { type: Todo["type"] })
}

interface P {
	todo: Todo
	setGlobalFormOpen: (id: string, open: boolean) => void
	project: Project
}
export function TodoComp(p: P) {
	const user = useAppSelector((s) => s.user.user as User)
	const todo = p.todo
	const dispatch = useAppDispatch()
	const snackbarState = useAppSelector((s) => s.snackbar)

	const onTodoCheck = async () => {
		await toggleCompletion(user, todo)
		dispatch(setTodoCompletion({ id: todo.id }))
	}

	return (
		<>
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
					<TodoMenu setGlobalFormOpen={p.setGlobalFormOpen} todo={p.todo} />
				</div>
				{todo.description && (
					<p className="ml-7 mb-2 text-sm">{todo.description}</p>
				)}
				<TodoInfo project={p.project} todo={p.todo} />
			</div>
		</>
	)
}
