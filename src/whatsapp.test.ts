import { describe, expect, test } from 'vitest'
import { resumenReserva } from './precios.ts'
import { linkWhatsApp, mensajeReserva } from './whatsapp.ts'

const precios = { semana: 100000, finDeSemanaYFeriado: 120000, especiales: {} }
const feriados = new Map([['2026-11-23', 'Día de la Soberanía Nacional']])
const base = { nombre: 'Ana', personas: '20', horario: '10 a 20 hs' }

describe('mensajeReserva', () => {
  test('con un día usa "Fecha" y pregunta por ese día', () => {
    const msg = mensajeReserva({ ...resumenReserva([new Date(2026, 10, 18)], precios, feriados), ...base })
    expect(msg).toContain('*Fecha:* miércoles, 18/11/2026 (de 10 a 20 hs)')
    expect(msg).toContain('*Precio estimado web:* $100.000')
    expect(msg).toContain('ese día?')
  })

  test('con varios días lista cada uno con su precio y el total', () => {
    const elegidos = [new Date(2026, 10, 23), new Date(2026, 10, 21), new Date(2026, 10, 18)]
    const msg = mensajeReserva({ ...resumenReserva(elegidos, precios, feriados), ...base })
    expect(msg).toContain('- miércoles, 18/11/2026: $100.000')
    expect(msg).toContain('- sábado, 21/11/2026: $120.000')
    expect(msg).toContain('- lunes, 23/11/2026 (Día de la Soberanía Nacional): $120.000')
    expect(msg).toContain('*Precio estimado web:* $340.000')
    expect(msg).toContain('esos días?')
  })

  test('sin cantidad de personas dice "No especificado"', () => {
    const msg = mensajeReserva({ ...resumenReserva([new Date(2026, 10, 18)], precios, feriados), ...base, personas: '' })
    expect(msg).toContain('*Personas:* No especificado')
  })
})

test('linkWhatsApp codifica el mensaje', () => {
  expect(linkWhatsApp('hola & chau')).toMatch(/^https:\/\/wa\.me\/\d+\?text=hola%20%26%20chau$/)
})
