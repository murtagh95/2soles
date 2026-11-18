import { useEffect, useRef, useState } from 'react'
import { PANORAMAS } from '../config.ts'

type Panorama = (typeof PANORAMAS)[number]

export default function Tour360() {
  if (PANORAMAS.length === 0) return null
  return <Visor360 panoramas={PANORAMAS} />
}

function Visor360({ panoramas }: { panoramas: Panorama[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [elegido, setElegido] = useState(0)
  const panorama = panoramas[elegido]

  // El visor y la foto 360 se descargan recién cuando la sección está por aparecer en pantalla,
  // para no demorar la carga inicial de la página
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Al cambiar de foto se arma un visor nuevo: mientras baja la grande se ve la versión liviana
  useEffect(() => {
    if (!visible || !containerRef.current) return
    let cancelado = false
    let viewer: { destroy: () => void } | null = null
    Promise.all([import('pannellum/build/pannellum.js'), import('pannellum/build/pannellum.css')]).then(() => {
      if (cancelado || !containerRef.current) return
      viewer = window.pannellum.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama: panorama.src,
        preview: panorama.preview,
        autoLoad: true,
        showControls: false,
      })
    })
    return () => {
      cancelado = true
      viewer?.destroy()
    }
  }, [visible, panorama])

  return (
    <section id="tour360" className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Recorré el lugar en 360°</h2>
          <p className="text-gray-400">Arrastrá la imagen para mirar alrededor.</p>
        </div>
        {panoramas.length > 1 && (
          <div role="group" aria-label="Elegí qué parte del lugar ver" className="flex justify-center gap-2 mb-4">
            {panoramas.map((p, i) => (
              <button
                key={p.src}
                onClick={() => setElegido(i)}
                aria-pressed={i === elegido}
                className={`px-5 py-2 rounded-full font-bold text-sm transition ${
                  i === elegido ? 'bg-green-600 text-white shadow' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {p.nombre}
              </button>
            ))}
          </div>
        )}
        <div className="rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl relative w-full h-[300px] md:h-[500px]">
          <div ref={containerRef} className="w-full h-full" aria-label={`Foto 360°: ${panorama.nombre}`}></div>
        </div>
      </div>
    </section>
  )
}
