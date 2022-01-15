import { Routes, Route, Navigate } from "react-router-dom"
import { useAppSelector } from "../hooks"
import { Todo } from "../types"
import { Sign } from "../views/Sign"
import Test from "../views/Test"
import MainView from "../views/MainView"
import { AuthChecker } from "./AuthChecker"

interface P {
	todos: Todo[]
}
export default function AppRouter({ todos }: P) {
	const projects = useAppSelector((s) => s.projects)

	return (
		<Routes>
			<Route path="/" element={<AuthChecker projects={projects} />}>
				<Route index element={<Navigate to="project" />} />
				<Route path="project">
					<Route
						index
						element={
							<Navigate
								to={
									projects.find((project) => project.type === "default")?.id ??
									"/404/not-found"
								}
							/>
						}
					/>
					<Route
						path=":projectId"
						element={<MainView projects={projects} todos={todos} />}
					/>
				</Route>
				<Route path="tag">
					<Route
						index
						element={
							<Navigate
								to={
									projects.find((project) => project.type === "tag")?.id ??
									"/404/not-found"
								}
							/>
						}
					/>
					<Route
						path=":projectId"
						element={<MainView projects={projects} todos={todos} />}
					/>
				</Route>
			</Route>
			<Route path="/signin" element={<Sign signIn />} />
			<Route path="/signup" element={<Sign signIn={false} />} />
			<Route path="/test" element={<Test />} />
			<Route
				path="*"
				element={
					<h1 className="text-3xl text-red-500">{"404 No such page :("}</h1>
				}
			/>
		</Routes>
	)
}
