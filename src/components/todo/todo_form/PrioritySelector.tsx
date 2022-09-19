interface P {
	priority: number
	setPriority: (priority: number) => void
}
export default function PrioritySelector(p: P) {
	return (
		<select
			className="button appearance-none ml-2 mr-1"
			onChange={({ target: { value } }) => p.setPriority(+value)}
			value={p.priority}
		>
			<option value={1}>P1</option>
			<option value={2}>P2</option>
			<option value={3}>P3</option>
			<option value={4}>Priority</option>
		</select>
	)
}
