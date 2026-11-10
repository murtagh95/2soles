import { useEffect, useState } from 'react'
import { linkWhatsApp } from '../whatsapp.ts'
import Icono from './Icono.tsx'

const MENSAJE = '¡Hola! Vi la página de Dos Soles y quería hacer una consulta.'

// Siempre visible abajo a la derecha, salvo sobre la reserva y el pie, que ya tienen su propio botón de WhatsApp
export default function BotonWhatsApp() {
  const [oculto, setOculto] = useState(false)

  useEffect(() => {
    const secciones = [document.getElementById('reservar'), document.querySelector('footer')].filter(
      (el): el is HTMLElement => el !== null,
    )
    const visibles = new Set<Element>()
    const observer = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) visibles.add(e.target)
        else visibles.delete(e.target)
      }
      setOculto(visibles.size > 0)
    })
    secciones.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  return (
    <a
      href={linkWhatsApp(MENSAJE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      aria-hidden={oculto || undefined}
      tabIndex={oculto ? -1 : undefined}
      className={`fixed bottom-4 right-4 md:bottom-5 md:right-5 z-40 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-green-600 text-2xl md:text-3xl text-white shadow-xl transition duration-300 hover:scale-110 hover:bg-green-700 ${
        oculto ? 'pointer-events-none translate-y-20 opacity-0' : ''
      }`}
    >
      <Icono nombre="whatsapp" />
    </a>
  )
}
