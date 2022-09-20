import AppRouter from "./components/AppRouter"
import useDataFetch from "./hooks/useDataFetch"
import "reactjs-popup/dist/index.css"

export function App() {
	const { todos } = useDataFetch()
	return <AppRouter todos={todos} />
}
