import { useEffect, useState } from 'react'
import { PRECIOS_POR_DEFECTO } from './config.ts'
import { claveFecha } from './fechas.ts'
import { firebaseApp } from './firebase.ts'
import { cargarFirestore } from './firestore.ts'

export type Precios = {
  semana: number
  finDeSemanaYFeriado: number
  // Precio fijo para un día puntual (ej. Navidad), por fecha YYYY-MM-DD
  especiales: Record<string, number>
}

const RUTA = ['config', 'precios'] as const

export function calcularPrecio(fecha: Date, precios: Precios, feriados: Map<string, string>) {
  const clave = claveFecha(fecha)
  if (clave in precios.especiales) return precios.especiales[clave]
  const dia = fecha.getDay()
  const esFinDeSemana = dia === 0 || dia === 6
  return esFinDeSemana || feriados.has(clave) ? precios.finDeSemanaYFeriado : precios.semana
}

// Texto de un input → monto entero no negativo, o null si no es válido
export function leerPrecio(valor: string) {
  const precio = Number(valor)
  return valor.trim() !== '' && Number.isInteger(precio) && precio >= 0 ? precio : null
}

export function formatearPrecio(precio: number) {
  return `$${precio.toLocaleString('es-AR')}`
}

// Precios en tiempo real desde config/precios. Si el documento no existe, se usan los de config.ts.
export function usePrecios() {
  const [precios, setPrecios] = useState<Precios>(PRECIOS_POR_DEFECTO)
  const [cargado, setCargado] = useState(!firebaseApp)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!firebaseApp) return
    let cancelado = false
    let desuscribir = () => {}
    cargarFirestore().then(({ db, doc, onSnapshot }) => {
      if (cancelado) return
      desuscribir = onSnapshot(
        doc(db, ...RUTA),
        (snap) => {
          const data = snap.data() as Partial<Precios> | undefined
          setPrecios({ ...PRECIOS_POR_DEFECTO, ...data, especiales: data?.especiales ?? {} })
          setCargado(true)
          setError(null)
        },
        (e) => {
          setError(e.message)
          setCargado(true)
        },
      )
    })
    return () => {
      cancelado = true
      desuscribir()
    }
  }, [])

  return { precios, cargado, error }
}

export async function guardarPreciosBase(semana: number, finDeSemanaYFeriado: number) {
  const { db, doc, setDoc } = await cargarFirestore()
  await setDoc(doc(db, ...RUTA), { semana, finDeSemanaYFeriado }, { merge: true })
}

// precio null quita el precio especial y el día vuelve al precio normal
export async function guardarPrecioEspecial(precios: Precios, clave: string, precio: number | null) {
  const { db, doc, setDoc, deleteField } = await cargarFirestore()
  await setDoc(
    doc(db, ...RUTA),
    {
      // Se incluyen los precios base para que el documento sea válido aunque todavía no exista
      semana: precios.semana,
      finDeSemanaYFeriado: precios.finDeSemanaYFeriado,
      especiales: { [clave]: precio ?? deleteField() },
    },
    { merge: true },
  )
}

export type DiaReserva = { fecha: Date; clave: string; precio: number; feriado?: string }

// Días elegidos (en cualquier orden) → cada uno con su precio, ordenados por fecha, y el total
export function resumenReserva(fechas: Date[], precios: Precios, feriados: Map<string, string>) {
  const dias: DiaReserva[] = [...fechas]
    .sort((a, b) => a.getTime() - b.getTime())
    .map((fecha) => {
      const clave = claveFecha(fecha)
      return { fecha, clave, precio: calcularPrecio(fecha, precios, feriados), feriado: feriados.get(clave) }
    })
  return { dias, total: dias.reduce((suma, d) => suma + d.precio, 0) }
}

// 100000 → "100k", 1500000 → "1,5M": entra debajo del número del día en el calendario
export function formatearPrecioCorto(precio: number) {
  if (precio >= 1_000_000) return `${(precio / 1_000_000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}M`
  if (precio >= 1000) return `${(precio / 1000).toLocaleString('es-AR', { maximumFractionDigits: 1 })}k`
  return String(precio)
}
