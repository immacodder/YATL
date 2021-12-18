import TodoForm from "../components/TodoForm"
import { Tag, Todo } from "../types"

interface Props {
	tags: Tag[]
	todos: Todo[]
}
export default function (p: Props) {
	return (
		<div
			className="grid w-[100vw] h-[100vh]"
			style={{
				gridTemplateColumns: `200px auto`,
				gridTemplateRows: `3rem auto`,
			}}
		>
			{/* APPBAR */}
			<div className="bg-red-400 col-span-full h-12 w-full"></div>
			{/* SIDEBAR */}
			<div className="bg-blue-300"></div>
			{/* MAIN */}
			<div>
				<div className="flex justify-end">
					<button className="m-2 button">Comment</button>
					<button className="m-2 button">Project actions</button>
					<button className="m-2 button">View</button>
				</div>
				<TodoForm tags={p.tags} />
			</div>
		</div>
	)
}
