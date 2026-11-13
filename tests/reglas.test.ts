// Tests de firestore.rules contra el emulador local (nunca toca la base real).
// Correr con: pnpm test:reglas
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore'
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

// Reserva válida (como la guarda el admin) para los días pedidos
const reserva = (dias: string[]) => ({
  nombre: 'Juan Pérez',
  personas: 20,
  sena: 30000,
  origen: 'instagram',
  telefono: '+54 9 11 1234-5678',
  precio: 70000,
  dias,
  creadoEn: serverTimestamp(),
  actualizadoEn: serverTimestamp(),
})

// Lo que hace la app: guarda la reserva y marca sus días, todo junto
function reservarConDatos(db: Firestore, id: string, dias: string[]) {
  const lote = writeBatch(db)
  lote.set(doc(db, 'reservas', id), reserva(dias))
  for (const dia of dias) lote.set(doc(db, 'ocupados', dia), { creadoEn: serverTimestamp(), reservaId: id })
  return lote.commit()
}

describe('ocupados', () => {
  test('cualquiera puede ver los días ocupados', async () => {
    await assertSucceeds(getDocs(collection(anonimo(), 'ocupados')))
  })

  test('cualquiera puede pedir solo los días de hoy en adelante (lo que usa la web)', async () => {
    const desdeHoy = query(collection(anonimo(), 'ocupados'), where(documentId(), '>=', '2026-01-01'))
    await assertSucceeds(getDocs(desdeHoy))
  })

  test('sin login no se puede reservar ni liberar un día', async () => {
    await assertFails(setDoc(doc(anonimo(), 'ocupados', '2026-12-31'), { creadoEn: serverTimestamp() }))
    await assertFails(deleteDoc(doc(anonimo(), 'ocupados', '2026-12-24')))
  })

  test('un usuario logueado que no es admin no puede reservar ni liberar', async () => {
    await assertFails(setDoc(doc(usuarioComun(), 'ocupados', '2026-12-31'), { creadoEn: serverTimestamp() }))
    await assertFails(deleteDoc(doc(usuarioComun(), 'ocupados', '2026-12-24')))
  })

  test('el admin puede reservar días junto con su reserva y liberarlos', async () => {
    await assertSucceeds(reservarConDatos(admin(), 'r1', ['2026-12-30', '2026-12-31']))
    await assertSucceeds(deleteDoc(doc(admin(), 'ocupados', '2026-12-31')))
    await assertSucceeds(deleteDoc(doc(admin(), 'ocupados', '2026-12-24')))
  })

  test('el admin puede asignarle una reserva a un día marcado antes (sin datos)', async () => {
    await assertSucceeds(reservarConDatos(admin(), 'r1', ['2026-12-24']))
  })

  test('un día no puede apuntar a una reserva que no existe o que no lo incluye', async () => {
    await assertFails(setDoc(doc(admin(), 'ocupados', '2026-12-31'), { creadoEn: serverTimestamp(), reservaId: 'no-existe' }))
    await assertSucceeds(reservarConDatos(admin(), 'r1', ['2026-12-30']))
    await assertFails(setDoc(doc(admin(), 'ocupados', '2026-12-31'), { creadoEn: serverTimestamp(), reservaId: 'r1' }))
  })

  test('un día nuevo tiene que tener su reserva', async () => {
    await assertFails(setDoc(doc(admin(), 'ocupados', '2026-12-31'), { creadoEn: serverTimestamp() }))
  })

  test('el admin no puede usar un ID que no sea una fecha YYYY-MM-DD', async () => {
    const db = admin()
    await assertSucceeds(setDoc(doc(db, 'reservas', 'r1'), reserva(['navidad', '2026-12-31-x'])))
    await assertFails(setDoc(doc(db, 'ocupados', 'navidad'), { creadoEn: serverTimestamp(), reservaId: 'r1' }))
    await assertFails(setDoc(doc(db, 'ocupados', '2026-12-31-x'), { creadoEn: serverTimestamp(), reservaId: 'r1' }))
  })

  test('el admin no puede guardar otros datos en un día (ej. datos personales)', async () => {
    const db = admin()
    await assertSucceeds(setDoc(doc(db, 'reservas', 'r1'), reserva(['2026-12-31'])))
    await assertFails(
      setDoc(doc(db, 'ocupados', '2026-12-31'), { creadoEn: serverTimestamp(), reservaId: 'r1', nombre: 'Juan Pérez' }),
    )
  })
})

describe('reservas', () => {
  test('sin login nadie puede ver, crear ni borrar reservas', async () => {
    await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'reservas', 'r1'), reserva(['2026-12-30'])))
    await assertFails(getDocs(collection(anonimo(), 'reservas')))
    await assertFails(getDoc(doc(anonimo(), 'reservas', 'r1')))
    await assertFails(setDoc(doc(anonimo(), 'reservas', 'r2'), reserva(['2026-12-31'])))
    await assertFails(deleteDoc(doc(anonimo(), 'reservas', 'r1')))
  })

  test('un usuario logueado que no es admin tampoco', async () => {
    await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'reservas', 'r1'), reserva(['2026-12-30'])))
    await assertFails(getDocs(collection(usuarioComun(), 'reservas')))
    await assertFails(setDoc(doc(usuarioComun(), 'reservas', 'r2'), reserva(['2026-12-31'])))
    await assertFails(deleteDoc(doc(usuarioComun(), 'reservas', 'r1')))
  })

  test('el admin puede crear, ver, editar y borrar reservas', async () => {
    const ref = doc(admin(), 'reservas', 'r1')
    await assertSucceeds(setDoc(ref, reserva(['2026-12-30'])))
    await assertSucceeds(getDocs(collection(admin(), 'reservas')))
    await assertSucceeds(setDoc(ref, { ...reserva(['2026-12-30']), origen: 'facebook' }))
    await assertSucceeds(setDoc(ref, { ...reserva(['2026-12-30']), origen: 'web' }))
    await assertSucceeds(setDoc(ref, { ...reserva(['2026-12-30']), origen: 'otro', origenOtro: 'Un cartel en la ruta' }))
    await assertSucceeds(deleteDoc(ref))
  })

  test('el admin no puede guardar datos inválidos', async () => {
    const ref = doc(admin(), 'reservas', 'r1')
    const valida = reserva(['2026-12-30'])
    await assertFails(setDoc(ref, { ...valida, nombre: '' }))
    await assertFails(setDoc(ref, { ...valida, personas: 0 }))
    await assertFails(setDoc(ref, { ...valida, personas: '20' }))
    await assertFails(setDoc(ref, { ...valida, sena: -1 }))
    await assertFails(setDoc(ref, { ...valida, precio: 70000.5 }))
    await assertFails(setDoc(ref, { ...valida, origen: 'tiktok' }))
    await assertFails(setDoc(ref, { ...valida, telefono: '<script>' }))
    await assertFails(setDoc(ref, { ...valida, dias: [] }))
    await assertFails(setDoc(ref, { ...valida, email: 'juan@ejemplo.com' }))
    const { telefono: _, ...sinTelefono } = valida
    await assertFails(setDoc(ref, sinTelefono))
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
    await assertFails(getDocs(collection(anonimo(), 'clientes')))
    await assertFails(setDoc(doc(admin(), 'clientes', 'x'), { nombre: 'Juan' }))
  })
})
