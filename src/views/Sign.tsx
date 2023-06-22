import { Form, Formik } from "formik"
import { useNavigate } from "react-router-dom"
import * as yup from "yup"
import { InputValidate } from "../components/InputValidate"
import { auth, db, storage } from "../firebase"
import { User } from "../types"
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { FirestoreColl, StorageColl } from "../types"
import React, { useEffect, useState } from "react"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { Snackbar, SnackbarProps } from "../components/Snackbar"

interface Props {
	signIn: boolean
}

export function Sign(p: Props) {
	const navigate = useNavigate()
	const [userAvatar, setUserAvatar] = useState<File | null>(null)
	const [snackbarProps, setSnackbarProps] = useState<SnackbarProps | null>(null)
	const [shown, setShown] = useState(false)
	useEffect(() => {
		if (shown) setTimeout(() => setShown(false), 2000)
	}, [shown])

	const initialValues = {
		email: "",
		password: "",
		...(!p.signIn && {
			username: "",
			passwordRepeat: "",
		}),
	}
	const validationSchema = yup.object({
		email: yup.string().email().required(),
		password: yup.string().min(8).required(),
		...(!p.signIn && {
			username: yup.string().required().min(2),
			passwordRepeat: yup.string().min(8).required(),
		}),
	})

	const onSignIn = async ({ email, password }: typeof initialValues) => {
		if (!p.signIn) return
		try {
			await signInWithEmailAndPassword(auth, email, password)
			navigate(`/`)
		} catch (e) {
			setShown(true)
			setSnackbarProps({
				message: "Incorrect login information",
				variant: "Error",
			})
		}
	}
	const onSignUp = async (formValues: typeof initialValues) => {
		if (p.signIn) return
		const {
			user: { uid },
		} = await createUserWithEmailAndPassword(
			auth,
			formValues.email,
			formValues.password
		)

		let profileImageUrl: string | null = null

		if (userAvatar) {
			const profileImageRef = ref(
				storage,
				`${StorageColl.ProfileImages}/${uid}`
			)
			const res = await uploadBytes(profileImageRef, userAvatar)
			profileImageUrl = await getDownloadURL(profileImageRef)
		}

		const UserData: User = {
			createdAt: new Date().getTime(),
			email: formValues.email,
			id: uid,
			profileImageUrl,
			username: formValues.username!,
			preferences: {
				sortBy: {},
				groupBy: {},
			},
		}

		await setDoc(doc(db, `${FirestoreColl.Users}/${UserData.id}`), UserData)

		navigate(`/`)
	}

	const getTerm = (signIn = p.signIn) => (signIn ? "Sign in" : "Sign up")

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.length) setUserAvatar(e.target.files[0])
	}

	return (
		<Formik
			validationSchema={validationSchema}
			initialValues={initialValues}
			onSubmit={p.signIn ? onSignIn : onSignUp}
		>
			<Form>
				{snackbarProps && shown && <Snackbar {...snackbarProps} />}
				<div className="md:w-[500px] mx-auto mt-4 bg-white grid gap-4 p-4">
					<h2 className="text-2xl">{getTerm()}</h2>
					<InputValidate type="email" name="email" placeholder="Email" />
					<InputValidate
						type="password"
						name="password"
						placeholder="Password"
					/>
					{!p.signIn && (
						<>
							<InputValidate
								type="password"
								name="passwordRepeat"
								placeholder="Repeat password"
							/>
							<InputValidate name="username" placeholder="Username" />
							<label
								className="flex items-center justify-start"
								htmlFor="userAvatarInput"
							>
								{userAvatar && (
									<img
										className="w-[150px] h-[150px] rounded-full object-cover object-center"
										src={URL.createObjectURL(userAvatar)}
									/>
								)}
								<p className={`${userAvatar ? "ml-4" : ""} text-primary`}>
									Pick a profile image
								</p>
							</label>
							<input
								onChange={onInputChange}
								accept="image/*"
								className="hidden"
								id="userAvatarInput"
								type="file"
							/>
						</>
					)}
					<button className="button" type="submit">
						{getTerm()}
					</button>
					<hr />
					<button className="button bg-accent text-white" type="button">
						{getTerm()} with Google
					</button>
					<button
						onClick={() => navigate(p.signIn ? "/signup" : "/signin")}
						className="button bg-secondary text-white"
						type="button"
					>
						{getTerm(!p.signIn)} instead
					</button>
				</div>
			</Form>
		</Formik>
	)
}
