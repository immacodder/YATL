import { onAuthStateChanged } from "firebase/auth"
import {
	doc,
	setDoc,
	query,
	collection,
	orderBy,
	onSnapshot,
} from "firebase/firestore"
import { useState, useEffect } from "react"
import { v4 } from "uuid"
import { useAppSelector, useAppDispatch } from "."
import { db, auth } from "../firebase"
import { setProjects } from "../slices/projectSlice"
import { setUser } from "../slices/userSlice"
import {
	Todo,
	DefaultProject,
	DefaultProjects,
	DefaultSection,
	DefaultProjectsIcons,
	FireCol,
	Project,
	UserState,
	User,
} from "../types"

export default function useDataFetch() {
	const [userId, setUserUid] = useState<null | string>(null)
	const [todos, setTodos] = useState<Todo[]>([])
	const userState = useAppSelector((s) => s.user)
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (!userId) return

		async function createDefaultProjects() {
			const defaultProjects: DefaultProject[] = DefaultProjects.map((key) => {
				const section: DefaultSection = {
					type: "default",
					id: v4(),
				}
				const project: DefaultProject = {
					type: "default",
					id: v4(),
					createdAt: new Date().getTime(),
					name: key,
					icon: DefaultProjectsIcons[key],
					sections: [section],
				}
				return project
			})
			let delay = 0
			for (let project of defaultProjects) {
				const ref = doc(
					db,
					`${FireCol.Users}/${userId}/${FireCol.Projects}/${project.id}`
				)
				delay += 100

				setTimeout(() => {
					project.createdAt = new Date().getTime()
					setDoc(ref, project)
				}, delay)
			}
		}

		const ref = query(
			collection(db, `${FireCol.Users}/${userId}/${FireCol.Projects}`),
			orderBy("createdAt", "asc")
		)
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
		const ref = collection(db, `${FireCol.Users}/${userId}/${FireCol.Todos}`)
		return onSnapshot(ref, (snap) =>
			setTodos(snap.docs.map((doc) => doc.data() as Todo))
		)
	}, [userId])

	return { todos }
}
