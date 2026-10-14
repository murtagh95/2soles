import { getAuth } from 'firebase/auth'
import { firebaseApp } from './firebase.ts'

export const auth = firebaseApp ? getAuth(firebaseApp) : null
