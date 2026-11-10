import { HORARIO, REDES, UBICACION } from '../config.ts'
import { linkWhatsApp } from '../whatsapp.ts'
import Icono, { type NombreIcono } from './Icono.tsx'

const MENSAJE = '¡Hola! Vi la página de Dos Soles y quería hacer una consulta.'

const redes: { nombre: string; icono: NombreIcono; url: string | null }[] = [
  { nombre: 'Facebook', icono: 'facebook', url: REDES.facebook },
  { nombre: 'Instagram', icono: 'instagram', url: REDES.instagram },
  { nombre: 'TikTok', icono: 'tiktok', url: REDES.tiktok },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-10 pb-24 md:pb-10 px-4 text-sm">
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-3 text-center md:text-left">
        <div>
          <p className="text-lg font-bold text-white">Dos Soles</p>
          <p className="mt-2">Quincho con pileta para alquilar por día.</p>
          <p className="mt-1">Horario de alquiler: {HORARIO}</p>
        </div>

        <div>
          <p className="font-bold text-white">Dónde estamos</p>
          <p className="mt-2">{UBICACION.direccion}</p>
          <a
            href={UBICACION.linkFicha}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex min-h-11 items-center underline hover:text-white"
          >
            Ver en Google Maps
          </a>
        </div>

        <div>
          <p className="font-bold text-white">Contacto</p>
          <a
            href={linkWhatsApp(MENSAJE)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-full bg-green-700 px-5 font-bold text-white hover:bg-green-800"
          >
            <Icono nombre="whatsapp" className="text-lg" /> Escribinos por WhatsApp
          </a>
          <div className="mt-3 flex justify-center md:justify-start gap-2">
            {redes
              .filter((r) => r.url)
              .map((r) => (
                <a
                  key={r.nombre}
                  href={r.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Dos Soles en ${r.nombre}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-800 text-xl text-white hover:bg-gray-700"
                >
                  <Icono nombre={r.icono} />
                </a>
              ))}
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-gray-400">Dos Soles &copy; 2026 · Todos los derechos reservados.</p>
    </footer>
  )
}
