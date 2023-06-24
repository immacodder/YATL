import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface SnackbarInfo {
  id: string
  timeoutId: NodeJS.Timeout
}
interface TodoCompletionInfo {
  id: string
}
interface SnackbarState {
  todoDeletion: SnackbarInfo | null
  projectDeletion: SnackbarInfo | null
  todoCompletion: TodoCompletionInfo | null
}
const initialState: SnackbarState = {
  todoDeletion: null,
  projectDeletion: null,
  todoCompletion: null
}


const snackbarSlice = createSlice({
  initialState,
  name: "snackbarSlice",
  reducers: {
    setProjectDeletion(state, payload: PayloadAction<SnackbarInfo | null>) {
      state.projectDeletion = payload.payload
    },
    setTodoDeletion(state, payload: PayloadAction<SnackbarInfo | null>) {
      state.todoDeletion = payload.payload
    },
    setTodoCompletion(state, payload: PayloadAction<TodoCompletionInfo | null>) {
      state.todoCompletion = payload.payload
    }
  },
})

const { setProjectDeletion, setTodoDeletion, setTodoCompletion } = snackbarSlice.actions
export { snackbarSlice, setProjectDeletion, setTodoDeletion, setTodoCompletion }
