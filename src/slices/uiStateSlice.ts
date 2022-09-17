import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface UIState {
  popupOpen: boolean
  sidebarOpen: boolean
  projectCreatorOpen: boolean
}
const initialState: UIState = {
  popupOpen: false,
  projectCreatorOpen: false,
  sidebarOpen: false
}

type types = "popup" | "sidebar" | "projectCreator"

const uiStateSlice = createSlice({
  initialState,
  name: "uiState",
  reducers: {
    toggle: (state, action: PayloadAction<types>) => {
      // I can only say that I want to pay a deep bow to the developers of typescript. They're fucking magicians
      state[`${action.payload}Open`] = !initialState[`${action.payload}Open`]
    },
    set: (state, action: PayloadAction<{ property: types, to: boolean }>) => {
      state[`${action.payload.property}Open`] = action.payload.to
    }
  },
})

const uiStateActions = uiStateSlice.actions
export { uiStateSlice, uiStateActions }
