import { Navigate, Outlet, useNavigate } from "react-router-dom"
import { UserState } from "../types"
import { useAppSelector } from "../hooks"

export function AuthChecker() {
	const authUser = useAppSelector((s) => s.user)

	if (authUser.type === UserState.Initializing) return null
	if (authUser.type === UserState.NotSigned) {
		return <Navigate to="/signin" />
	}

	return <Outlet />
}
