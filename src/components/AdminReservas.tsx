import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import Calendario from './Calendario.tsx'
import { mensajeErrorGuardado } from './errorGuardado.ts'
import { claveFecha, fechaDesdeClave, formatearDia } from '../fechas.ts'
import { formatearPrecio, leerPrecio, resumenReserva, usePrecios } from '../precios.ts'
import {
  cargarReserva,
  eliminarReserva,
  ErrorReserva,
  formDesdeReserva,
  guardarReserva,
  liberarDia,
  ORIGENES,
  validarReserva,
  type FormReserva,
  type Origen,
  type Reserva,
} from '../reservas.ts'
import { useFeriados } from '../useFeriados.ts'
import { useOcupados } from '../useOcupados.ts'

const claseInput = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none'
const claseBotonVerde = 'bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-lg'

// Qué se está mirando debajo del calendario
type Vista =
  | { tipo: 'nada' }
  | { tipo: 'cargando' }
  | { tipo: 'nueva' }
  // Reserva guardada: primero se ve su ficha; para cambiarla hay que tocar "Editar"
  | { tipo: 'existente'; reserva: Reserva; editando: boolean }
  // Día ocupado de antes de que las reservas guardaran datos
  | { tipo: 'legado'; clave: string }

const FORM_VACIO: FormReserva = { nombre: '', personas: '', telefono: '', origen: '', origenOtro: '', precio: '', sena: '' }

function mensajeError(e: unknown) {
  return e instanceof ErrorReserva ? e.message : mensajeErrorGuardado(e)
}

function MensajeError({ children }: { children: ReactNode }) {
  return <p role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">{children}</p>
}

export default function AdminReservas() {
  const { reservaDe, ocupados, error } = useOcupados()
  const feriados = useFeriados()
  const [hoy] = useState(() => new Date())
  const [vista, setVista] = useState<Vista>({ tipo: 'nada' })
  const [dias, setDias] = useState<Set<string>>(new Set())
  const [errorVista, setErrorVista] = useState<string | null>(null)
  // Si se tocan dos días reservados seguidos, solo vale la última carga
  const ultimaCarga = useRef(0)

  const editando = vista.tipo === 'nueva' || (vista.tipo === 'existente' && vista.editando)
  const idActual = vista.tipo === 'existente' ? vista.reserva.id : null

  function cerrar() {
    ultimaCarga.current++
    setVista({ tipo: 'nada' })
    setDias(new Set())
    setErrorVista(null)
  }

  async function abrirReserva(id: string) {
    const carga = ++ultimaCarga.current
    setVista({ tipo: 'cargando' })
    setErrorVista(null)
    try {
      const reserva = await cargarReserva(id)
      if (carga !== ultimaCarga.current) return
      if (!reserva) {
        cerrar()
        setErrorVista('No se encontró la reserva de ese día.')
        return
      }
      setVista({ tipo: 'existente', reserva, editando: false })
      setDias(new Set(reserva.dias))
    } catch (e) {
      if (carga !== ultimaCarga.current) return
      cerrar()
      setErrorVista(mensajeError(e))
    }
  }

  function tocar(fecha: Date) {
    const clave = claveFecha(fecha)
    const duenio = reservaDe.get(clave)

    // Mientras se arma o edita una reserva, los días libres (o los suyos) se suman y se sacan
    if (editando && (duenio === undefined || dias.has(clave) || duenio === idActual)) {
      const nuevos = new Set(dias)
      if (nuevos.has(clave)) nuevos.delete(clave)
      else nuevos.add(clave)
      setDias(nuevos)
      return
    }
    // Viendo la ficha, tocar uno de sus días no cambia nada
    if (duenio !== undefined && duenio === idActual) return

    ultimaCarga.current++
    setErrorVista(null)
    if (duenio === undefined) {
      setVista({ tipo: 'nueva' })
      setDias(new Set([clave]))
    } else if (duenio === null) {
      setVista({ tipo: 'legado', clave })
      setDias(new Set([clave]))
    } else {
      setDias(new Set())
      abrirReserva(duenio)
    }
  }

  function cancelarEdicion() {
    if (vista.tipo !== 'existente') return cerrar()
    setVista({ ...vista, editando: false })
    setDias(new Set(vista.reserva.dias))
  }

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        {editando
          ? 'Tocá días libres para sumarlos a la reserva, o uno elegido para sacarlo.'
          : 'Tocá un día libre para empezar una reserva, o uno reservado para ver sus datos.'}
      </p>
      <Calendario
        mesInicial={hoy}
        ocupados={ocupados}
        feriados={feriados}
        seleccionados={dias}
        onSelect={tocar}
        permitirOcupados
      />
      <div className="mt-4 text-sm space-y-3">
        {(error || errorVista) && <MensajeError>{errorVista ?? error}</MensajeError>}
        {vista.tipo === 'cargando' && <p className="text-gray-500">Cargando reserva...</p>}
        {vista.tipo === 'legado' && (
          <DiaSinDatos
            clave={vista.clave}
            onCargarDatos={() => setVista({ tipo: 'nueva' })}
            onLiberado={cerrar}
          />
        )}
        {vista.tipo === 'existente' && !vista.editando && (
          <FichaReserva
            reserva={vista.reserva}
            feriados={feriados}
            onEditar={() => setVista({ ...vista, editando: true })}
            onEliminada={cerrar}
            onCerrar={cerrar}
          />
        )}
        {editando && (
          <FormularioReserva
            key={idActual ?? 'nueva'}
            reserva={vista.tipo === 'existente' ? vista.reserva : null}
            dias={[...dias].sort()}
            feriados={feriados}
            onGuardada={abrirReserva}
            onCancelar={cancelarEdicion}
          />
        )}
      </div>
    </>
  )
}

