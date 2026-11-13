// Chequeo contra el Firebase real: confirma que lo publicado en la consola sigue protegido.
// Detecta si alguien cambió las reglas o reabrió el registro de cuentas desde la consola,
// cosas que los tests de firestore.rules (emulador) no pueden ver.
// Correr con: pnpm test:prod  (usa las credenciales de .env.local)
import { loadEnv } from 'vite'
import { describe, expect, test } from 'vitest'

const env = loadEnv('production', process.cwd(), '')
const API_KEY = env.VITE_FIREBASE_API_KEY
const PROYECTO = env.VITE_FIREBASE_PROJECT_ID
// Con App Check exigido en Firestore, un pedido sin token de App Check (como los de este test) se rechaza
const APP_CHECK_EXIGIDO = env.APP_CHECK_EXIGIDO === '1'
// La API key está restringida a este sitio: los pedidos se presentan como si vinieran de él
const SITIO = 'https://2soles.mysavia.app/'
const IDENTITY = 'https://identitytoolkit.googleapis.com/v1/accounts'
const BASE = `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents`

// Un día lejano que nunca debería existir: si alguna escritura de prueba llegara a pasar, no pisa datos reales
const DIA_PRUEBA = '2099-01-01'

async function firestore(metodo: string, ruta: string, cuerpo?: unknown) {
  const separador = ruta.includes('?') ? '&' : '?'
  const res = await fetch(`${BASE}/${ruta}${separador}key=${API_KEY}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Referer: SITIO },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  })
  return res.status
}

describe.skipIf(!API_KEY || !PROYECTO)(`Firebase real (${PROYECTO})`, () => {
  test.skipIf(APP_CHECK_EXIGIDO)('se pueden leer los días ocupados y los precios', async () => {
    expect(await firestore('GET', 'ocupados')).toBe(200)
    // 404 = todavía no se guardaron precios desde el admin; igual significa que la lectura está permitida
    expect([200, 404]).toContain(await firestore('GET', 'config/precios'))
  })

  test.runIf(APP_CHECK_EXIGIDO)('App Check exigido: sin token del sitio no se puede leer', async () => {
    expect([401, 403]).toContain(await firestore('GET', 'ocupados'))
  })

  test('sin login no se puede reservar un día', async () => {
    expect(await firestore('POST', `ocupados?documentId=${DIA_PRUEBA}`, { fields: {} })).toBe(403)
  })

  test('sin login no se pueden cambiar los precios', async () => {
    const cuerpo = { fields: { semana: { integerValue: '1' } } }
    expect(await firestore('PATCH', 'config/precios?updateMask.fieldPaths=semana', cuerpo)).toBe(403)
  })

  test('sin login no se pueden ver los datos de las reservas', async () => {
    expect(await firestore('GET', 'reservas')).toBe(403)
  })

  test('sin login no se puede ver la lista de admins', async () => {
    expect(await firestore('GET', 'admins')).toBe(403)
  })

  test('el registro de cuentas nuevas está deshabilitado', async () => {
    const res = await fetch(`${IDENTITY}:signUp?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Referer: SITIO },
      body: JSON.stringify({
        email: `test-registro-${Date.now()}@ejemplo.invalid`,
        password: crypto.randomUUID(),
        returnSecureToken: true,
      }),
    })
    const data = (await res.json()) as { idToken?: string; error?: { message: string } }

    // Si el registro estuviera abierto, se borra la cuenta recién creada antes de fallar el test
    if (data.idToken) {
      await fetch(`${IDENTITY}:delete?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Referer: SITIO },
        body: JSON.stringify({ idToken: data.idToken }),
      })
    }
    expect(data.idToken, 'El registro está abierto: desactivalo en Authentication → Configuración').toBeUndefined()
    expect(data.error?.message).toMatch(/ADMIN_ONLY_OPERATION|OPERATION_NOT_ALLOWED/)
  })

  test('la API key solo funciona desde el sitio (restricción en Google Cloud)', async () => {
    const pedir = (referer?: string) =>
      fetch(`${IDENTITY}:lookup?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(referer ? { Referer: referer } : {}) },
        body: JSON.stringify({ idToken: 'x' }),
      }).then((r) => r.json() as Promise<{ error?: { message: string } }>)

    expect((await pedir('https://otro-sitio.example/')).error?.message).toMatch(/are blocked/)
    expect((await pedir()).error?.message).toMatch(/are blocked/)
    // Desde el sitio la clave pasa: falla recién por el token inventado
    expect((await pedir(SITIO)).error?.message).toBe('INVALID_ID_TOKEN')
  })
})
