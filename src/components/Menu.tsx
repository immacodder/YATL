import Popup from "./Popup"

export interface MenuType {
	name: string
	action: () => void
	icon: string
	danger?: true
	separatorAfter?: true
	separatorBefore?: true
	noCloseAfterClick?: true
	ref?: React.RefObject<HTMLButtonElement>
}

interface P {
	anchor: HTMLElement | null
	setOpen: (open: boolean) => void
	data: MenuType[]
}

export const Menu = (p: P) => (
	<Popup offsetRight={16} type="anchor" anchor={p.anchor} setOpen={p.setOpen}>
		<div className="flex flex-col justify-start items-start">
			{p.data.map((data) => {
				return (
					<div
						key={data.name}
						className="hover:bg-black hover:bg-opacity-10 w-full"
					>
						{data.separatorBefore && <hr />}
						<button
							ref={data.ref}
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
			})}
		</div>
	</Popup>
)
