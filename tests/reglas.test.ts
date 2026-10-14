// Tests de firestore.rules contra el emulador local (nunca toca la base real).
// Correr con: pnpm test:reglas
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, getDocs, collection, setDoc, serverTimestamp } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, test } from 'vitest'

const ADMIN_UID = 'admin-uid'
const OTRO_UID = 'usuario-comun'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-dos-soles',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

afterAll(() => env.cleanup())

// Cada test arranca con la base vacía, salvo el admin dado de alta y un día ya reservado
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'admins', ADMIN_UID), { nombre: 'Admin' })
    await setDoc(doc(db, 'ocupados', '2026-12-24'), { creadoEn: serverTimestamp() })
    await setDoc(doc(db, 'config', 'precios'), { semana: 45000, finDeSemanaYFeriado: 70000, especiales: {} })
  })
})

const anonimo = () => env.unauthenticatedContext().firestore()
const usuarioComun = () => env.authenticatedContext(OTRO_UID).firestore()
const admin = () => env.authenticatedContext(ADMIN_UID).firestore()

describe('ocupados', () => {
  test('cualquiera puede ver los días ocupados', async () => {
    await assertSucceeds(getDocs(collection(anonimo(), 'ocupados')))
  })

  test('sin login no se puede reservar ni liberar un día', async () => {
    await assertFails(setDoc(doc(anonimo(), 'ocupados', '2026-12-31'), { creadoEn: serverTimestamp() }))
    await assertFails(deleteDoc(doc(anonimo(), 'ocupados', '2026-12-24')))
  })

  test('un usuario logueado que no es admin no puede reservar ni liberar', async () => {
    await assertFails(setDoc(doc(usuarioComun(), 'ocupados', '2026-12-31'), { creadoEn: serverTimestamp() }))
    await assertFails(deleteDoc(doc(usuarioComun(), 'ocupados', '2026-12-24')))
  })

  test('el admin puede reservar y liberar un día', async () => {
    await assertSucceeds(setDoc(doc(admin(), 'ocupados', '2026-12-31'), { creadoEn: serverTimestamp() }))
    await assertSucceeds(deleteDoc(doc(admin(), 'ocupados', '2026-12-24')))
  })

  test('el admin no puede usar un ID que no sea una fecha YYYY-MM-DD', async () => {
    await assertFails(setDoc(doc(admin(), 'ocupados', 'navidad'), { creadoEn: serverTimestamp() }))
    await assertFails(setDoc(doc(admin(), 'ocupados', '2026-12-31-x'), { creadoEn: serverTimestamp() }))
  })

  test('el admin no puede guardar otros datos en un día (ej. datos personales)', async () => {
    await assertFails(
      setDoc(doc(admin(), 'ocupados', '2026-12-31'), { creadoEn: serverTimestamp(), nombre: 'Juan Pérez' }),
    )
  })
})

describe('config/precios', () => {
  const preciosValidos = { semana: 50000, finDeSemanaYFeriado: 80000, especiales: { '2026-12-25': 120000 } }

  test('cualquiera puede ver los precios', async () => {
    await assertSucceeds(getDoc(doc(anonimo(), 'config', 'precios')))
  })

  test('sin login no se pueden cambiar los precios', async () => {
    await assertFails(setDoc(doc(anonimo(), 'config', 'precios'), preciosValidos))
    await assertFails(deleteDoc(doc(anonimo(), 'config', 'precios')))
  })

  test('un usuario logueado que no es admin no puede cambiar los precios', async () => {
    await assertFails(setDoc(doc(usuarioComun(), 'config', 'precios'), preciosValidos))
  })

  test('el admin puede cambiar los precios', async () => {
    await assertSucceeds(setDoc(doc(admin(), 'config', 'precios'), preciosValidos))
  })

  test('el admin no puede guardar precios negativos, con decimales o como texto', async () => {
    const ref = doc(admin(), 'config', 'precios')
    await assertFails(setDoc(ref, { ...preciosValidos, semana: -1 }))
    await assertFails(setDoc(ref, { ...preciosValidos, finDeSemanaYFeriado: 70000.5 }))
    await assertFails(setDoc(ref, { ...preciosValidos, semana: '45000' }))
  })

  test('el admin no puede guardar campos desconocidos ni especiales que no sean un mapa', async () => {
    const ref = doc(admin(), 'config', 'precios')
    await assertFails(setDoc(ref, { ...preciosValidos, descuento: 10 }))
    await assertFails(setDoc(ref, { ...preciosValidos, especiales: 'gratis' }))
  })

  test('nadie puede escribir otros documentos de config', async () => {
    await assertFails(setDoc(doc(admin(), 'config', 'otro'), { valor: 1 }))
    await assertFails(getDoc(doc(anonimo(), 'config', 'otro')))
  })
})

describe('admins', () => {
  test('nadie puede ver la lista de admins, ni siquiera un admin', async () => {
    await assertFails(getDocs(collection(anonimo(), 'admins')))
    await assertFails(getDoc(doc(usuarioComun(), 'admins', OTRO_UID)))
    await assertFails(getDoc(doc(admin(), 'admins', ADMIN_UID)))
  })

  test('nadie puede darse de alta como admin desde la app', async () => {
    await assertFails(setDoc(doc(usuarioComun(), 'admins', OTRO_UID), { nombre: 'Intruso' }))
    await assertFails(setDoc(doc(admin(), 'admins', OTRO_UID), { nombre: 'Otro' }))
  })
})

describe('resto de la base', () => {
  test('cualquier otra colección está cerrada', async () => {
    await assertFails(getDocs(collection(anonimo(), 'reservas')))
    await assertFails(setDoc(doc(admin(), 'reservas', 'x'), { nombre: 'Juan' }))
  })
})
