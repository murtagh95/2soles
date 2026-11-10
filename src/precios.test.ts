import { describe, expect, test } from 'vitest'
import { claveFecha } from './fechas.ts'
import { calcularPrecio, formatearPrecio, formatearPrecioCorto, resumenReserva, type Precios } from './precios.ts'

const precios: Precios = {
  semana: 45000,
  finDeSemanaYFeriado: 70000,
  especiales: { '2026-12-25': 120000, '2026-10-20': 30000 },
}
const feriados = new Map([
  ['2026-12-25', 'Navidad'],
  ['2026-11-23', 'Día de la Soberanía Nacional'],
])

describe('calcularPrecio', () => {
  test('un día entre semana usa el precio de semana', () => {
    expect(calcularPrecio(new Date(2026, 9, 14), precios, feriados)).toBe(45000) // miércoles
  })

  test('sábado y domingo usan el precio de fin de semana', () => {
    expect(calcularPrecio(new Date(2026, 9, 17), precios, feriados)).toBe(70000) // sábado
    expect(calcularPrecio(new Date(2026, 9, 18), precios, feriados)).toBe(70000) // domingo
  })

  test('un feriado entre semana usa el precio de fin de semana y feriados', () => {
    expect(calcularPrecio(new Date(2026, 10, 23), precios, feriados)).toBe(70000) // lunes feriado
  })

  test('el precio especial de un día tiene prioridad sobre todo lo demás', () => {
    expect(calcularPrecio(new Date(2026, 11, 25), precios, feriados)).toBe(120000) // feriado con especial
    expect(calcularPrecio(new Date(2026, 9, 20), precios, feriados)).toBe(30000) // martes con especial más barato
  })

  test('un precio especial de 0 se respeta (no cae al precio normal)', () => {
    const conCero = { ...precios, especiales: { '2026-10-14': 0 } }
    expect(calcularPrecio(new Date(2026, 9, 14), conCero, feriados)).toBe(0)
  })
})

describe('claveFecha', () => {
  test('usa la fecha local con ceros a la izquierda', () => {
    expect(claveFecha(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(claveFecha(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31')
  })
})

describe('formatearPrecio', () => {
  test('usa el formato argentino', () => {
    expect(formatearPrecio(45000)).toBe('$45.000')
  })
})

describe('resumenReserva', () => {
  test('un solo día', () => {
    const { dias, total } = resumenReserva([new Date(2026, 9, 14)], precios, feriados)
    expect(dias).toHaveLength(1)
    expect(total).toBe(45000)
  })

  test('varios días sueltos: los ordena y suma semana, finde, feriado y especial', () => {
    const elegidos = [new Date(2026, 11, 25), new Date(2026, 9, 17), new Date(2026, 10, 23), new Date(2026, 9, 14)]
    const { dias, total } = resumenReserva(elegidos, precios, feriados)
    expect(dias.map((d) => d.clave)).toEqual(['2026-10-14', '2026-10-17', '2026-11-23', '2026-12-25'])
    expect(dias.map((d) => d.precio)).toEqual([45000, 70000, 70000, 120000])
    expect(dias[2].feriado).toBe('Día de la Soberanía Nacional')
    expect(total).toBe(305000)
  })

  test('sin días el total es 0', () => {
    expect(resumenReserva([], precios, feriados)).toEqual({ dias: [], total: 0 })
  })
})

describe('formatearPrecioCorto', () => {
  test('abrevia miles y millones', () => {
    expect(formatearPrecioCorto(100000)).toBe('100k')
    expect(formatearPrecioCorto(120000)).toBe('120k')
    expect(formatearPrecioCorto(97500)).toBe('97,5k')
    expect(formatearPrecioCorto(1500000)).toBe('1,5M')
    expect(formatearPrecioCorto(0)).toBe('0')
  })
})
