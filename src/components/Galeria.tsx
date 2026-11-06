import { useEffect, useRef, useState, type TouchEvent } from 'react'
import { GALERIA } from '../config.ts'

export default function Galeria() {
  const [abierta, setAbierta] = useState<number | null>(null)

  return (
    <section id="galeria" className="py-16 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">Galería</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {GALERIA.map((foto, i) => (
          <button
            key={foto.src}
            onClick={() => setAbierta(i)}
            aria-label={`Ampliar foto: ${foto.alt}`}
            className="block rounded-lg overflow-hidden shadow cursor-zoom-in focus:outline-none focus:ring-4 focus:ring-green-500"
          >
            <img
              src={foto.src}
              alt={foto.alt}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="w-full aspect-[4/3] object-cover hover:scale-105 transition duration-500"
            />
          </button>
        ))}
      </div>
      {abierta !== null && <Visor indice={abierta} onCambiar={setAbierta} onCerrar={() => setAbierta(null)} />}
    </section>
  )
}

type PropsVisor = { indice: number; onCambiar: (i: number) => void; onCerrar: () => void }

function Visor({ indice, onCambiar, onCerrar }: PropsVisor) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const inicioToque = useRef<number | null>(null)
  const total = GALERIA.length
  const foto = GALERIA[indice]
  const mover = (delta: number) => onCambiar((indice + delta + total) % total)

  // showModal bloquea el scroll de fondo, atrapa el foco y cierra con Escape.
  // No se llama a close() al desmontar: dispararía onClose y, con el doble montaje de StrictMode, cerraría el visor apenas se abre.
  useEffect(() => {
    const d = dialogo.current
    if (d && !d.open) d.showModal()
  }, [])

  useEffect(() => {
    function teclas(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') onCambiar((indice + 1) % total)
      if (e.key === 'ArrowLeft') onCambiar((indice - 1 + total) % total)
    }
    window.addEventListener('keydown', teclas)
    return () => window.removeEventListener('keydown', teclas)
  }, [indice, total, onCambiar])

  // En el celular se pasa de foto deslizando el dedo
  function finToque(e: TouchEvent) {
    if (inicioToque.current === null) return
    const distancia = e.changedTouches[0].clientX - inicioToque.current
    if (Math.abs(distancia) > 50) mover(distancia < 0 ? 1 : -1)
    inicioToque.current = null
  }

  const claseFlecha =
    'absolute top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white text-3xl leading-none hover:bg-black/70 flex items-center justify-center'

  return (
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
      onTouchStart={(e) => (inicioToque.current = e.touches[0].clientX)}
      onTouchEnd={finToque}
      aria-label="Galería de fotos"
      className="m-0 h-full max-h-none w-full max-w-none bg-black/90 p-0 backdrop:bg-black/60"
    >
      <div className="relative flex h-full w-full items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
        <img src={foto.src} alt={foto.alt} className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl" />
        <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/80">
          {foto.alt} · {indice + 1} de {total}
        </p>
        <button onClick={() => mover(-1)} aria-label="Foto anterior" className={`${claseFlecha} left-3`}>
          ‹
        </button>
        <button onClick={() => mover(1)} aria-label="Foto siguiente" className={`${claseFlecha} right-3`}>
          ›
        </button>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="absolute top-3 right-3 h-11 w-11 rounded-full bg-black/50 text-white text-2xl leading-none hover:bg-black/70"
        >
          ×
        </button>
      </div>
    </dialog>
  )
}
