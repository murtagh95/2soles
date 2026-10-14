import { HORARIO, IMAGENES } from '../config.ts'

const instalaciones = [
  {
    img: IMAGENES.quincho,
    alt: 'Quincho de madera con mesas',
    titulo: 'Amplio Quincho y Churrasquera',
    texto: 'Estructura rústica techada, perfecta para asados, equipada con mesas de estilo palet y mucho espacio.',
  },
  {
    img: IMAGENES.pileta,
    alt: 'Pileta amplia',
    titulo: 'Pileta Exclusiva',
    texto: 'Piscina de aguas cristalinas rodeada de naturaleza y árboles, ideal para refrescarse en verano.',
  },
  {
    img: IMAGENES.parque,
    alt: 'Vista desde el quincho al parque',
    titulo: 'Parquizado y Juegos',
    texto: 'Amplio parque verde que incluye sector de descanso y hamacas para disfrutar del entorno natural.',
  },
]

export default function Instalaciones() {
  return (
    <section id="instalaciones" className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Nuestras Instalaciones</h2>

      {/* Grid responsivo: 1 columna en celular, 2 en tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {instalaciones.map((item) => (
          <div key={item.titulo} className="rounded-xl overflow-hidden shadow-lg bg-white">
            <img
              src={item.img}
              alt={item.alt}
              className="w-full h-64 object-cover hover:scale-105 transition duration-500"
            />
            <div className="p-4">
              <h3 className="font-bold text-xl mb-2">{item.titulo}</h3>
              <p className="text-gray-600 text-sm">{item.texto}</p>
            </div>
          </div>
        ))}
        <div className="rounded-xl overflow-hidden shadow-lg bg-white flex flex-col justify-center items-center text-center p-8 border-2 border-dashed border-gray-300">
          <i className="fas fa-bath text-4xl text-blue-400 mb-4"></i>
          <h3 className="font-bold text-xl mb-2">Baño y Servicios Completos</h3>
          <p className="text-gray-600 text-sm">
            Todo lo necesario para pasar el día entero (de {HORARIO.replace(' hs', '')}) con total comodidad y privacidad.
          </p>
        </div>
      </div>
    </section>
  )
}
