export enum CollectionFire {
	Users = "users",
	Todos = "todos",
	Tags = "tags",
}
export enum CollectionStorage {
	ProfileImages = "profileImages",
}
export enum UserState {
	Initializing = "initializing",
	NotSigned = "not signed",
	Signed = "signed",
}

export interface User {
	username: string
	email: string
	createdAt: number
	id: string
	profileImageUrl: string | null
}

export enum TodoType {
	Default = "default",
	Completed = "completed",
}
export enum Priority {
	P1 = "P1",
	P2 = "P2",
	P3 = "P3",
	P4 = "P4",
}
export enum Indentation {
	Level0,
	Level1,
	Level2,
	Level3,
}
export interface Todo {
	id: string
	type: TodoType
	createdAt: number
	repeatedAt: string
	children: Todo[]
	title: string
	description: string | null
	priority: Priority
	tags: string[]
	parentTodo: null | string
	indentation: Indentation
	remindAt: number | null
	dueUntil: number | null
}
export interface Tag {
	id: string
	todos: string[]
	name: string
}

export enum ProjectType {
	Today,
	Upcoming,
	Inbox,
	UserCreated,
	Archived,
}
export interface Section {
	id: string
	todos: Todo[]
	title: string
}

export interface Project {
	id: string
	type: ProjectType
	createdAt: number
	title: string
	comment: string
	sections: Section[]
}

export interface UserSliceState {
	type: UserState
	user: User | null
}
