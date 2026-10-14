import { useEffect, useRef } from 'react'
import 'pannellum/build/pannellum.css'
import 'pannellum/build/pannellum.js'
import { IMAGENES } from '../config.ts'

export default function Tour360() {
  if (!IMAGENES.panorama360) return null
  return <Visor360 panorama={IMAGENES.panorama360} />
}

function Visor360({ panorama }: { panorama: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const viewer = window.pannellum.viewer(containerRef.current, {
      type: 'equirectangular',
      panorama,
      autoLoad: true,
      showControls: false,
    })
    return () => viewer.destroy()
  }, [panorama])

  return (
    <section id="tour360" className="py-16 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Recorré el lugar en 360°</h2>
          <p className="text-gray-400">Arrastrá la imagen para mirar alrededor. Capturado con DJI Mini 3 Pro.</p>
        </div>
        <div className="rounded-xl overflow-hidden border-4 border-gray-700 shadow-2xl relative w-full h-[300px] md:h-[500px]">
          <div ref={containerRef} className="w-full h-full"></div>
        </div>
      </div>
    </section>
  )
}
