import { TELEFONO_WHATSAPP } from './config.ts'

export function linkWhatsApp(mensaje: string) {
  return `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`
}
