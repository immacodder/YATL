import Popup from "reactjs-popup"

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
	data: MenuType[]
	trigger: JSX.Element | ((isOpen: boolean) => JSX.Element)
}

export const Menu = (p: P) => (
	<Popup trigger={p.trigger}>
		{(close: any) => (
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
									if (!data.noCloseAfterClick) close()
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
		)}
	</Popup>
)
