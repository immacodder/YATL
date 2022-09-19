import { format, formatISO } from "date-fns"
import { useRef } from "react"
import Popup from "../../Popup"
import type { DefValues, PopupState } from "./TodoForm"

interface P {
	defValues?: DefValues
	remind: PopupState
	setRemind: (remind: PopupState) => void
}
export default function RemindSelector(p: P) {
	const timeInISO = formatISO(new Date(), { representation: "time" }).split(
		"+"
	)[0]
	const dateInISO = formatISO(new Date(), { representation: "date" })

	const remindAnchor = useRef<HTMLButtonElement>(null)

	let formattedReminder = p.remind.date
		? format(
				new Date(
					`${p.remind.date} ${
						p.remind.time ??
						formatISO(new Date(2020, 11, 12, 12), { representation: "time" })
					}`
				),
				`d MMM 'at' kk':'mm`
		  )
		: `No reminder`

	return (
		<>
			<button
				type="button"
				onClick={() => p.setRemind({ ...p.remind, open: !p.remind.open })}
				ref={remindAnchor}
				className="button mx-1 flex items-center"
			>
				{formattedReminder}
				<span className="material-icons ml-1">alarm_add</span>
			</button>
			{p.remind.open && (
				<Popup
					type="anchor"
					setOpen={(open) => p.setRemind({ ...p.remind, open })}
					anchor={remindAnchor.current}
				>
					<div className="flex items-center justify-start">
						<label htmlFor="remindDatePicker">Date: </label>
						<input
							id="remindDatePicker"
							type="date"
							className="button m-1"
							onChange={(e) =>
								p.setRemind({ ...p.remind, date: e.target.value })
							}
							value={p.remind.date ?? dateInISO}
							min={formatISO(new Date(), {
								representation: "date",
							})}
						/>
					</div>
					<div className="flex items-center justify-start">
						<label htmlFor="remindTimePicker">Time: </label>
						<input
							id="remindTimePicker"
							type="time"
							className="button m-1"
							onChange={(e) =>
								p.setRemind({ ...p.remind, time: e.target.value })
							}
							value={p.remind.time ?? timeInISO}
							min={timeInISO}
						/>
					</div>
				</Popup>
			)}
		</>
	)
}
