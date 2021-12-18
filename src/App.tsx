import { Sign } from "./views/Sign"
import { Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import { collection, doc, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "./firebase"
import { UserState, CollectionFire, Tag, Todo } from "./types"
import { setUser } from "./slices/userSlice"
import { User } from "./types"
import { AuthChecker } from "./components/AuthChecker"
import { useAppDispatch, useAppSelector } from "./hooks"
import Todolist from "./views/Todolist"

export function App() {
	const [userId, setUserUid] = useState<null | string>(null)
	const [tags, setTags] = useState<Tag[]>([])
	const [todos, setTodos] = useState<Todo[]>([])
	const userState = useAppSelector((s) => s.user)
	const dispatch = useAppDispatch()

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
			return onSnapshot(doc(db, `${CollectionFire.Users}/${userId}`), (snap) =>
				dispatch(setUser({ type: UserState.Signed, user: snap.data() as User }))
			)
		}
	}, [dispatch, userState.type, userId])

	useEffect(() => {
		if (!userId) return
		const ref = collection(
			db,
			`${CollectionFire.Users}/${userId}/${CollectionFire.Tags}`
		)
		return onSnapshot(ref, (snap) =>
			setTags(snap.docs.map((doc) => doc.data() as Tag))
		)
	}, [userId])

	useEffect(() => {
		if (!userId) return
		const ref = collection(
			db,
			`${CollectionFire.Users}/${userId}/${CollectionFire.Todos}`
		)
		return onSnapshot(ref, (snap) =>
			setTodos(snap.docs.map((doc) => doc.data() as Todo))
		)
	}, [userId])

	return (
		<Routes>
			<>
				<Route path="/" element={<AuthChecker />}>
					<Route index element={<Todolist todos={todos} tags={tags} />} />
					<Route
						path="*"
						element={
							<h1 className="text-3xl text-red-500">{"404 No such page :("}</h1>
						}
					/>
				</Route>
				<Route path="/signin" element={<Sign signIn />} />
				<Route path="/signup" element={<Sign signIn={false} />} />
			</>
		</Routes>
	)
}
