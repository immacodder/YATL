import { useField } from "formik"

interface Props {
	name: string
	placeholder: string
	type?: "password" | "text" | "email"
	className?: string
	[key: string]: any
}

export function InputValidate({ placeholder, ...props }: Props) {
	const [field, meta] = useField(props.name)
	const error: string = meta.error && meta.touched ? meta.error : ""

	return (
		<div>
			<input
				placeholder={placeholder}
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
