import { HORARIO, IMAGENES } from '../config.ts'
import Icono from './Icono.tsx'

const instalaciones = [
  {
    img: IMAGENES.quincho,
    alt: 'Interior del quincho techado mirando al parque',
    titulo: 'Quincho Techado',
    texto: 'Amplio espacio bajo techo con piso de cemento, abierto al parque: el lugar para el asado y la mesa larga.',
  },
  {
    img: IMAGENES.pileta,
    alt: 'Pileta cercada en el parque',
    titulo: 'Pileta Exclusiva',
    texto: 'Pileta cercada en medio del parque, para refrescarse en verano con los chicos a resguardo.',
  },
  {
    img: IMAGENES.parque,
    alt: 'Sube y baja en el parque',
    titulo: 'Parquizado y Juegos',
    texto: 'Parque verde con olivos y juegos para los chicos, rodeado de álamos y con mucho lugar para correr.',
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
              src={item.img.src}
              width={item.img.ancho}
              height={item.img.alto}
              loading="lazy"
              decoding="async"
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
          <Icono nombre="banio" className="text-4xl text-blue-400 mb-4" />
          <h3 className="font-bold text-xl mb-2">Baño y Servicios Completos</h3>
          <p className="text-gray-600 text-sm">
            Todo lo necesario para pasar el día entero (de {HORARIO.replace(' hs', '')}) con total comodidad y privacidad.
          </p>
        </div>
      </div>
    </section>
  )
}
