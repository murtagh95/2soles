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

// App Check: Firestore solo acepta pedidos que vienen de este sitio (verificado con reCAPTCHA Enterprise).
// Sin VITE_RECAPTCHA_ENTERPRISE_KEY no hace nada y el sitio funciona igual que antes.
const claveRecaptcha = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_KEY
let appCheck: Promise<void> | null = null

declare global {
  // Token de depuración para usar App Check desde localhost (se registra en Firebase → App Check)
  var FIREBASE_APPCHECK_DEBUG_TOKEN: boolean | string | undefined
}

export function iniciarAppCheck() {
  if (!appCheck) {
    appCheck =
      firebaseApp && claveRecaptcha && typeof window !== 'undefined'
        ? import('firebase/app-check').then(({ initializeAppCheck, ReCaptchaEnterpriseProvider }) => {
            if (import.meta.env.DEV) self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true
            initializeAppCheck(firebaseApp!, {
              provider: new ReCaptchaEnterpriseProvider(claveRecaptcha),
              isTokenAutoRefreshEnabled: true,
            })
          })
        : Promise.resolve()
  }
  return appCheck
}
