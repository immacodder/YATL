import { useField } from "formik"

interface Props
	extends React.DetailedHTMLProps<
		React.InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	> {
	name: string
}

export function InputValidate({ ...props }: Props) {
	const [field, meta] = useField(props.name)
	const error: string = meta.error && meta.touched ? meta.error : ""

	return (
		<div>
			<input
				{...field}
				{...props}
				className={`border-2 p-2 rounded w-full ${
					error ? "border-red-500" : ""
				} ${props.className}`}
			/>
			{error && <div className="text-red-500">{error}</div>}
		</div>
	)
}
