import React, { useCallback, useState } from "react"
import ReactDOM from "react-dom"

interface P {
	type: "dialog" | "anchor"
	children: JSX.Element | JSX.Element[]
	anchor: HTMLElement | null
	setOpen: (open: boolean) => void
}

export default function Popup(p: P) {
	const [position, setPosition] = useState({ x: 0, y: 0 })
	type WrapperNode = HTMLDivElement | null
	const [wrapperNode, setWrapperNode] = useState<WrapperNode>(null)
	const [offsetBy, setOffsetBy] = useState(0)
	const onWrapperNodeChange = useCallback(
		(el: WrapperNode) => setWrapperNode(el),
		[]
	)

	function getCoords(elem: HTMLElement) {
		const box = elem.getBoundingClientRect()

		return {
			top: box.top + window.pageYOffset,
			right: box.right + window.pageXOffset,
			bottom: box.bottom + window.pageYOffset,
			left: box.left + window.pageXOffset,
		}
	}

	if (wrapperNode !== null && offsetBy === 0) {
		const { right } = wrapperNode.getBoundingClientRect()
		const diff = right - document.documentElement.clientWidth

		if (diff > 0) {
			setOffsetBy(diff)
		}
	}

	if (p.anchor && !(position.x && position.y)) {
		const { left, bottom } = getCoords(p.anchor)
		setPosition({ x: left, y: bottom })
	}

	return ReactDOM.createPortal(
		<div
			onClick={() => p.setOpen(false)}
			className={`left-0 top-0 absolute w-full h-full bg-black bg-opacity-10 overflow-clip ${
				p.type === "dialog" ? "flex justify-center items-center" : ""
			}`}
		>
			<div
				ref={onWrapperNodeChange}
				className={`absolute min-w-fit bg-white p-4 rounded`}
				style={
					p.type === "anchor"
						? {
								top: position.y + "px",
								left: position.x - (offsetBy ? offsetBy + 10 : 0) + "px",
						  }
						: undefined
				}
				onClick={(e) => e.stopPropagation()}
			>
				{p.children}
			</div>
		</div>,
		document.querySelector("#popup") as HTMLDivElement
	)
}
