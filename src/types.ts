export enum FireCol {
	Users = "users",
	Todos = "todos",
	Projects = "projects",
	Tags = "tags",
}
export enum StorageCol {
	ProfileImages = "profileImages",
}

export interface User {
	username: string
	email: string
	createdAt: number
	id: string
	profileImageUrl: string | null
}

export interface Todo {
	id: string
	type: "completed" | "default"
	createdAt: number
	repeatedAt: string
	children: Todo[]
	title: string
	description: string | null
	sectionId: string
	priority: 1 | 2 | 3 | 4
	tags: {
		[id: string]: string
	}
	parentTodo: null | string
	indentation: 0 | 1 | 2 | 3
	remindAt: number | null
	scheduledAt: number | null
}
export interface Tag {
	id: string
	todos: string[]
	name: string
}

export enum ProjectColors {
	Emerald = "#34d399",
	Slate = "#94a3b8",
	Red = "#f87171",
	Amber = "#fb923c",
	Yellow = "#facc15",
	Green = "#4ade80",
	Cyan = "#22d3ee",
	Blue = "#60a5fa",
	Violet = "#a78bfa",
	Fuchsia = "#d946ef",
	Pink = "#ec4899",
}
export enum DefaultProjectsIcons {
	Inbox = "inbox",
	Today = "today",
	Upcoming = "date_range",
}
export enum DefaultProjects {
	Today = "Today",
	Inbox = "Inbox",
	Upcoming = "Upcoming",
}
export interface DefaultProject {
	id: string
	type: "default"
	name: DefaultProjects
	icon: DefaultProjectsIcons
	sections: Section[]
}
export interface UserCreatedProject {
	id: string
	type: "userCreated" | "archived"
	name: string
	color: ProjectColors
	comment: string | null
	sections: Section[]
}
export interface DefaultSection {
	id: string
	type: "default"
}
export interface UserSection {
	id: string
	type: "userCreated"
	name: string
}
export type Section = DefaultSection | UserSection
export type Project = DefaultProject | UserCreatedProject

export enum UserState {
	Initializing = "initializing",
	NotSigned = "not signed",
	Signed = "signed",
}

export interface UserSliceState {
	type: UserState
	user: User | null
}
