import SidebarDefaultProjects from "./DefaultProjects"
import SidebarProjects from "./SidebarProjects"

export default function Sidebar() {
	return (
		<>
			<aside className="bg-white p-2 flex flex-col items-start justify-start">
				<SidebarDefaultProjects />
				<SidebarProjects />
			</aside>
		</>
	)
}
