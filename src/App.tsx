import { Sign } from "./views/Sign"
import { Routes, BrowserRouter, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import type { User as AuthUser } from "firebase/auth"
import { auth, db } from "./firebase"
import { UserState, FirestoreCollection } from "./constants"
import { setUser } from "./slices/userSlice"
import { User } from "./types"
import { AuthChecker } from "./components/AuthChecker"
import { useAppDispatch, useAppSelector } from "./hooks"

export function App() {
	const [userUid, setUserUid] = useState<null | string>(null)
	const userState = useAppSelector((s) => s.user)
	const dispatch = useAppDispatch()

	useEffect(() => {
		return onAuthStateChanged(auth, (authSnapshot) => {
			if (!authSnapshot)
				return dispatch(setUser({ type: UserState.NotSigned, user: null }))
			setUserUid(authSnapshot.uid)
			dispatch(setUser({ type: UserState.Signed, user: null }))
		})
	}, [])

	useEffect(() => {
		if (userState.type === UserState.Signed) {
			return onSnapshot(
				doc(db, `${FirestoreCollection.Users}/${userUid}`),
				(snap) =>
					dispatch(
						setUser({ type: UserState.Signed, user: snap.data() as User })
					)
			)
		}
		console.log(userState.type)
	}, [userUid])

	return (
		<Routes>
			<>
				<Route path="/" element={<AuthChecker />}>
					<Route index element={<div>This is a root!</div>} />
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
