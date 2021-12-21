import Popup from "./Popup"

export interface MenuTypeDefault {
	name: string
	action: () => void
	icon: string
	danger?: true
	separatorAfter?: true
	separatorBefore?: true
	noCloseAfterClick?: true
}
export interface MenuTypeCustom {
	type: "custom"
	render: JSX.Element
}

interface P {
	anchor: HTMLElement | null
	setOpen: (open: boolean) => void
	data: (MenuTypeDefault | MenuTypeCustom)[]
}

export const Menu = (p: P) => (
	<Popup type="anchor" anchor={p.anchor} setOpen={p.setOpen}>
		<div className="menu flex flex-col justify-start items-start">
			{p.data.map((data) => {
				if (!("type" in data))
					return (
						<div
							key={data.name}
							className="hover:bg-black hover:bg-opacity-10 w-full"
						>
							{data.separatorBefore && <hr />}
							<button
								onClick={() => {
									if (!data.noCloseAfterClick) p.setOpen(false)
									data.action()
								}}
								className={`p-2 flex items-center ${
									data.danger ? "text-red-500" : ""
								}`}
							>
								<span className="mr-2 material-icons">{data.icon}</span>
								{data.name}
							</button>
							{data.separatorAfter && <hr />}
						</div>
					)
				return data.render
			})}
		</div>
	</Popup>
)
