import React, { CSSProperties, useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import { getScrollHeight } from "../helpers/getScrollHeight"
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
		distanceFromTop: null as number | null,
	})
	const wrapperRef = useRef<HTMLDivElement>(null)
	const { width: windowWidth } = useWindowResize()

	useEffect(() => {
		if (p.anchor && wrapperRef.current) {
			const {
				right: anchorRight,
				bottom: anchorBottom,
				top: anchorTop,
			} = getCoords(p.anchor)
			const { bottom: wrapperBottom, height: wrapperHeight } =
				wrapperRef.current.getBoundingClientRect()

			let adjustedBottom = anchorBottom
			if (innerHeight - wrapperBottom < 0) {
				// means that wrapper is outside the screen
				adjustedBottom = anchorTop - wrapperHeight
			}

			let offsetFromRight = innerWidth - anchorRight
			const wrapperLeft = wrapperRef.current?.getBoundingClientRect().left ?? 0
			if (wrapperLeft < 0) {
				offsetFromRight = offsetFromRight - (Math.abs(wrapperLeft) + 16)
			}

			setPosition({
				offsetRight: offsetFromRight,
				distanceFromTop: adjustedBottom,
			})
		}
		// If I don't disable it, it will not allow me to use wrapperRef.current, which I need to use in this instance
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [p, windowWidth, wrapperRef, wrapperRef.current])

	function getCoords(elem: HTMLElement) {
		const box = elem.getBoundingClientRect()

		return {
			top: box.top + pageYOffset,
			right: box.right + pageXOffset,
			bottom: box.bottom + pageYOffset,
			left: box.left + pageXOffset,
		}
	}

	let wrapperStyles: CSSProperties
	if (p.type === "anchor")
		wrapperStyles = {
			top: (position.distanceFromTop ?? 0) + "px",
			right: `${position.offsetRight}px`,
			...p.wrapperStyles,
		}
	else if (p.type === "dialog") {
		wrapperStyles = {
			position: "fixed",
			top: `${
				innerHeight -
				innerHeight / 2 -
				(wrapperRef?.current?.getBoundingClientRect().height ?? 120) / 2
			}px`,
			...p.wrapperStyles,
		}
	} else throw new Error("not implemented")

	return ReactDOM.createPortal(
		<div
			onClick={() => {
				p.setOpen(false)
			}}
			className={`left-0 top-0 absolute w-full h-full bg-black bg-opacity-10 overflow-clip ${
				p.type === "dialog" ? "flex justify-center items-center" : ""
			}`}
			style={{ height: `${getScrollHeight()}px` }}
		>
			<div
				ref={wrapperRef}
				className={
					p.wrapperClassNames
						? `absolute rounded bg-white ${p.wrapperClassNames}`
						: `absolute min-w-fit bg-white p-2 rounded`
				}
				style={wrapperStyles}
				onClick={(e) => e.stopPropagation()}
			>
				{p.children}
			</div>
		</div>,
		document.querySelector("#popup") as HTMLDivElement
	)
}
