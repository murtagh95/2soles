import { useEffect, useState } from 'react'
import { firebaseApp } from './firebase.ts'
import { cargarFirestore } from './firestore.ts'

const COLECCION = 'ocupados'

// Días reservados, en tiempo real. Cada documento de "ocupados" tiene como ID la fecha YYYY-MM-DD.
export function useOcupados() {
  const [ocupados, setOcupados] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!firebaseApp) return
    let cancelado = false
    let desuscribir = () => {}
    cargarFirestore().then(({ db, collection, onSnapshot }) => {
      if (cancelado) return
      desuscribir = onSnapshot(
        collection(db, COLECCION),
        (snap) => {
          setOcupados(new Set(snap.docs.map((d) => d.id)))
          setError(null)
        },
        (e) => setError(e.message),
      )
    })
    return () => {
      cancelado = true
      desuscribir()
    }
  }, [])

  return { ocupados, error }
}

export async function marcarOcupado(clave: string, ocupado: boolean) {
  const { db, doc, setDoc, deleteDoc, serverTimestamp } = await cargarFirestore()
  const ref = doc(db, COLECCION, clave)
  if (ocupado) {
    await setDoc(ref, { creadoEn: serverTimestamp() })
  } else {
    await deleteDoc(ref)
  }
}