function ListaDias({ dias, feriados }: { dias: string[]; feriados: Map<string, string> }) {
  return (
    <ul className="text-gray-700">
      {dias.map((d) => (
        <li key={d} className="capitalize">
          {formatearDia(fechaDesdeClave(d))}
          {feriados.has(d) && <span className="text-orange-600 normal-case"> · {feriados.get(d)}</span>}
        </li>
      ))}
    </ul>
  )
}

function DiaSinDatos({ clave, onCargarDatos, onLiberado }: { clave: string; onCargarDatos: () => void; onLiberado: () => void }) {
  const [liberando, setLiberando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function liberar() {
    setLiberando(true)
    setError(null)
    try {
      await liberarDia(clave)
      onLiberado()
    } catch (e) {
      setError(mensajeError(e))
      setLiberando(false)
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
      <p>
        <span className="font-bold capitalize">{formatearDia(fechaDesdeClave(clave))}</span> está reservado, pero no tiene
        datos cargados.
      </p>
      {error && <MensajeError>{error}</MensajeError>}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onCargarDatos} className={claseBotonVerde}>
          Cargar datos
        </button>
        <button onClick={liberar} disabled={liberando} className="text-red-600 hover:underline">
          {liberando ? 'Liberando...' : 'Liberar día'}
        </button>
      </div>
    </div>
  )
}

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{etiqueta}</dt>
      <dd className="font-medium text-gray-800">{children}</dd>
    </div>
  )
}

type PropsFicha = {
  reserva: Reserva
  feriados: Map<string, string>
  onEditar: () => void
  onEliminada: () => void
  onCerrar: () => void
}

