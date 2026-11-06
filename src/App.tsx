import { lazy, Suspense } from 'react'
import Footer from './components/Footer.tsx'
import Galeria from './components/Galeria.tsx'
import Hero from './components/Hero.tsx'
import Instalaciones from './components/Instalaciones.tsx'
import Navbar from './components/Navbar.tsx'
import BotonWhatsApp from './components/BotonWhatsApp.tsx'
import NoEncontrado from './components/NoEncontrado.tsx'
import PreguntasFrecuentes from './components/PreguntasFrecuentes.tsx'
import Reserva from './components/Reserva.tsx'
import Tour360 from './components/Tour360.tsx'
import Ubicacion from './components/Ubicacion.tsx'

// El panel de admin (y Firebase Auth) se carga solo al entrar a /admin
const Admin = lazy(() => import('./components/Admin.tsx'))

export default function App() {
  const ruta = window.location.pathname.replace(/\/$/, '')
  if (ruta === '/admin')
    return (
      <Suspense>
        <Admin />
      </Suspense>
    )
  // Cloudflare devuelve index.html para cualquier ruta (así anda /admin), así que el 404 se resuelve acá
  if (ruta !== '') return <NoEncontrado />

  return (
    <>
      <Navbar />
      <Hero />
      <Instalaciones />
      <Galeria />
      <Tour360 />
      <Reserva />
      <PreguntasFrecuentes />
      <Ubicacion />
      <Footer />
      <BotonWhatsApp />
    </>
  )
}
