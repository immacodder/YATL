import { UserState } from "./constants"

export interface User {
	username: string
	email: string
	createdAt: number
	id: string
	profileImageUrl: string | null
}
export interface Todo {}
export interface Project {}

export interface UserSliceState {
	type: UserState
	user: User | null
}
