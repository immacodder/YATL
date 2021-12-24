import AppRouter from "./components/Router"
import useDataFetch from "./hooks/useDataFetch"

export function App() {
	const { todos, tags } = useDataFetch()
	return <AppRouter tags={tags} todos={todos} />
}
