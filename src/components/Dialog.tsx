import Popup from "reactjs-popup"

interface P {
	action: () => void
	text: string
	cancelText?: string
	confirmText?: string
	danger?: true
	open: boolean
	setOpen: (open: boolean) => void
}
export function Dialog(p: P) {
	return (
		<Popup
			contentStyle={{ padding: "1rem", margin: "1rem 0" }}
			open={p.open}
			onClose={() => p.setOpen(false)}
			modal
		>
			<>
				<p className="text-lg">{p.text}</p>
				<div className="mt-2">
					<button
						onClick={() => {
							p.setOpen(false)
							p.action()
						}}
						className={`button ${p.danger ? "hover:bg-red-500 " : ""} mr-2`}
					>
						{p.confirmText ?? "Yes"}
					</button>
					<button onClick={() => p.setOpen(false)} className="button-outline">
						{p.cancelText ?? "Cancel"}
					</button>
				</div>
			</>
		</Popup>
	)
}
