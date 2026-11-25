import { useEffect, useState } from 'react'
import { PRECIOS_POR_DEFECTO } from './config.ts'
import { claveFecha } from './fechas.ts'
import { firebaseApp } from './firebase.ts'
import { cargarFirestore } from './firestore.ts'

// Precios generales nuevos que empiezan a regir el día "desde" (YYYY-MM-DD), inclusive
export type CambioPrecios = { desde: string; semana: number; finDeSemanaYFeriado: number }

export type Precios = {
  semana: number
  finDeSemanaYFeriado: number
  // Precio fijo para un día puntual (ej. Navidad), por fecha YYYY-MM-DD
  especiales: Record<string, number>
  cambio?: CambioPrecios
}

const RUTA = ['config', 'precios'] as const

export function calcularPrecio(fecha: Date, precios: Precios, feriados: Map<string, string>) {
  const clave = claveFecha(fecha)
  if (clave in precios.especiales) return precios.especiales[clave]
  const base = precios.cambio && clave >= precios.cambio.desde ? precios.cambio : precios
  const dia = fecha.getDay()
  const esFinDeSemana = dia === 0 || dia === 6
  return esFinDeSemana || feriados.has(clave) ? base.finDeSemanaYFeriado : base.semana
}

// Cuando llega el día del cambio, sus precios pasan a ser los generales y el cambio deja de estar pendiente
export function preciosVigentes(precios: Precios, hoy: Date): Precios {
  const { cambio, ...resto } = precios
  if (!cambio || cambio.desde > claveFecha(hoy)) return precios
  return { ...resto, semana: cambio.semana, finDeSemanaYFeriado: cambio.finDeSemanaYFeriado }
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
          setPrecios(preciosVigentes({ ...PRECIOS_POR_DEFECTO, ...data, especiales: data?.especiales ?? {} }, new Date()))
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
  const { db, doc, getDoc, setDoc, deleteField } = await cargarFirestore()
  const ref = doc(db, ...RUTA)
  // Un cambio que ya empezó a regir taparía los precios que se están guardando: se borra
  const cambio = (await getDoc(ref)).data()?.cambio as CambioPrecios | undefined
  const vencido = cambio !== undefined && cambio.desde <= claveFecha(new Date())
  await setDoc(ref, { semana, finDeSemanaYFeriado, ...(vencido ? { cambio: deleteField() } : {}) }, { merge: true })
}

// cambio null quita el cambio programado
export async function guardarCambioPrecios(precios: Precios, cambio: CambioPrecios | null) {
  const { db, doc, setDoc, deleteField } = await cargarFirestore()
  await setDoc(
    doc(db, ...RUTA),
    {
      // Se incluyen los precios base para que el documento sea válido aunque todavía no exista
      semana: precios.semana,
      finDeSemanaYFeriado: precios.finDeSemanaYFeriado,
      cambio: cambio ?? deleteField(),
    },
    { merge: true },
  )
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
