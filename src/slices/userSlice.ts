import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { User } from "../types"

const userSlice = createSlice({
	initialState: "initalizing" as User | "initializing",
	name: "userSlice",
	reducers: {
		setUser(state, { payload }: PayloadAction<User>) {
			state = payload
		},
	},
})

const { setUser } = userSlice.actions
export { userSlice, setUser }