function FichaReserva({ reserva, feriados, onEditar, onEliminada, onCerrar }: PropsFicha) {
  const [eliminando, setEliminando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const origen = reserva.origen === 'otro' ? `Otro: ${reserva.origenOtro ?? ''}` : ORIGENES[reserva.origen]

  async function eliminar() {
    if (!confirm(`¿Eliminar la reserva de ${reserva.nombre}? Sus días quedan libres.`)) return
    setEliminando(true)
    setError(null)
    try {
      await eliminarReserva(reserva.id)
      onEliminada()
    } catch (e) {
      setError(mensajeError(e))
      setEliminando(false)
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
      <div>
        <p className="font-bold text-base">{reserva.nombre}</p>
        <ListaDias dias={reserva.dias} feriados={feriados} />
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <Dato etiqueta="Personas">{reserva.personas}</Dato>
        <Dato etiqueta="Teléfono">
          <a href={`tel:${reserva.telefono.replace(/[^0-9+]/g, '')}`} className="text-green-700 hover:underline">
            {reserva.telefono}
          </a>
        </Dato>
        <Dato etiqueta="Cómo nos conoció">{origen}</Dato>
        <Dato etiqueta="Precio">{formatearPrecio(reserva.precio)}</Dato>
        <Dato etiqueta="Seña">{reserva.sena ? formatearPrecio(reserva.sena) : 'No dejó'}</Dato>
        <Dato etiqueta="Saldo a cobrar">{formatearPrecio(reserva.precio - reserva.sena)}</Dato>
      </dl>
      {error && <MensajeError>{error}</MensajeError>}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={onEditar} className={claseBotonVerde}>
          Editar
        </button>
        <button onClick={onCerrar} className="text-gray-600 hover:underline">
          Cerrar
        </button>
        <button onClick={eliminar} disabled={eliminando} className="text-red-600 hover:underline ml-auto">
          {eliminando ? 'Eliminando...' : 'Eliminar reserva'}
        </button>
      </div>
    </div>
  )
}

type PropsFormulario = {
  reserva: Reserva | null
  dias: string[]
  feriados: Map<string, string>
  onGuardada: (id: string) => void
  onCancelar: () => void
}

function FormularioReserva({ reserva, dias, feriados, onGuardada, onCancelar }: PropsFormulario) {
  const { precios } = usePrecios()
  const [form, setForm] = useState<FormReserva>(() => (reserva ? formDesdeReserva(reserva) : FORM_VACIO))
  // En una reserva nueva el precio sigue a los días elegidos hasta que se lo cambia a mano
  const [precioManual, setPrecioManual] = useState(reserva !== null)
  const [error, setError] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  const precioSugerido = resumenReserva(dias.map(fechaDesdeClave), precios, feriados).total
  const precio = precioManual ? form.precio : String(precioSugerido)
  const saldo = (leerPrecio(precio) ?? 0) - (form.sena.trim() === '' ? 0 : (leerPrecio(form.sena) ?? 0))

  const cambiar = (campo: keyof FormReserva) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }))

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const resultado = validarReserva({ ...form, precio }, dias)
    if ('error' in resultado) {
      setError(resultado.error)
      return
    }
    setGuardando(true)
    setError(null)
    try {
      onGuardada(await guardarReserva(reserva?.id ?? null, resultado.datos))
    } catch (err) {
      console.error('No se pudo guardar la reserva', err)
      setError(mensajeError(err))
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={guardar} noValidate className="p-4 bg-gray-50 rounded-lg space-y-3">
      <div>
        <p className="font-bold">{reserva ? 'Editar reserva' : 'Nueva reserva'}</p>
        {dias.length === 0 ? (
          <p className="text-gray-500">Elegí los días en el calendario.</p>
        ) : (
          <ListaDias dias={dias} feriados={feriados} />
        )}
      </div>

      <label className="block text-gray-700">
        Nombre
        <input value={form.nombre} onChange={cambiar('nombre')} maxLength={100} className={claseInput} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-gray-700">
          Personas
          <input type="number" min="1" max="500" step="1" value={form.personas} onChange={cambiar('personas')} className={claseInput} />
        </label>
        <label className="text-gray-700">
          Teléfono
          <input type="tel" value={form.telefono} onChange={cambiar('telefono')} maxLength={30} className={claseInput} />
        </label>
      </div>
      <label className="block text-gray-700">
        Cómo nos conoció
        <select value={form.origen} onChange={cambiar('origen')} className={`${claseInput} bg-white`}>
          <option value="">Elegí una opción</option>
          {(Object.keys(ORIGENES) as Origen[]).map((o) => (
            <option key={o} value={o}>
              {ORIGENES[o]}
            </option>
          ))}
        </select>
      </label>
      {form.origen === 'otro' && (
        <label className="block text-gray-700">
          ¿Cómo?
          <input value={form.origenOtro} onChange={cambiar('origenOtro')} maxLength={100} className={claseInput} />
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-gray-700">
          Precio
          <input
            type="number"
            min="0"
            step="1"
            value={precio}
            onChange={(e) => {
              setPrecioManual(true)
              setForm((f) => ({ ...f, precio: e.target.value }))
            }}
            className={claseInput}
          />
        </label>
        <label className="text-gray-700">
          Seña
          <input type="number" min="0" step="1" value={form.sena} onChange={cambiar('sena')} placeholder="0" className={claseInput} />
        </label>
      </div>
      <p className="text-gray-600">
        Saldo a cobrar: <span className="font-bold">{formatearPrecio(saldo)}</span>
        {precioManual && dias.length > 0 && precio !== String(precioSugerido) && (
          <span className="block text-xs text-gray-500">Precio de lista para estos días: {formatearPrecio(precioSugerido)}</span>
        )}
      </p>

      {error && <MensajeError>{error}</MensajeError>}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={guardando} className={claseBotonVerde}>
          {guardando ? 'Guardando...' : reserva ? 'Guardar cambios' : 'Guardar reserva'}
        </button>
        <button type="button" onClick={onCancelar} className="text-gray-600 hover:underline">
          Cancelar
        </button>
      </div>
    </form>
  )
}
