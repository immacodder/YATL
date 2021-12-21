import React from "react"
import { Navigate, Outlet, useNavigate } from "react-router-dom"
import { Project, UserState } from "../types"
import { useAppSelector } from "../hooks"

interface P {
	projects: Project[]
}
export function AuthChecker(p: P) {
	const authUser = useAppSelector((s) => s.user)

	if (authUser.type === UserState.Initializing) return null
	if (authUser.type === UserState.NotSigned) {
		return <Navigate to="/signin" />
	}
	if (
		authUser.type === UserState.Signed &&
		authUser.user !== null &&
		p.projects.filter((project) => project.type === "default").length === 3
	)
		return <Outlet />
	return null
}
