import { useState } from 'react'
import Calendario from './Calendario.tsx'
import Icono from './Icono.tsx'
import { HORARIO } from '../config.ts'
import { claveFecha, formatearDia, proximoLibre } from '../fechas.ts'
import { calcularPrecio, formatearPrecio, resumenReserva, usePrecios } from '../precios.ts'
import { useFeriados } from '../useFeriados.ts'
import { useMontado } from '../useMontado.ts'
import { useOcupados } from '../useOcupados.ts'
import { linkWhatsApp, mensajeReserva } from '../whatsapp.ts'

type Aviso = { ocupado: Date; libre: Date | null }

export default function Reserva() {
  const { ocupados } = useOcupados()
  const { precios, cargado: preciosCargados } = usePrecios()
  const feriados = useFeriados()
  const [elegidas, setElegidas] = useState<Date[]>([])
  // Si el admin reserva un día mientras la persona lo tiene elegido, ese día se descarta
  const fechas = elegidas.filter((f) => !ocupados.has(claveFecha(f)))
  const { dias, total } = resumenReserva(fechas, precios, feriados)
  const seleccionados = new Set(dias.map((d) => d.clave))
  const [nombre, setNombre] = useState('')
  const [invitados, setInvitados] = useState('')
  const [hoy] = useState(() => new Date())
  const montado = useMontado()
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const [intentoEnviar, setIntentoEnviar] = useState(false)
  // Los errores aparecen recién al tocar el botón y se van solos al corregir el campo
  const errorFecha = intentoEnviar && dias.length === 0 ? 'Elegí al menos un día en el calendario.' : null
  const errorNombre = intentoEnviar && !nombre.trim() ? 'Ingresá tu nombre.' : null

  function alternar(fecha: Date) {
    const clave = claveFecha(fecha)
    setAviso(null)
    setElegidas((actuales) =>
      actuales.some((f) => claveFecha(f) === clave) ? actuales.filter((f) => claveFecha(f) !== clave) : [...actuales, fecha],
    )
  }

  function agregar(fecha: Date) {
    setAviso(null)
    setElegidas((actuales) => (actuales.some((f) => claveFecha(f) === claveFecha(fecha)) ? actuales : [...actuales, fecha]))
  }

  function sendToWhatsApp() {
    if (!preciosCargados) return
    setIntentoEnviar(true)
    if (dias.length === 0 || !nombre.trim()) return
    const mensaje = mensajeReserva({ dias, total, nombre: nombre.trim(), personas: invitados, horario: HORARIO })
    window.open(linkWhatsApp(mensaje), '_blank', 'noopener')
  }

  return (
    <section id="reservar" className="py-12 md:py-16 px-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200">
          <h3 className="text-2xl font-bold mb-1">Elegí tus días</h3>
          <p className="text-sm text-gray-600 mb-4">Podés elegir uno o varios. Tocá de nuevo un día para quitarlo.</p>
          {/* El calendario depende de la fecha de hoy: se dibuja recién en el navegador, no en el prerender */}
          {montado ? (
            <Calendario
              mesInicial={hoy}
              ocupados={ocupados}
              feriados={feriados}
              seleccionados={seleccionados}
              onSelect={alternar}
              onOcupado={(fecha) => setAviso({ ocupado: fecha, libre: proximoLibre(fecha, ocupados) })}
              precioDe={preciosCargados ? (fecha) => calcularPrecio(fecha, precios, feriados) : undefined}
            />
          ) : (
            <div className="h-[430px]" aria-hidden="true" />
          )}
          {aviso && (
            <div role="status" className="mt-4 p-3 rounded-lg bg-red-50 text-sm text-red-800">
              <p>
                El <strong>{formatearDia(aviso.ocupado)}</strong> ya está reservado.
                {aviso.libre ? (
                  <> El próximo día libre es el <strong>{formatearDia(aviso.libre)}</strong>.</>
                ) : (
                  ' No hay días libres cerca.'
                )}
              </p>
              {aviso.libre && (
                <button
                  onClick={() => agregar(aviso.libre!)}
                  className="mt-2 min-h-11 px-4 rounded-full bg-green-700 hover:bg-green-800 text-white font-bold"
                >
                  Agregar ese día
                </button>
              )}
            </div>
          )}
          <div className="mt-6 p-4 bg-green-50 rounded-lg text-sm text-green-900">
            <p>
              <Icono nombre="info" /> <strong>Recordá:</strong> cada día es la jornada completa, de{' '}
              <strong>{HORARIO}</strong>.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-2">Tu reserva</h3>

          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            {dias.length === 0 ? (
              <div className="text-center">
                <p className="font-bold text-gray-800">Elegí uno o más días en el calendario.</p>
                {preciosCargados && (
                  <p className="mt-2 text-sm text-gray-700">
                    Entre semana <strong>{formatearPrecio(precios.semana)}</strong> · Fines de semana y feriados{' '}
                    <strong>{formatearPrecio(precios.finDeSemanaYFeriado)}</strong>
                  </p>
                )}
              </div>
            ) : (
              <>
                <ul className="divide-y divide-gray-200 text-sm">
                  {dias.map((d) => (
                    <li key={d.clave} className="flex items-center gap-2 py-2">
                      <span className="flex-1 first-letter:uppercase">
                        {formatearDia(d.fecha)}
                        {d.feriado && <span className="block text-xs normal-case text-orange-800">Feriado: {d.feriado}</span>}
                      </span>
                      <span className="font-bold">{formatearPrecio(d.precio)}</span>
                      <button
                        onClick={() => alternar(d.fecha)}
                        aria-label={`Quitar ${formatearDia(d.fecha)}`}
                        className="h-11 w-11 -mr-2 rounded-full text-xl text-gray-500 hover:bg-gray-200 hover:text-red-700"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 pt-2 border-t border-gray-300 flex justify-between items-baseline">
                  <span className="text-gray-700">
                    Total {dias.length > 1 && <>({dias.length} días)</>}
                  </span>
                  <span className="text-2xl font-extrabold text-green-700">{preciosCargados ? formatearPrecio(total) : '...'}</span>
                </div>
              </>
            )}
            {errorFecha && <p className="text-sm text-red-600 mt-2 text-center">{errorFecha}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Tu nombre
              </label>
              <input
                type="text"
                id="userName"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                aria-invalid={errorNombre !== null}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition ${errorNombre ? 'border-red-500' : ''}`}
              />
              {errorNombre && <p className="text-sm text-red-600 mt-1">{errorNombre}</p>}
            </div>
            <div>
              <label htmlFor="userGuests" className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad de personas (aprox.)
              </label>
              <input
                type="number"
                id="userGuests"
                value={invitados}
                onChange={(e) => setInvitados(e.target.value)}
                placeholder="Ej. 10"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              />
            </div>

            <button
              onClick={sendToWhatsApp}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center transition transform hover:-translate-y-1 mt-4"
            >
              <Icono nombre="whatsapp" className="text-xl mr-2" /> Solicitar por WhatsApp
            </button>
            <p className="text-center text-sm text-gray-600">
              Te respondemos por WhatsApp para confirmar. No hace falta seña.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
