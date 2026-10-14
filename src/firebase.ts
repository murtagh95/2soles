import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Sin .env configurado el sitio funciona igual, pero sin disponibilidad real
export const firebaseConfigurado = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

export const firebaseApp = firebaseConfigurado ? initializeApp(firebaseConfig) : null
