import { HORARIO, IMAGENES } from '../config.ts'

export default function Hero() {
  return (
    <header className="relative bg-gray-900 h-[60vh] md:h-[70vh] flex items-center justify-center">
      <img
        src={IMAGENES.portada}
        alt="Pileta al aire libre"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="relative z-10 text-center px-4 max-w-3xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
          Tu día perfecto al aire libre
        </h1>
        <p className="text-lg md:text-xl text-white mb-6 drop-shadow-md">
          Disfrutá de nuestro parquizado, pileta, quincho y churrasquera. Un espacio exclusivo para vos y los tuyos.
        </p>
        <div className="inline-block bg-yellow-400 text-yellow-900 font-bold px-6 py-3 rounded-full shadow-lg text-lg mb-6">
          <i className="far fa-clock mr-2"></i> Horario de alquiler: {HORARIO}
        </div>
        <br />
        <a
          href="#reservar"
          className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-lg transition shadow-xl transform hover:scale-105"
        >
          Ver disponibilidad
        </a>
      </div>
    </header>
  )
}
