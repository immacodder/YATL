import { Fragment, useState } from "react"
import { getTodoProject } from "../../helpers/getTodoProject"
import { useAppSelector } from "../../hooks"
import { Todo } from "../../types"
import { TodoComp } from "./TodoComp"
import { TodoEditForm } from "./todo_form/TodoEditForm"

interface P {
	setTodoFormOpen: (open: boolean) => void
	todo: Todo
}
export const TodoRender = (p: P) => {
	const projects = useAppSelector((s) => s.projects)
	const [todoEdit, setTodoEdit] = useState({
		id: null as null | string,
		open: false,
	})

	function onTodoEdit(todoId: string, open: boolean) {
		p.setTodoFormOpen(false)
		setTodoEdit({ id: todoId, open })
	}

	return (
		<Fragment key={p.todo.id}>
			{!(todoEdit.open && todoEdit.id === p.todo.id) && (
				<TodoComp
					project={getTodoProject(p.todo, projects)}
					setGlobalFormOpen={onTodoEdit}
					todo={p.todo}
				/>
			)}
			{todoEdit.open && todoEdit.id === p.todo.id && (
				<TodoEditForm setGlobalFormOpen={onTodoEdit} todo={p.todo} />
			)}
		</Fragment>
	)
}
