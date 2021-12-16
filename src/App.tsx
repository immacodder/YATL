import { Sign } from "./views/Sign"
import { Routes, BrowserRouter, Route } from "react-router-dom"

export function App() {
	return (
		<Routes>
			<Route path="signin" element={<Sign signIn />} />
			<Route path="signup" element={<Sign signIn={false} />} />
		</Routes>
	)
}
