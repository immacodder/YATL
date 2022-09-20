import {
	format,
	formatISO,
	hoursToMilliseconds,
	isToday,
	isTomorrow,
} from "date-fns"
import Popup from "reactjs-popup"
import type { PopupState } from "./TodoForm"

interface P {
	schedule: PopupState
	setSchedule: (schedule: PopupState) => void
}

export function DateSelector(p: P) {
	const dateInISO = formatISO(Date.now(), {
		representation: "date",
	})
	const timeInISO = formatISO(Date.now(), {
		representation: "time",
	}).split("+")[0]

	let formattedSchedule = p.schedule.date
		? format(new Date(p.schedule.date), `d MMM`)
		: `No date`
	if (p.schedule.date) {
		if (isToday(new Date(p.schedule.date))) formattedSchedule = "Today"
		if (isTomorrow(new Date(p.schedule.date))) formattedSchedule = "Tomorrow"
	}

	return (
		<Popup
			keepTooltipInside
			open={p.schedule.open}
			position="top center"
			trigger={
				<button
					type="button"
					onClick={() =>
						p.setSchedule({ ...p.schedule, open: !p.schedule.open })
					}
					className="flex itmes-center mx-1 button"
				>
					{formattedSchedule}
					<span className="material-icons ml-1">event</span>
				</button>
			}
		>
			<>
				<div className="flex items-center">
					<button
						className="button bg-secondary text-white mr-2"
						onClick={() => p.setSchedule({ ...p.schedule, date: dateInISO })}
					>
						Today
					</button>
					<button
						onClick={() =>
							p.setSchedule({
								...p.schedule,
								date: formatISO(
									new Date(dateInISO).getTime() + hoursToMilliseconds(24),
									{ representation: "date" }
								),
							})
						}
						className="button bg-secondary text-white"
					>
						Tomorrow
					</button>
				</div>
				<label htmlFor="dueDatePicker">Date: </label>
				<input
					id="dueDatePicker"
					type="date"
					className="button m-1"
					value={p.schedule.date ?? dateInISO}
					onChange={(e) =>
						p.setSchedule({ ...p.schedule, date: e.target.value })
					}
				/>
				<br />
				<label htmlFor="dueTimePicker">Time: </label>
				<input
					id="dueTimePicker"
					type="time"
					className="button m-1"
					value={p.schedule.time ?? timeInISO}
					onChange={(e) =>
						p.setSchedule({ ...p.schedule, time: e.target.value })
					}
					min={timeInISO}
				/>
			</>
		</Popup>
	)
}
