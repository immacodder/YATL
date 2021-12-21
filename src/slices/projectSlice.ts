import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Project } from "../types"

const initialState: Project[] = []

const projectSlice = createSlice({
	initialState,
	name: "projectSlice",
	reducers: {
		setProjects: (state, { payload }: PayloadAction<Project[]>) => payload,
	},
})

const { setProjects } = projectSlice.actions
export { projectSlice, setProjects }
