import { cargarFirestore } from './firestore.ts'
import { leerPrecio } from './precios.ts'

export const ORIGENES = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google',
  web: 'Página web',
  recomendacion: 'Recomendación',
  repite: 'Ya vino antes',
  otro: 'Otro',
} as const

export type Origen = keyof typeof ORIGENES

// Lo que se guarda en reservas/{id}. Los días ocupados apuntan a la reserva con ocupados/{fecha}.reservaId
export type DatosReserva = {
  nombre: string
  personas: number
  sena: number
  origen: Origen
  origenOtro?: string
  telefono: string
  precio: number
  // Fechas YYYY-MM-DD, ordenadas
  dias: string[]
}

export type Reserva = DatosReserva & { id: string }

// Lo que se escribe en el formulario, tal cual
export type FormReserva = {
  nombre: string
  personas: string
  telefono: string
  origen: Origen | ''
  origenOtro: string
  precio: string
  sena: string
}

// Se queda con los números y un + inicial: los teléfonos copiados de WhatsApp o de los contactos
// suelen traer espacios, guiones o caracteres invisibles
export function normalizarTelefono(valor: string) {
  const limpio = valor.replace(/[^0-9+]/g, '')
  return (limpio.startsWith('+') ? '+' : '') + limpio.replace(/\+/g, '')
}

const TELEFONO = /^\+?[0-9]{6,20}$/

export function validarReserva(form: FormReserva, dias: string[]): { datos: DatosReserva } | { error: string } {
  const nombre = form.nombre.trim()
  const telefono = normalizarTelefono(form.telefono)
  const origenOtro = form.origenOtro.trim()
  const personas = leerPrecio(form.personas)
  const precio = leerPrecio(form.precio)
  // Sin seña se puede dejar vacío
  const sena = form.sena.trim() === '' ? 0 : leerPrecio(form.sena)

  if (dias.length === 0) return { error: 'Elegí al menos un día en el calendario.' }
  if (dias.length > 31) return { error: 'Una reserva puede tener hasta 31 días.' }
  if (!nombre) return { error: 'Falta el nombre.' }
  if (nombre.length > 100) return { error: 'El nombre es demasiado largo.' }
  if (personas === null || personas < 1 || personas > 500) return { error: 'La cantidad de personas tiene que ser un número entre 1 y 500.' }
  if (!TELEFONO.test(telefono)) return { error: 'El teléfono tiene que tener entre 6 y 20 números.' }
  if (!form.origen) return { error: 'Elegí cómo nos conoció.' }
  if (form.origen === 'otro' && !origenOtro) return { error: 'Contá cómo nos conoció.' }
  if (origenOtro.length > 100) return { error: 'El texto de "cómo nos conoció" es demasiado largo.' }
  if (precio === null) return { error: 'El precio tiene que ser un monto entero, sin puntos ni signos.' }
  if (sena === null) return { error: 'La seña tiene que ser un monto entero, sin puntos ni signos.' }
  if (sena > precio) return { error: 'La seña no puede ser mayor que el precio.' }

  return {
    datos: {
      nombre,
      personas,
      sena,
      origen: form.origen,
      ...(form.origen === 'otro' ? { origenOtro } : {}),
      telefono,
      precio,
      dias: [...dias].sort(),
    },
  }
}

export function formDesdeReserva(reserva: Reserva): FormReserva {
  return {
    nombre: reserva.nombre,
    personas: String(reserva.personas),
    telefono: reserva.telefono,
    origen: reserva.origen,
    origenOtro: reserva.origenOtro ?? '',
    precio: String(reserva.precio),
    sena: reserva.sena ? String(reserva.sena) : '',
  }
}

// Error pensado para mostrarle al admin tal cual
export class ErrorReserva extends Error {}

export async function cargarReserva(id: string): Promise<Reserva | null> {
  const { db, doc, getDoc } = await cargarFirestore()
  const snap = await getDoc(doc(db, 'reservas', id))
  return snap.exists() ? { ...(snap.data() as DatosReserva), id } : null
}

// Crea (id null) o actualiza una reserva y marca sus días como ocupados, todo junto.
// Falla si algún día ya pertenece a otra reserva. Un día ocupado sin reserva (de antes de guardar datos) se adopta.
// Al editar, los días que se sacaron de la reserva se liberan. Devuelve el ID.
export async function guardarReserva(id: string | null, datos: DatosReserva) {
  const { db, collection, doc, runTransaction, serverTimestamp } = await cargarFirestore()
  const ref = id ? doc(db, 'reservas', id) : doc(collection(db, 'reservas'))
  const refDia = (clave: string) => doc(db, 'ocupados', clave)

  await runTransaction(db, async (tx) => {
    // En una transacción todas las lecturas van antes que las escrituras
    const anterior = id ? await tx.get(ref) : null
    if (id && !anterior?.exists()) throw new ErrorReserva('La reserva ya no existe: puede que la hayan eliminado.')
    const diasAnteriores: string[] = anterior?.data()?.dias ?? []
    const quitados = diasAnteriores.filter((d) => !datos.dias.includes(d))

    const actuales = await Promise.all(datos.dias.map((d) => tx.get(refDia(d))))
    const sacados = await Promise.all(quitados.map((d) => tx.get(refDia(d))))

    const tomado = actuales.find((s) => {
      const duenio = s.data()?.reservaId
      return duenio && duenio !== ref.id
    })
    if (tomado) throw new ErrorReserva(`El día ${tomado.id} ya es parte de otra reserva.`)

    tx.set(ref, {
      ...datos,
      creadoEn: anterior?.data()?.creadoEn ?? serverTimestamp(),
      actualizadoEn: serverTimestamp(),
    })
    for (const s of actuales) {
      if (s.data()?.reservaId !== ref.id) tx.set(s.ref, { creadoEn: serverTimestamp(), reservaId: ref.id })
    }
    for (const s of sacados) {
      if (s.data()?.reservaId === ref.id) tx.delete(s.ref)
    }
  })
  return ref.id
}

// Borra la reserva y libera sus días
export async function eliminarReserva(id: string) {
  const { db, doc, runTransaction } = await cargarFirestore()
  const ref = doc(db, 'reservas', id)
  await runTransaction(db, async (tx) => {
    const reserva = await tx.get(ref)
    const dias: string[] = reserva.data()?.dias ?? []
    const ocupados = await Promise.all(dias.map((d) => tx.get(doc(db, 'ocupados', d))))
    for (const s of ocupados) {
      if (s.data()?.reservaId === id) tx.delete(s.ref)
    }
    tx.delete(ref)
  })
}

// Para días marcados antes de que existieran las reservas con datos
export async function liberarDia(clave: string) {
  const { db, doc, deleteDoc } = await cargarFirestore()
  await deleteDoc(doc(db, 'ocupados', clave))
}
