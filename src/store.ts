import { configureStore } from "@reduxjs/toolkit"
import { projectSlice } from "./slices/projectSlice"
import { userSlice } from "./slices/userSlice"

export const store = configureStore({
	reducer: {
		user: userSlice.reducer,
		projects: projectSlice.reducer,
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
