import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface Deletion {
  id: string
  timeoutId: NodeJS.Timeout
}
interface DeletionState {
  todo: Deletion | null
  project: Deletion | null
}
const initialState: DeletionState = {
  todo: null,
  project: null
}


const deletionSlice = createSlice({
  initialState,
  name: "deletionSlice",
  reducers: {
    setProjectDeletion(state, payload: PayloadAction<Deletion | null>) {
      state.project = payload.payload
    },
    setTodoDeletion(state, payload: PayloadAction<Deletion | null>) {
      state.todo = payload.payload
    }
  },
})

const { setProjectDeletion, setTodoDeletion } = deletionSlice.actions
export { deletionSlice, setProjectDeletion, setTodoDeletion }
