import { useEffect, useState } from 'react'
import respaldo from './feriadosRespaldo.json'

type Feriado = { fecha: string; nombre: string }

// API pública y gratuita con los feriados nacionales (incluye puentes y trasladables)
const API_FERIADOS = 'https://api.argentinadatos.com/v1/feriados'

// Si la API falla o no tiene el año, se usa la copia guardada en feriadosRespaldo.json
// (para no cotizar un feriado como día de semana). Actualizarla una vez por año.
export async function feriadosDelAnio(anio: number, pedir: typeof fetch = fetch): Promise<Feriado[]> {
  const guardados = (respaldo as Feriado[]).filter((f) => f.fecha.startsWith(`${anio}-`))
  try {
    const r = await pedir(`${API_FERIADOS}/${anio}`)
    const lista = r.ok ? ((await r.json()) as Feriado[]) : []
    return lista.length > 0 ? lista : guardados
  } catch {
    return guardados
  }
}

let cache: Promise<Map<string, string>> | null = null

// Se piden el año actual y el siguiente, que es el rango en el que se reserva
function cargarFeriados() {
  if (!cache) {
    const anio = new Date().getFullYear()
    cache = Promise.all([anio, anio + 1].map((a) => feriadosDelAnio(a))).then(
      (anios) => new Map(anios.flat().map((f) => [f.fecha, f.nombre])),
    )
  }
  return cache
}

// Feriados por fecha YYYY-MM-DD → nombre
export function useFeriados() {
  const [feriados, setFeriados] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    let cancelado = false
    cargarFeriados().then((f) => {
      if (!cancelado) setFeriados(f)
    })
    return () => {
      cancelado = true
    }
  }, [])

  return feriados
}
