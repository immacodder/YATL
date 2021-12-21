import Popup from "../components/Popup"

export default function Test() {
	return (
		<Popup type="dialog" anchor={null} setOpen={() => null}>
			<button className="button">Something here</button>
		</Popup>
	)
}
