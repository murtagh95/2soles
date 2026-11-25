import { useState, type FormEvent } from 'react'
import Calendario from './Calendario.tsx'
import { mensajeErrorGuardado } from './errorGuardado.ts'
import { claveFecha, esPasado, fechaDesdeClave } from '../fechas.ts'
import {
  calcularPrecio,
  formatearPrecio,
  guardarCambioPrecios,
  guardarPrecioEspecial,
  guardarPreciosBase,
  leerPrecio,
  usePrecios,
  type CambioPrecios,
  type Precios,
} from '../precios.ts'
import { useFeriados } from '../useFeriados.ts'
import { useOcupados } from '../useOcupados.ts'

const claseInput = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none'

function formatearFecha(fecha: Date) {
  return fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AdminPrecios() {
  const { precios, cargado, error } = usePrecios()
  const { ocupados } = useOcupados()
  const feriados = useFeriados()
  const [hoy] = useState(() => new Date())
  const [diaElegido, setDiaElegido] = useState<Date | null>(null)

  if (!cargado) return <p className="text-gray-500">Cargando precios...</p>

  const proximosEspeciales = Object.entries(precios.especiales)
    .filter(([clave]) => !esPasado(fechaDesdeClave(clave)))
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <PreciosBase precios={precios} />

      <CambioDePrecios key={JSON.stringify(precios.cambio ?? null)} precios={precios} />

      <section>
        <h2 className="font-bold text-lg mb-1">Precio de un día puntual</h2>
        <p className="text-sm text-gray-600 mb-4">
          Elegí un día para ponerle un precio distinto (ej. Navidad o Año Nuevo).
        </p>
        <Calendario
          mesInicial={hoy}
          ocupados={ocupados}
          feriados={feriados}
          destacados={new Set(Object.keys(precios.especiales))}
          leyendaDestacados="Precio especial"
          seleccionados={new Set(diaElegido ? [claveFecha(diaElegido)] : [])}
          onSelect={setDiaElegido}
          permitirOcupados
        />
        {diaElegido && (
          <PrecioDelDia
            key={claveFecha(diaElegido)}
            fecha={diaElegido}
            precios={precios}
            feriados={feriados}
          />
        )}
      </section>

      {proximosEspeciales.length > 0 && (
        <section>
          <h2 className="font-bold text-lg mb-2">Próximos precios especiales</h2>
          <ul className="divide-y text-sm">
            {proximosEspeciales.map(([clave, precio]) => (
              <li key={clave} className="flex justify-between items-center py-2">
                <button
                  onClick={() => setDiaElegido(fechaDesdeClave(clave))}
                  className="text-left hover:text-green-700 capitalize"
                >
                  {formatearFecha(fechaDesdeClave(clave))}
                  {feriados.has(clave) && <span className="block text-xs text-orange-600 normal-case">{feriados.get(clave)}</span>}
                </button>
                <span className="font-bold">{formatearPrecio(precio)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function PreciosBase({ precios }: { precios: Precios }) {
  const [semana, setSemana] = useState(String(precios.semana))
  const [finDeSemana, setFinDeSemana] = useState(String(precios.finDeSemanaYFeriado))
  const [estado, setEstado] = useState<string | null>(null)

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const precioSemana = leerPrecio(semana)
    const precioFinDeSemana = leerPrecio(finDeSemana)
    if (precioSemana === null || precioFinDeSemana === null) {
      setEstado('Ingresá montos enteros, sin puntos ni signos.')
      return
    }
    setEstado('Guardando...')
    try {
      await guardarPreciosBase(precioSemana, precioFinDeSemana)
      setEstado('Precios guardados.')
    } catch (err) {
      setEstado(mensajeErrorGuardado(err))
    }
  }

  return (
    <form onSubmit={guardar}>
      <h2 className="font-bold text-lg mb-1">Precios generales</h2>
      <p className="text-sm text-gray-600 mb-3">Los que se cobran hoy.</p>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-gray-700">
          Entre semana
          <input type="number" min="0" step="1" value={semana} onChange={(e) => setSemana(e.target.value)} className={claseInput} />
        </label>
        <label className="text-sm text-gray-700">
          Fin de semana y feriados
          <input
            type="number"
            min="0"
            step="1"
            value={finDeSemana}
            onChange={(e) => setFinDeSemana(e.target.value)}
            className={claseInput}
          />
        </label>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <button className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-sm">Guardar</button>
        {estado && <span className="text-sm text-gray-600">{estado}</span>}
      </div>
    </form>
  )
}

function CambioDePrecios({ precios }: { precios: Precios }) {
  const { cambio } = precios
  const [desde, setDesde] = useState(cambio?.desde ?? '')
  const [semana, setSemana] = useState(cambio ? String(cambio.semana) : '')
  const [finDeSemana, setFinDeSemana] = useState(cambio ? String(cambio.finDeSemanaYFeriado) : '')
  const [estado, setEstado] = useState<string | null>(null)
  const [minimo] = useState(() => {
    const manana = new Date()
    manana.setDate(manana.getDate() + 1)
    return claveFecha(manana)
  })

  async function guardar(nuevo: CambioPrecios | null) {
    setEstado('Guardando...')
    try {
      await guardarCambioPrecios(precios, nuevo)
      setEstado(nuevo ? 'Cambio de precios guardado.' : 'Cambio de precios quitado.')
    } catch (err) {
      setEstado(mensajeErrorGuardado(err))
    }
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    const precioSemana = leerPrecio(semana)
    const precioFinDeSemana = leerPrecio(finDeSemana)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(desde) || desde < minimo) {
      setEstado('Elegí una fecha a partir de mañana.')
      return
    }
    if (precioSemana === null || precioFinDeSemana === null) {
      setEstado('Ingresá montos enteros, sin puntos ni signos.')
      return
    }
    guardar({ desde, semana: precioSemana, finDeSemanaYFeriado: precioFinDeSemana })
  }

  return (
    <form onSubmit={enviar}>
      <h2 className="font-bold text-lg mb-1">Cambio de precios programado</h2>
      <p className="text-sm text-gray-600 mb-3">
        Los precios generales nuevos y desde qué día rigen. Hasta ese día se cobran los de arriba; desde ese día, estos. Los
        precios especiales de días puntuales se siguen respetando.
      </p>
      <label className="block text-sm text-gray-700 mb-3">
        A partir del
        <input type="date" min={minimo} value={desde} onChange={(e) => setDesde(e.target.value)} className={claseInput} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-gray-700">
          Entre semana
          <input type="number" min="0" step="1" value={semana} onChange={(e) => setSemana(e.target.value)} className={claseInput} />
        </label>
        <label className="text-sm text-gray-700">
          Fin de semana y feriados
          <input
            type="number"
            min="0"
            step="1"
            value={finDeSemana}
            onChange={(e) => setFinDeSemana(e.target.value)}
            className={claseInput}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-sm">Guardar</button>
        {cambio && (
          <button type="button" onClick={() => guardar(null)} className="text-red-600 hover:underline text-sm">
            Quitar cambio
          </button>
        )}
        {estado && <span className="text-sm text-gray-600">{estado}</span>}
      </div>
    </form>
  )
}

function PrecioDelDia({ fecha, precios, feriados }: { fecha: Date; precios: Precios; feriados: Map<string, string> }) {
  const clave = claveFecha(fecha)
  const especial = precios.especiales[clave] as number | undefined
  const [valor, setValor] = useState(especial !== undefined ? String(especial) : '')
  const [estado, setEstado] = useState<string | null>(null)

  const sinEspecial = { ...precios, especiales: {} }
  const precioNormal = calcularPrecio(fecha, sinEspecial, feriados)

  async function guardar(precio: number | null) {
    setEstado('Guardando...')
    try {
      await guardarPrecioEspecial(precios, clave, precio)
      setEstado(precio === null ? 'Volvió al precio normal.' : 'Precio especial guardado.')
      if (precio === null) setValor('')
    } catch (err) {
      setEstado(mensajeErrorGuardado(err))
    }
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    const precio = leerPrecio(valor)
    if (precio === null) {
      setEstado('Ingresá un monto entero, sin puntos ni signos.')
      return
    }
    guardar(precio)
  }

  return (
    <form onSubmit={enviar} className="mt-4 p-4 bg-gray-50 rounded-lg text-sm space-y-3">
      <div>
        <p className="font-bold capitalize">{formatearFecha(fecha)}</p>
        {feriados.has(clave) && <p className="text-orange-600">Feriado: {feriados.get(clave)}</p>}
        <p className="text-gray-600">Precio normal: {formatearPrecio(precioNormal)}</p>
      </div>
      <label className="block text-gray-700">
        Precio especial
        <input
          type="number"
          min="0"
          step="1"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder={String(precioNormal)}
          className={claseInput}
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg">Guardar</button>
        {especial !== undefined && (
          <button type="button" onClick={() => guardar(null)} className="text-red-600 hover:underline">
            Quitar precio especial
          </button>
        )}
        {estado && <span className="text-gray-600">{estado}</span>}
      </div>
    </form>
  )
}
