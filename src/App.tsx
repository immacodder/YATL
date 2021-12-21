import { Sign } from "./views/Sign"
import { Routes, Route, Navigate } from "react-router-dom"
import React, { useEffect, useState } from "react"
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "./firebase"
import {
	UserState,
	FireCol,
	Tag,
	Todo,
	Project,
	DefaultProject,
	DefaultProjects,
	DefaultSection,
	DefaultProjectsIcons,
} from "./types"
import { setUser } from "./slices/userSlice"
import { User } from "./types"
import { AuthChecker } from "./components/AuthChecker"
import { useAppDispatch, useAppSelector } from "./hooks"
import Todolist from "./views/Todolist"
import Test from "./views/Test"
import { v4 } from "uuid"
import { setProjects } from "./slices/projectSlice"

export function App() {
	const [userId, setUserUid] = useState<null | string>(null)
	const [tags, setTags] = useState<Tag[]>([])
	const [todos, setTodos] = useState<Todo[]>([])
	// const [projects, setProjects] = useState<Project[]>([])
	const userState = useAppSelector((s) => s.user)
	const dispatch = useAppDispatch()
	const projects = useAppSelector((s) => s.projects)

	useEffect(() => {
		if (!userId) return

		const createDefaultProjects = async () => {
			const defaultProjects: DefaultProject[] = Object.keys(
				DefaultProjects
			).map((key) => {
				const section: DefaultSection = {
					type: "default",
					id: v4(),
				}
				const project: DefaultProject = {
					type: "default",
					id: v4(),
					name: DefaultProjects[key as keyof typeof DefaultProjects],
					icon: DefaultProjectsIcons[key as keyof typeof DefaultProjects],
					sections: [section],
				}
				return project
			})
			for (let project of defaultProjects) {
				const ref = doc(
					db,
					`${FireCol.Users}/${userId}/${FireCol.Projects}/${project.id}`
				)
				await setDoc(ref, project)
			}
		}

		const ref = collection(db, `${FireCol.Users}/${userId}/${FireCol.Projects}`)
		return onSnapshot(ref, async (snap) => {
			const projects = snap.docs.map((doc) => doc.data() as Project)
			if (!projects.length) {
				await createDefaultProjects()
				return console.log("Successfully created default projects")
			}
			dispatch(setProjects(projects))
		})
	}, [dispatch, userId])

	useEffect(() => {
		return onAuthStateChanged(auth, (authSnapshot) => {
			if (!authSnapshot)
				return dispatch(setUser({ type: UserState.NotSigned, user: null }))
			setUserUid(authSnapshot.uid)
			dispatch(setUser({ type: UserState.Signed, user: null }))
		})
	}, [dispatch])

	useEffect(() => {
		if (userState.type === UserState.Signed) {
			return onSnapshot(doc(db, `${FireCol.Users}/${userId}`), (snap) =>
				dispatch(setUser({ type: UserState.Signed, user: snap.data() as User }))
			)
		}
	}, [dispatch, userState.type, userId])

	useEffect(() => {
		if (!userId) return
		const ref = collection(db, `${FireCol.Users}/${userId}/${FireCol.Tags}`)
		return onSnapshot(ref, (snap) =>
			setTags(snap.docs.map((doc) => doc.data() as Tag))
		)
	}, [userId])

	useEffect(() => {
		if (!userId) return
		const ref = collection(db, `${FireCol.Users}/${userId}/${FireCol.Todos}`)
		return onSnapshot(ref, (snap) =>
			setTodos(snap.docs.map((doc) => doc.data() as Todo))
		)
	}, [userId])

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
						element={<Todolist projects={projects} tags={tags} todos={todos} />}
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
