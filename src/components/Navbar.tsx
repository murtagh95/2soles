import { IMAGENES, PREGUNTAS_FRECUENTES } from '../config.ts'
import Icono from './Icono.tsx'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="font-bold text-xl text-green-700">Dos Soles</div>
        {/* Visible en tablet/desktop, oculto en mobile */}
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          <a href="#instalaciones" className="hover:text-green-600 transition">Instalaciones</a>
          {IMAGENES.panorama360 && (
            <a href="#tour360" className="hover:text-green-600 transition">Tour 360°</a>
          )}
          <a href="#reservar" className="hover:text-green-600 transition">Reservar</a>
          {PREGUNTAS_FRECUENTES.length > 0 && (
            <a href="#preguntas" className="hover:text-green-600 transition">Preguntas</a>
          )}
          <a href="#ubicacion" className="hover:text-green-600 transition">Ubicación</a>
        </div>
        <a
          href="#reservar"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center transition shadow-lg"
        >
          <Icono nombre="whatsapp" className="mr-2 text-lg" /> Reservar
        </a>
      </div>
    </nav>
  )
}
