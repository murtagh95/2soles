import { useEffect, useRef, useState } from 'react'
import { IMAGENES } from '../config.ts'

export default function Tour360() {
  if (!IMAGENES.panorama360) return null
  return <Visor360 panorama={IMAGENES.panorama360} />
}

function Visor360({ panorama }: { panorama: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

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

  useEffect(() => {
    if (!visible || !containerRef.current) return
    let cancelado = false
    let viewer: { destroy: () => void } | null = null
    Promise.all([import('pannellum/build/pannellum.js'), import('pannellum/build/pannellum.css')]).then(() => {
      if (cancelado || !containerRef.current) return
      viewer = window.pannellum.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama,
        preview: IMAGENES.panorama360Preview,
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Recorré el lugar en 360°</h2>
          <p className="text-gray-400">Arrastrá la imagen para mirar alrededor.</p>
        </div>
        <div className="rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl relative w-full h-[300px] md:h-[500px]">
          <div ref={containerRef} className="w-full h-full"></div>
        </div>
      </div>
    </section>
  )
}
