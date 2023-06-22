export enum FirestoreColl {
	Users = "users",
	Todos = "todos",
	Projects = "projects",
}
export enum StorageColl {
	ProfileImages = "profileImages",
}

export interface UserSliceState {
	type: UserState
	user: User | null
}
export enum SortBy {
	alphabetically = "Alphabetically",
	date_added = "Date added",
	due_date = "Due date",
	priority = "Priority",
	project = "Project",
}
export enum GroupBy {
	default = "Default",
	date_added = "Date added",
	due_date = "Due date",
	priority = "Priority",
	label = "Label",
	project = "Project",
}

export interface User {
	username: string
	email: string
	createdAt: number
	id: string
	profileImageUrl: string | null
	preferences: UserPrefs
}

export interface UserPrefs {
	sortBy: { [projectId: string]: keyof typeof SortBy }
	groupBy: { [projectId: string]: keyof typeof GroupBy }
	showCompleted: { [projectId: string]: boolean }
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
export enum Colors {
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
	Tags = "sell"
}

interface BaseProject {
	id: string
	name: string
	createdAt: number
}
export interface GeneratedProject extends BaseProject {
	type: "generated"
	name: "Today" | "Upcoming" | "Tags"
	icon: DefaultProjectsIcons
}
export interface RegularProject extends BaseProject {
	type: "regular" | "archived"
	sections: [DefaultSection, ...Section[]]
	color: Colors
	isInbox?: true
}
export interface TagProject extends BaseProject {
	color: Colors
	type: "tag"
	todoIds: string[]
	sections: [DefaultSection]
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
export type Project = GeneratedProject | RegularProject | TagProject

export enum UserState {
	Initializing = "initializing",
	NotSigned = "not signed",
	Signed = "signed",
}
