import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { v4 } from "uuid"
import { GeneratedProject, DefaultProjectsIcons, Project } from "../types"

const initialState: Project[] = []

const projectSlice = createSlice({
	initialState,
	name: "projectSlice",
	reducers: {
		setProjects: (_state, { payload }: PayloadAction<Project[]>) => {
			const today: GeneratedProject = {
				type: "generated",
				icon: DefaultProjectsIcons.Today,
				id: v4(),
				name: "Today",
			}
			const upcoming: GeneratedProject = {
				icon: DefaultProjectsIcons.Upcoming,
				id: v4(),
				name: "Upcoming",
				type: "generated",
			}
			return [today, upcoming, ...payload]
		},
	},
})

const { setProjects } = projectSlice.actions
export { projectSlice, setProjects }
