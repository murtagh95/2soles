import { firebaseApp } from './firebase.ts'

// Firestore pesa ~500 KB: se carga aparte para no demorar el primer render de la página
export async function cargarFirestore() {
  if (!firebaseApp) throw new Error('Firebase no está configurado')
  const firestore = await import('firebase/firestore')
  const databaseId = import.meta.env.VITE_FIRESTORE_DATABASE_ID || '(default)'
  return { ...firestore, db: firestore.getFirestore(firebaseApp, databaseId) }
}
