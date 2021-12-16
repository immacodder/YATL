import { initializeApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { connectAuthEmulator, getAuth } from "firebase/auth"
import { connectStorageEmulator, getStorage } from "firebase/storage"

const firebaseConfig = {
	apiKey: "AIzaSyBypjQey8pYRukdFmSUGi7t8pDhNGoxyR8",
	authDomain: "yatl-56451.firebaseapp.com",
	projectId: "yatl-56451",
	storageBucket: "yatl-56451.appspot.com",
	messagingSenderId: "168115553737",
	appId: "1:168115553737:web:9bec4ea18768c8f9875418",
}

export const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

connectFirestoreEmulator(db, "localhost", 8080)
connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
connectStorageEmulator(storage, "localhost", 9199)
