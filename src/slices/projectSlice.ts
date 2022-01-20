import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Project } from "../types"

const initialState: Project[] = []

const projectSlice = createSlice({
	initialState,
	name: "projectSlice",
	reducers: {
		setProjects: (_state, { payload }: PayloadAction<Project[]>) => {
			return [...payload]
		},
	},
})

const { setProjects } = projectSlice.actions
export { projectSlice, setProjects }
