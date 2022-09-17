import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UIState {
  sidebarOpen: boolean
  projectCreatorOpen: boolean
}
const initialState: UIState = {
  projectCreatorOpen: false,
  sidebarOpen: innerWidth > 700
}

type types = "sidebar" | "projectCreator"

const uiStateSlice = createSlice({
  initialState,
  name: "uiState",
  reducers: {
    toggle: (state, action: PayloadAction<types>) => {
      // I can only say that I want to pay a deep bow to the developers of typescript. They're fucking magicians
      state[`${action.payload}Open`] = !state[`${action.payload}Open`]
    },
    set: (state, action: PayloadAction<{ property: types, to: boolean }>) => {
      state[`${action.payload.property}Open`] = action.payload.to
    }
  },
})

const uiStateActions = uiStateSlice.actions
export { uiStateSlice, uiStateActions }
