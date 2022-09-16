import ReactDOM from "react-dom"
import SidebarDefaultProjects from "./DefaultProjects"
import SidebarProjects from "./SidebarProjects"
import { SidebarTags } from "./SidebarTags"

export function Sidebar(p: {
	sidebarOpen: boolean
	isMobile: boolean
	setSidebarOpen: (isOpen: boolean) => void
}) {
	const sidebar = (
		<aside
			className="bg-white p-2 flex flex-col items-start justify-start h-full"
			style={{ width: p.isMobile ? "60%" : undefined }}
		>
			<SidebarDefaultProjects />
			<SidebarProjects />
			<SidebarTags />
		</aside>
	)

	if (p.sidebarOpen && p.isMobile) {
		const jsx = (
			<div
				onClick={(e) => {
					e.stopPropagation()
					p.setSidebarOpen(false)
				}}
				className="absolute left-0 pt-12 top-0 bg-[rgba(0,0,0,.15)] h-full w-full"
			>
				{sidebar}
			</div>
		)
		return ReactDOM.createPortal(jsx, document.querySelector("#sidebar")!)
	} else if (p.sidebarOpen) {
		return sidebar
	} else return null
}
