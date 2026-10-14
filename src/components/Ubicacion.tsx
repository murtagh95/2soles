import { UBICACION } from '../config.ts'

export default function Ubicacion() {
  return (
    <section id="ubicacion" className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Ubicación</h2>
      <p className="text-center text-gray-600 mb-8">
        <i className="fas fa-map-marker-alt text-red-500 mr-2"></i>
        {UBICACION.direccion}
      </p>
      <div className="rounded-xl overflow-hidden shadow-lg bg-white">
        <iframe
          src={UBICACION.embedMapa}
          title="Mapa de ubicación de Dos Soles"
          className="w-full h-[300px] md:h-[450px] border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
      <div className="text-center mt-6">
        <a
          href={UBICACION.linkGoogleMaps}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-full shadow-lg transition"
        >
          <i className="fas fa-directions mr-2"></i> Cómo llegar
        </a>
      </div>
    </section>
  )
}
