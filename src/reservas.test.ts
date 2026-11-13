import { describe, expect, test } from 'vitest'
import { formDesdeReserva, normalizarTelefono, validarReserva, type FormReserva } from './reservas.ts'

const form: FormReserva = {
  nombre: '  Juan Pérez ',
  personas: '20',
  telefono: '+54 9 11 1234-5678',
  origen: 'instagram',
  origenOtro: '',
  precio: '140000',
  sena: '30000',
}
const dias = ['2026-12-31', '2026-12-30']

const error = (f: Partial<FormReserva>, d = dias) => {
  const r = validarReserva({ ...form, ...f }, d)
  return 'error' in r ? r.error : null
}

describe('validarReserva', () => {
  test('un formulario completo da los datos listos para guardar, con los días ordenados', () => {
    expect(validarReserva(form, dias)).toEqual({
      datos: {
        nombre: 'Juan Pérez',
        personas: 20,
        sena: 30000,
        origen: 'instagram',
        telefono: '+5491112345678',
        precio: 140000,
        dias: ['2026-12-30', '2026-12-31'],
      },
    })
  })

  test('sin seña se puede dejar vacío y queda en 0', () => {
    const r = validarReserva({ ...form, sena: '' }, dias)
    expect('datos' in r && r.datos.sena).toBe(0)
  })

  test('el texto de "Otro" solo se guarda si se eligió Otro', () => {
    const conOtro = validarReserva({ ...form, origen: 'otro', origenOtro: ' Un cartel ' }, dias)
    expect('datos' in conOtro && conOtro.datos.origenOtro).toBe('Un cartel')
    const sinOtro = validarReserva({ ...form, origenOtro: 'Un cartel' }, dias)
    expect('datos' in sinOtro && 'origenOtro' in sinOtro.datos).toBe(false)
  })

  test('pide días, nombre, teléfono y cómo nos conoció', () => {
    expect(error({}, [])).toMatch(/al menos un día/)
    expect(error({ nombre: '   ' })).toMatch(/nombre/)
    expect(error({ telefono: '' })).toMatch(/teléfono/)
    expect(error({ telefono: 'llamar a la tarde' })).toMatch(/teléfono/)
    expect(error({ origen: '' })).toMatch(/cómo nos conoció/)
    expect(error({ origen: 'otro', origenOtro: '' })).toMatch(/cómo nos conoció/)
  })

  test('personas, precio y seña tienen que ser enteros válidos', () => {
    expect(error({ personas: '0' })).toMatch(/personas/)
    expect(error({ personas: '2.5' })).toMatch(/personas/)
    expect(error({ personas: '' })).toMatch(/personas/)
    expect(error({ precio: '' })).toMatch(/precio/)
    expect(error({ precio: '140.000' })).toMatch(/precio/)
    expect(error({ sena: '-1' })).toMatch(/seña/)
  })

  test('la seña no puede superar el precio', () => {
    expect(error({ sena: '150000' })).toMatch(/mayor que el precio/)
    expect(error({ sena: '140000' })).toBeNull()
  })
})

describe('normalizarTelefono', () => {
  test('deja solo los números y un + inicial', () => {
    expect(normalizarTelefono('5492617184235')).toBe('5492617184235')
    expect(normalizarTelefono(' 261 718-4235 ')).toBe('2617184235')
    expect(normalizarTelefono('+54 9 (261) 718-4235')).toBe('+5492617184235')
  })

  test('saca los caracteres invisibles que agregan WhatsApp y los contactos', () => {
    expect(normalizarTelefono('\u202a+54\u00a09\u00a0261\u2011718\u20114235\u202c')).toBe('+5492617184235')
  })

  test('un + en el medio no queda', () => {
    expect(normalizarTelefono('54+9261')).toBe('549261')
  })
})

describe('formDesdeReserva', () => {
  test('una reserva guardada vuelve al formulario y se valida igual', () => {
    const r = validarReserva({ ...form, origen: 'otro', origenOtro: 'Un cartel', sena: '' }, dias)
    if (!('datos' in r)) throw new Error(r.error)
    const vuelta = formDesdeReserva({ ...r.datos, id: 'r1' })
    expect(vuelta.sena).toBe('')
    expect(validarReserva(vuelta, r.datos.dias)).toEqual(r)
  })
})
