import { configureStore } from "@reduxjs/toolkit"
import { projectSlice } from "./slices/projectSlice"
import { uiStateSlice } from "./slices/uiStateSlice"
import { userSlice } from "./slices/userSlice"
import { deletionSlice } from "./slices/deletionSlice"

export const store = configureStore({
	reducer: {
		user: userSlice.reducer,
		projects: projectSlice.reducer,
		uiState: uiStateSlice.reducer,
		deletion: deletionSlice.reducer
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
