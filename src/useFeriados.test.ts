import { describe, expect, test } from 'vitest'
import { feriadosDelAnio } from './useFeriados.ts'

const respuesta = (cuerpo: unknown, ok = true) => (async () => ({ ok, json: async () => cuerpo })) as unknown as typeof fetch

describe('feriadosDelAnio', () => {
  test('usa lo que devuelve la API', async () => {
    const lista = await feriadosDelAnio(2026, respuesta([{ fecha: '2026-12-25', nombre: 'Navidad (API)' }]))
    expect(lista).toEqual([{ fecha: '2026-12-25', nombre: 'Navidad (API)' }])
  })

  test('si la API no responde, Navidad sigue siendo feriado con la copia guardada', async () => {
    const caida = (async () => {
      throw new Error('sin conexión')
    }) as unknown as typeof fetch
    const lista = await feriadosDelAnio(2026, caida)
    expect(lista.map((f) => f.fecha)).toContain('2026-12-25')
    expect(lista.every((f) => f.fecha.startsWith('2026-'))).toBe(true)
  })

  test('si la API responde error o vacío, también usa la copia guardada', async () => {
    expect((await feriadosDelAnio(2027, respuesta(null, false))).length).toBeGreaterThan(0)
    expect((await feriadosDelAnio(2027, respuesta([]))).length).toBeGreaterThan(0)
  })
})
