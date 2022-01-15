export enum FireCol {
	Users = "users",
	Todos = "todos",
	Projects = "projects",
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
	parentTodo: null | string
	indentation: 0 | 1 | 2 | 3
	remindAt: number | null
	scheduledAt: number | null
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
export const DefaultProjects = ["Inbox", "Today", "Upcoming"] as const

interface BaseProject {
	id: string
	createdAt: number
	name: string
	sections: Section[]
}
export interface DefaultProject extends BaseProject {
	type: "default"
	name: "Today" | "Inbox" | "Upcoming"
	icon: DefaultProjectsIcons
}
export interface UserCreatedProject extends BaseProject {
	type: "userCreated" | "archived"
	color: ProjectColors
}
export interface TagProject extends BaseProject {
	type: "tag"
	todoIds: string[]
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
export type Project = DefaultProject | UserCreatedProject | TagProject

export enum UserState {
	Initializing = "initializing",
	NotSigned = "not signed",
	Signed = "signed",
}

export interface UserSliceState {
	type: UserState
	user: User | null
}
