import { Fragment, useRef, useState } from "react"
import Popup from "../components/Popup"

export default function Test() {
	const buttonRef = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)

	return (
		<Fragment>
			<button className="button" ref={buttonRef} onClick={() => setOpen(true)}>
				Select
			</button>
			{open && (
				<Popup
					anchor={buttonRef.current}
					setOpen={setOpen}
					type="anchor"
					wrapperClassNames="p-"
				>
					<ul>
						<li className="hover:bg-black hover:bg-opacity-10 rounded hover:cursor-pointer">
							{" "}
							something{" "}
						</li>
						<li className="hover:bg-black hover:bg-opacity-10 rounded ml-2">
							another
						</li>
						<li className="hover:bg-black hover:bg-opacity-10 rounded">lolo</li>
					</ul>
				</Popup>
			)}
		</Fragment>
	)
}
