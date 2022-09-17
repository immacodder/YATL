import React, { useCallback, useEffect, useState } from "react"
import ReactDOM from "react-dom"
import { useWindowResize } from "../hooks/useWindowResize"

interface P {
	type: "dialog" | "anchor"
	children: JSX.Element | JSX.Element[]
	anchor: HTMLElement | null
	setOpen: (open: boolean) => void
	offsetRight?: number
	wrapperClassNames?: string
	wrapperStyles?: React.CSSProperties
}

export default function Popup(p: P) {
	const [position, setPosition] = useState({
		offsetRight: null as number | null,
		bottom: null as number | null,
	})
	type WrapperNode = HTMLDivElement | null
	const [wrapperNode, setWrapperNode] = useState<WrapperNode>(null)
	const onWrapperNodeChange = useCallback(
		(el: WrapperNode) => setWrapperNode(el),
		[]
	)
	const { width: windowWidth } = useWindowResize()

	useEffect(() => {
		if (p.anchor) {
			const { right, bottom } = getCoords(p.anchor)
			let offsetFromRight = innerWidth - right
			const wrapperLeft = wrapperNode?.getBoundingClientRect().left ?? 0
			if (wrapperLeft < 0) {
				offsetFromRight = offsetFromRight - (Math.abs(wrapperLeft) + 16)
			}

			setPosition({ offsetRight: offsetFromRight, bottom })
		}
	}, [p, windowWidth, wrapperNode])

	function getCoords(elem: HTMLElement) {
		const box = elem.getBoundingClientRect()

		return {
			top: box.top + window.pageYOffset,
			right: box.right + window.pageXOffset,
			bottom: box.bottom + window.pageYOffset,
			left: box.left + window.pageXOffset,
		}
	}

	return ReactDOM.createPortal(
		<div
			onClick={() => {
				p.setOpen(false)
			}}
			className={`left-0 top-0 absolute w-full h-full bg-black bg-opacity-10 overflow-clip ${
				p.type === "dialog" ? "flex justify-center items-center" : ""
			}`}
		>
			<div
				ref={onWrapperNodeChange}
				className={
					p.wrapperClassNames
						? `absolute rounded bg-white ${p.wrapperClassNames}`
						: `absolute min-w-fit bg-white p-2 rounded`
				}
				style={
					p.type === "anchor"
						? {
								top: (position.bottom ?? 0) + "px",
								right: `${position.offsetRight}px`,
								...p.wrapperStyles,
						  }
						: p.wrapperStyles
				}
				onClick={(e) => e.stopPropagation()}
			>
				{p.children}
			</div>
		</div>,
		document.querySelector("#popup") as HTMLDivElement
	)
}
