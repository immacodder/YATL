import ReactDOM from "react-dom"
import { useDispatch } from "react-redux"
import { useAppSelector } from "../../hooks"
import { uiStateActions } from "../../slices/uiStateSlice"
import { SidebarDefaultProjects } from "./DefaultProjects"
import { SidebarProjects } from "./SidebarProjects"
import { SidebarTags } from "./SidebarTags"

export function Sidebar(p: { isMobile: boolean }) {
	const sidebarOpen = useAppSelector((s) => s.uiState.sidebarOpen)
	const dispatch = useDispatch()
	const sidebar = (
		<aside
			id="sidebar"
			className="bg-white p-2 flex flex-col items-start justify-start h-full"
			style={{ width: p.isMobile ? "60%" : undefined }}
		>
			<SidebarDefaultProjects />
			<SidebarProjects />
			<SidebarTags />
		</aside>
	)

	if (sidebarOpen && p.isMobile) {
		const jsx = (
			<div
				onClick={(e) => {
					e.stopPropagation()
					const target = e.target as HTMLElement
					const sidebar = document.getElementById("sidebar") as HTMLDivElement // aside and div have the same properties, don't they?
					const matchClasses = ["projectLink", "newProjectButton"]
					const allMatches: Element[] = []
					matchClasses.forEach((matchClass) => {
						allMatches.push(
							...Array.from(document.querySelectorAll(`.${matchClass}`))
						)
					})

					const targetWithinMatches = allMatches.find((match) => {
						return match.contains(target)
					})

					if (targetWithinMatches && p.isMobile) {
						dispatch(uiStateActions.set({ property: "sidebar", to: false }))
					}

					if (target.id !== "sidebar" && !sidebar.contains(target)) {
						dispatch(uiStateActions.set({ property: "sidebar", to: false }))
					}
				}}
				className="absolute left-0 pt-12 top-0 bg-[rgba(0,0,0,.15)] h-full w-full"
			>
				{sidebar}
			</div>
		)
		return ReactDOM.createPortal(
			jsx,
			document.getElementById("sidebarWrapper")!
		)
	} else if (sidebarOpen) {
		return sidebar
	} else return null
}
