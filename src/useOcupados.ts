import { useEffect, useMemo, useState } from 'react'
import { claveFecha } from './fechas.ts'
import { firebaseApp } from './firebase.ts'
import { cargarFirestore } from './firestore.ts'

const COLECCION = 'ocupados'

// Días reservados de hoy en adelante, en tiempo real. Cada documento de "ocupados" tiene como ID la fecha YYYY-MM-DD.
// Los días pasados no se leen: así cada visita no paga lecturas de toda la historia de reservas.
// reservaDe: fecha → ID de su reserva (null en días marcados antes de que las reservas guardaran datos)
export function useOcupados() {
  const [reservaDe, setReservaDe] = useState<Map<string, string | null>>(new Map())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!firebaseApp) return
    let cancelado = false
    let desuscribir = () => {}
    cargarFirestore().then(({ db, collection, documentId, onSnapshot, query, where }) => {
      if (cancelado) return
      desuscribir = onSnapshot(
        query(collection(db, COLECCION), where(documentId(), '>=', claveFecha(new Date()))),
        (snap) => {
          setReservaDe(new Map(snap.docs.map((d) => [d.id, (d.data().reservaId as string | undefined) ?? null])))
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

  const ocupados = useMemo(() => new Set(reservaDe.keys()), [reservaDe])
  return { ocupados, reservaDe, error }
}
