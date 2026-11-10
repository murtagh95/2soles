import { OPINIONES, UBICACION } from '../config.ts'

function Estrellas({ cantidad, className = '' }: { cantidad: number; className?: string }) {
  const llenas = Math.round(cantidad)
  return (
    <span className={`text-yellow-500 ${className}`} role="img" aria-label={`${cantidad} de 5 estrellas`}>
      {'★'.repeat(llenas)}
      <span className="text-gray-300">{'★'.repeat(5 - llenas)}</span>
    </span>
  )
}

const claseBoton = 'inline-flex items-center justify-center font-bold px-6 py-3 rounded-full shadow transition'

// Las opiniones viven en Google Maps: acá se muestra el puntaje, algunas copiadas a mano y el link a la ficha
export default function Opiniones() {
  const { promedio, cantidad, lista } = OPINIONES
  return (
    <section id="opiniones" className="py-16 px-4 max-w-5xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Lo que dicen quienes vinieron</h2>
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-gray-700 mb-8">
        <span className="text-4xl font-extrabold text-gray-800">{promedio.toLocaleString('es-AR', { minimumFractionDigits: 1 })}</span>
        <Estrellas cantidad={promedio} className="text-3xl" />
        <span>{cantidad ? `${cantidad} opiniones en Google Maps` : 'en Google Maps'}</span>
      </p>

      {/* En celular, carrusel horizontal que se desliza con el dedo; desde tablet, grilla */}
      {lista.length > 0 && (
        <div className="-mx-4 px-4 mb-8 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 text-left md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible">
          {lista.map((o) => (
            <figure
              key={o.autor + o.texto}
              className="bg-white rounded-xl shadow p-5 flex flex-col shrink-0 basis-[85%] snap-center md:basis-auto"
            >
              <Estrellas cantidad={o.estrellas} />
              <blockquote className="mt-2 text-gray-700 text-sm flex-1">“{o.texto}”</blockquote>
              <figcaption className="mt-3 text-sm font-bold text-gray-800">{o.autor}</figcaption>
            </figure>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <a
          href={UBICACION.linkFicha}
          target="_blank"
          rel="noopener noreferrer"
          className={`${claseBoton} bg-white text-gray-800 hover:bg-gray-100 border border-gray-300`}
        >
          Ver todas las opiniones
        </a>
        <a
          href={UBICACION.linkFicha}
          target="_blank"
          rel="noopener noreferrer"
          className={`${claseBoton} bg-green-700 text-white hover:bg-green-800`}
        >
          ¿Ya viniste? Dejá tu opinión
        </a>
      </div>
    </section>
  )
}
