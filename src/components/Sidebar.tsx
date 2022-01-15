import SidebarDefaultProjects from "./DefaultProjects"
import SidebarProjects from "./SidebarProjects"
import { SidebarTags } from "./SidebarTags"

export default function Sidebar() {
	return (
		<>
			<aside className="bg-white p-2 flex flex-col items-start justify-start">
				<SidebarDefaultProjects />
				<SidebarProjects />
				<SidebarTags />
			</aside>
		</>
	)
}
