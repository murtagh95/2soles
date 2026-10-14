import { useEffect, useState } from 'react'

type Feriado = { fecha: string; nombre: string }

// API pública y gratuita con los feriados nacionales (incluye puentes y trasladables)
const API_FERIADOS = 'https://api.argentinadatos.com/v1/feriados'

let cache: Promise<Map<string, string>> | null = null

// Se piden el año actual y el siguiente, que es el rango en el que se reserva
function cargarFeriados() {
  if (!cache) {
    const anio = new Date().getFullYear()
    cache = Promise.all(
      [anio, anio + 1].map((a) =>
        fetch(`${API_FERIADOS}/${a}`)
          .then((r) => (r.ok ? (r.json() as Promise<Feriado[]>) : []))
          .catch(() => []),
      ),
    ).then((anios) => new Map(anios.flat().map((f) => [f.fecha, f.nombre])))
  }
  return cache
}

// Feriados por fecha YYYY-MM-DD → nombre. Si la API falla, el calendario sigue andando sin feriados.
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
