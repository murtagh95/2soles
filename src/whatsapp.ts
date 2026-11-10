import { TELEFONO_WHATSAPP } from './config.ts'
import { formatearPrecio, type DiaReserva } from './precios.ts'

export function linkWhatsApp(mensaje: string) {
  return `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`
}

type DatosReserva = { dias: DiaReserva[]; total: number; nombre: string; personas: string; horario: string }

function lineaDia(d: DiaReserva) {
  const fecha = d.fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })
  return `${fecha}${d.feriado ? ` (${d.feriado})` : ''}`
}

export function mensajeReserva({ dias, total, nombre, personas, horario }: DatosReserva) {
  const fechas =
    dias.length === 1
      ? `*Fecha:* ${lineaDia(dias[0])} (de ${horario})`
      : `*Fechas* (de ${horario}):\n${dias.map((d) => `- ${lineaDia(d)}: ${formatearPrecio(d.precio)}`).join('\n')}`
  return `¡Hola! Me gustaría solicitar una reserva para el predio.
${fechas}
*Nombre:* ${nombre}
*Personas:* ${personas || 'No especificado'}
*Precio estimado web:* ${formatearPrecio(total)}

¿Tienen disponibilidad para ${dias.length === 1 ? 'ese día' : 'esos días'}? ¡Gracias!`
}
