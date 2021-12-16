import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { UserState } from "../constants"
import { User } from "../types"

interface UserSliceState {
	type: UserState
	user: User | null
}
const initialState: UserSliceState = {
	type: UserState.Initializing,
	user: null,
}

const userSlice = createSlice({
	initialState,
	name: "userSlice",
	reducers: {
		setUser: (state, { payload }: PayloadAction<UserSliceState>) => payload,
	},
})

const { setUser } = userSlice.actions
export { userSlice, setUser }
