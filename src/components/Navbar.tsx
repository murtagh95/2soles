import { useEffect, useState } from 'react'
import { IMAGENES, PREGUNTAS_FRECUENTES } from '../config.ts'
import Icono from './Icono.tsx'

// Mismo orden que las secciones de la página
const LINKS = [
  { href: '#instalaciones', texto: 'Instalaciones' },
  { href: '#reservar', texto: 'Reservar' },
  { href: '#opiniones', texto: 'Opiniones' },
  { href: '#galeria', texto: 'Galería' },
  ...(IMAGENES.panorama360 ? [{ href: '#tour360', texto: 'Tour 360°' }] : []),
  ...(PREGUNTAS_FRECUENTES.length > 0 ? [{ href: '#preguntas', texto: 'Preguntas' }] : []),
  { href: '#ubicacion', texto: 'Ubicación' },
]

export default function Navbar() {
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (!abierto) return
    const cerrarConEscape = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    window.addEventListener('keydown', cerrarConEscape)
    return () => window.removeEventListener('keydown', cerrarConEscape)
  }, [abierto])

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <a href="#" className="font-bold text-xl text-green-700">
          Dos Soles
        </a>
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-green-700 transition">
              {l.texto}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#reservar"
            className="bg-green-700 hover:bg-green-800 text-white px-4 min-h-11 rounded-full text-sm font-bold flex items-center transition shadow-lg"
          >
            <Icono nombre="whatsapp" className="mr-2 text-lg" /> Reservar
          </a>
          <button
            onClick={() => setAbierto((a) => !a)}
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={abierto}
            aria-controls="menu-celular"
            className="md:hidden h-11 w-11 flex flex-col items-center justify-center gap-1.5 rounded-full hover:bg-gray-100"
          >
            <span className={`block h-0.5 w-6 bg-gray-800 transition ${abierto ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-6 bg-gray-800 transition ${abierto ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-gray-800 transition ${abierto ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>
      {abierto && (
        <div id="menu-celular" className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setAbierto(false)}
              className="block px-6 py-3 text-base font-medium text-gray-800 hover:bg-green-50 hover:text-green-700"
            >
              {l.texto}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
