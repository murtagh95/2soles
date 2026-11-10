import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { claveFecha, proximoLibre } from './fechas.ts'

describe('proximoLibre', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 10, 12)) // martes 10 de noviembre de 2026
  })
  afterEach(() => vi.useRealTimers())

  test('devuelve el día siguiente si está libre', () => {
    expect(claveFecha(proximoLibre(new Date(2026, 10, 14), new Set())!)).toBe('2026-11-15')
  })

  test('saltea los días ocupados', () => {
    const ocupados = new Set(['2026-11-15', '2026-11-16'])
    expect(claveFecha(proximoLibre(new Date(2026, 10, 14), ocupados)!)).toBe('2026-11-17')
  })

  test('saltea los días pasados', () => {
    expect(claveFecha(proximoLibre(new Date(2026, 10, 1), new Set())!)).toBe('2026-11-10')
  })

  test('devuelve null si no hay días libres en el rango', () => {
    const ocupados = new Set(['2026-11-15', '2026-11-16'])
    expect(proximoLibre(new Date(2026, 10, 14), ocupados, 2)).toBeNull()
  })
})
