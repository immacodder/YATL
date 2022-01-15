import { createPortal } from "react-dom"

interface P {
	action?: {
		handler: () => void
		message: string
	}
	message: string
	variant: "Success" | "Error" | "Warning" | "Notification"
}

export function Snackbar(p: P) {
	let color =
		p.variant === "Success"
			? "bg-green-300"
			: p.variant === "Error"
			? "bg-red-400"
			: p.variant === "Notification"
			? "bg-blue-400"
			: p.variant === "Warning"
			? "bg-yellow-300"
			: ""

	let icon =
		p.variant === "Success"
			? "check_circle"
			: p.variant === "Warning"
			? "warning"
			: p.variant === "Error"
			? "error"
			: p.variant === "Notification"
			? "notifications"
			: ""

	const jsx = (
		<div className="z-[1100] fixed bottom-4 left-0 w-[100vw]">
			<div className={`w-full`}>
				<div
					className={`p-2 rounded ${color} shadow-md hover:shadow-lg transition-shadow mx-auto flex justify-center w-fit`}
				>
					<span className="material-icons mr-1">{icon}</span>
					<p className="">{p.message}</p>
					{p.action && (
						<button
							className={`button bg-slate-700 py-0 shadow-none text-[#eee] ml-2`}
							onClick={p.action.handler}
						>
							{p.action.message}
						</button>
					)}
				</div>
			</div>
		</div>
	)

	return createPortal(jsx, document.querySelector("#snackbar")!)
}
