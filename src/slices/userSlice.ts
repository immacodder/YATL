import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { UserState } from "../types"
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
		setUser: (_state, { payload }: PayloadAction<UserSliceState>) => payload,
	},
})

const { setUser } = userSlice.actions
export { userSlice, setUser }
