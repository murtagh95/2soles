import { useState } from 'react'
import Calendario from './Calendario.tsx'
import { HORARIO, MES_INICIAL, TELEFONO_WHATSAPP } from '../config.ts'
import { claveFecha } from '../fechas.ts'
import { calcularPrecio, formatearPrecio, usePrecios } from '../precios.ts'
import { useFeriados } from '../useFeriados.ts'
import { useOcupados } from '../useOcupados.ts'

export default function Reserva() {
  const { ocupados } = useOcupados()
  const { precios, cargado: preciosCargados } = usePrecios()
  const feriados = useFeriados()
  const [fechaElegida, setFechaElegida] = useState<Date | null>(null)
  // Si el admin reserva el día mientras la persona lo tiene elegido, se descarta la selección
  const selectedDate = fechaElegida && !ocupados.has(claveFecha(fechaElegida)) ? fechaElegida : null
  const [nombre, setNombre] = useState('')
  const [invitados, setInvitados] = useState('')

  const precioStr = formatearPrecio(selectedDate ? calcularPrecio(selectedDate, precios, feriados) : 0)
  const feriadoElegido = selectedDate ? feriados.get(claveFecha(selectedDate)) : undefined

  function sendToWhatsApp() {
    if (!preciosCargados) return
    if (!selectedDate) {
      alert('Por favor, selecciona una fecha primero en el calendario.')
      return
    }
    if (!nombre) {
      alert('Por favor, ingresa tu nombre.')
      return
    }

    const fechaStr = selectedDate.toLocaleDateString('es-ES')
    const mensaje = `¡Hola! Me gustaría solicitar una reserva para el predio.
*Fecha:* ${fechaStr}${feriadoElegido ? ` (${feriadoElegido})` : ''} (de ${HORARIO})
*Nombre:* ${nombre}
*Personas:* ${invitados || 'No especificado'}
*Precio estimado web:* ${precioStr}

¿Tienen disponibilidad para ese día? ¡Gracias!`

    const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank')
  }

  return (
    <section id="reservar" className="py-16 px-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200">
          <h3 className="text-2xl font-bold mb-4">Elegí tu fecha</h3>
          <Calendario
            mesInicial={MES_INICIAL}
            ocupados={ocupados}
            feriados={feriados}
            selectedDate={selectedDate}
            onSelect={setFechaElegida}
          />
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p>
              <i className="fas fa-info-circle"></i> <strong>Recuerde:</strong> El alquiler corresponde a la jornada
              completa de <strong>{HORARIO}</strong>.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          <h3 className="text-2xl font-bold mb-2">Detalles de la Reserva</h3>

          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center">
            <p className="text-sm text-gray-500 mb-1">Día seleccionado:</p>
            <p className="text-xl font-bold text-gray-800">
              {selectedDate
                ? selectedDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Ninguno'}
            </p>
            {feriadoElegido && <p className="text-sm font-medium text-orange-600 mt-1">Feriado: {feriadoElegido}</p>}
            <div className="mt-2 text-2xl font-extrabold text-green-600">{preciosCargados ? precioStr : '...'}</div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                Tu Nombre
              </label>
              <input
                type="text"
                id="userName"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="userGuests" className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad de personas (Aprox)
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
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-lg flex justify-center items-center transition transform hover:-translate-y-1 mt-4"
            >
              <i className="fab fa-whatsapp text-xl mr-2"></i> Solicitar por WhatsApp
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
