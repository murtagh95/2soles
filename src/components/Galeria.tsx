import { GALERIA } from '../config.ts'

export default function Galeria() {
  return (
    <section id="galeria" className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Galería</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {GALERIA.map((foto) => (
          <a key={foto.src} href={foto.src} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden shadow">
            <img
              src={foto.src}
              alt={foto.alt}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="w-full aspect-[4/3] object-cover hover:scale-105 transition duration-500"
            />
          </a>
        ))}
      </div>
    </section>
  )
}
