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
	FirestoreColl,
	Project,
	UserState,
	User,
	RegularProject,
	Colors,
	DefaultProjectsIcons,
	GeneratedProject,
	TagProject,
} from "../types"

export function useDataFetch() {
	const [userId, setUserUid] = useState<null | string>(null)
	const [todos, setTodos] = useState<Todo[]>([])
	const userState = useAppSelector((s) => s.user)
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (!userId) return

		const ref = query(
			collection(db, `${FirestoreColl.Users}/${userId}/${FirestoreColl.Projects}`),
			orderBy("createdAt", "asc")
		)
		return onSnapshot(ref, async (snap) => {
			const projects = snap.docs.map((doc) => doc.data() as Project)
			if (!projects.length) {
				const inbox: RegularProject = {
					type: "regular",
					isInbox: true,
					color: Colors.Pink,
					createdAt: Date.now(),
					sections: [{ id: v4(), type: "default" }],
					id: v4(),
					name: "Inbox",
				}
				const today: GeneratedProject = {
					type: "generated",
					icon: DefaultProjectsIcons.Today,
					id: v4(),
					name: "Today",
					createdAt: Date.now(),
				}
				const upcoming: GeneratedProject = {
					icon: DefaultProjectsIcons.Upcoming,
					createdAt: Date.now(),
					id: v4(),
					name: "Upcoming",
					type: "generated",
				}
				const tags: GeneratedProject = {
					name: "Tags",
					createdAt: Date.now(),
					icon: DefaultProjectsIcons.Tags,
					id: v4(),
					type: "generated"
				}
				await setDoc(
					doc(db, `${FirestoreColl.Users}/${userId}/${FirestoreColl.Projects}/${inbox.id}`),
					inbox
				)
				await setDoc(
					doc(db, `${FirestoreColl.Users}/${userId}/${FirestoreColl.Projects}/${today.id}`),
					today
				)
				await setDoc(
					doc(
						db,
						`${FirestoreColl.Users}/${userId}/${FirestoreColl.Projects}/${upcoming.id}`
					),
					upcoming
				)
				await setDoc(
					doc(db, `${FirestoreColl.Users}/${userId}/${FirestoreColl.Projects}/${tags.id}`),
					tags
				)
				return console.log("Default projects generated")
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
			return onSnapshot(doc(db, `${FirestoreColl.Users}/${userId}`), (snap) =>
				dispatch(setUser({ type: UserState.Signed, user: snap.data() as User }))
			)
		}
	}, [dispatch, userState.type, userId])

	useEffect(() => {
		if (!userId) return
		const ref = collection(db, `${FirestoreColl.Users}/${userId}/${FirestoreColl.Todos}`)
		return onSnapshot(ref, (snap) =>
			setTodos(snap.docs.map((doc) => doc.data() as Todo))
		)
	}, [userId])

	return { todos }
}
