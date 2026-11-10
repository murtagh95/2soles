import { useState } from 'react'
import { UBICACION } from '../config.ts'
import Icono from './Icono.tsx'

export default function Ubicacion() {
  const [mostrarMapa, setMostrarMapa] = useState(false)
  return (
    <section id="ubicacion" className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Ubicación</h2>
      <p className="text-center text-gray-600 mb-8">
        <Icono nombre="ubicacion" className="text-red-500 mr-2" />
        {UBICACION.direccion}
      </p>
      <div className="rounded-xl overflow-hidden shadow-lg bg-white h-[300px] md:h-[450px]">
        {mostrarMapa ? (
          <iframe
            src={UBICACION.embedMapa}
            title="Mapa de ubicación de Dos Soles"
            className="w-full h-full border-0"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        ) : (
          // El mapa de Google (y sus cookies) se carga recién cuando la persona lo pide
          <button
            onClick={() => setMostrarMapa(true)}
            className="w-full h-full flex flex-col items-center justify-center gap-3 bg-green-50 hover:bg-green-100 transition text-gray-700"
          >
            <Icono nombre="ubicacion" className="text-5xl text-red-500" />
            <span className="font-bold text-lg">Ver el mapa</span>
            <span className="text-sm text-gray-600">Se carga Google Maps</span>
          </button>
        )}
      </div>
      <div className="text-center mt-6">
        <a
          href={UBICACION.linkGoogleMaps}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 rounded-full shadow-lg transition"
        >
          <Icono nombre="direcciones" className="mr-2" /> Cómo llegar
        </a>
      </div>
    </section>
  )
}
