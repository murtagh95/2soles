import { getAuth } from 'firebase/auth'
import { firebaseApp, iniciarAppCheck } from './firebase.ts'

// El panel de admin también manda su token de App Check a Firestore y Auth
void iniciarAppCheck()

export const auth = firebaseApp ? getAuth(firebaseApp) : null
