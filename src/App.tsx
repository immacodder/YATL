import AppRouter from "./components/AppRouter"
import useDataFetch from "./hooks/useDataFetch"

export function App() {
	const { todos } = useDataFetch()
	return <AppRouter todos={todos} />
}
