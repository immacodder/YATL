import Popup from "./Popup"

interface P {
	setOpen: (open: boolean) => void
	action: () => void
	text: string
	cancelText?: string
	confirmText?: string
	danger?: true
}
export default function Dialog(p: P) {
	return (
		<Popup
			type="dialog"
			anchor={null}
			wrapperClassNames="p-4"
			setOpen={p.setOpen}
		>
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
		</Popup>
	)
}
