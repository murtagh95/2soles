// Chequeo contra el Firebase real: confirma que lo publicado en la consola sigue protegido.
// Detecta si alguien cambió las reglas o reabrió el registro de cuentas desde la consola,
// cosas que los tests de firestore.rules (emulador) no pueden ver.
// Correr con: pnpm test:prod  (usa las credenciales de .env.local)
import { loadEnv } from 'vite'
import { describe, expect, test } from 'vitest'

const env = loadEnv('production', process.cwd(), 'VITE_')
const API_KEY = env.VITE_FIREBASE_API_KEY
const PROYECTO = env.VITE_FIREBASE_PROJECT_ID
const BASE = `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents`

// Un día lejano que nunca debería existir: si alguna escritura de prueba llegara a pasar, no pisa datos reales
const DIA_PRUEBA = '2099-01-01'

async function firestore(metodo: string, ruta: string, cuerpo?: unknown) {
  const separador = ruta.includes('?') ? '&' : '?'
  const res = await fetch(`${BASE}/${ruta}${separador}key=${API_KEY}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  return res.status
}

describe.skipIf(!API_KEY || !PROYECTO)(`Firebase real (${PROYECTO})`, () => {
  test('se pueden leer los días ocupados y los precios', async () => {
    expect(await firestore('GET', 'ocupados')).toBe(200)
    // 404 = todavía no se guardaron precios desde el admin; igual significa que la lectura está permitida
    expect([200, 404]).toContain(await firestore('GET', 'config/precios'))
  })

  test('sin login no se puede reservar un día', async () => {
    expect(await firestore('POST', `ocupados?documentId=${DIA_PRUEBA}`, { fields: {} })).toBe(403)
  })

  test('sin login no se pueden cambiar los precios', async () => {
    const cuerpo = { fields: { semana: { integerValue: '1' } } }
    expect(await firestore('PATCH', 'config/precios?updateMask.fieldPaths=semana', cuerpo)).toBe(403)
  })

  test('sin login no se puede ver la lista de admins', async () => {
    expect(await firestore('GET', 'admins')).toBe(403)
  })

  test('el registro de cuentas nuevas está deshabilitado', async () => {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-registro-${Date.now()}@ejemplo.invalid`,
        password: crypto.randomUUID(),
        returnSecureToken: true,
      }),
    })
    const data = (await res.json()) as { idToken?: string; error?: { message: string } }

    // Si el registro estuviera abierto, se borra la cuenta recién creada antes de fallar el test
    if (data.idToken) {
      await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: data.idToken }),
      })
    }
    expect(data.idToken, 'El registro está abierto: desactivalo en Authentication → Configuración').toBeUndefined()
    expect(data.error?.message).toMatch(/ADMIN_ONLY_OPERATION|OPERATION_NOT_ALLOWED/)
  })
})
