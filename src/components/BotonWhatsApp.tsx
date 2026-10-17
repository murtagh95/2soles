import { linkWhatsApp } from '../whatsapp.ts'
import Icono from './Icono.tsx'

const MENSAJE = '¡Hola! Vi la página de Dos Soles y quería hacer una consulta.'

// Siempre visible abajo a la derecha: el camino más corto para escribir desde el celular
export default function BotonWhatsApp() {
  return (
    <a
      href={linkWhatsApp(MENSAJE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-3xl text-white shadow-xl transition hover:scale-110 hover:bg-green-600"
    >
      <Icono nombre="whatsapp" />
    </a>
  )
}
