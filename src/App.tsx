import { lazy, Suspense } from 'react'
import Footer from './components/Footer.tsx'
import Hero from './components/Hero.tsx'
import Instalaciones from './components/Instalaciones.tsx'
import Navbar from './components/Navbar.tsx'
import Reserva from './components/Reserva.tsx'
import Tour360 from './components/Tour360.tsx'
import Ubicacion from './components/Ubicacion.tsx'

// El panel de admin (y Firebase Auth) se carga solo al entrar a /admin
const Admin = lazy(() => import('./components/Admin.tsx'))

export default function App() {
  if (window.location.pathname.replace(/\/$/, '') === '/admin') return (
      <Suspense>
        <Admin />
      </Suspense>
    )

  return (
    <>
      <Navbar />
      <Hero />
      <Instalaciones />
      <Tour360 />
      <Reserva />
      <Ubicacion />
      <Footer />
    </>
  )
}
