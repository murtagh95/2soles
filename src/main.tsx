import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const contenedor = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)

// index.html trae la home ya armada (prerender del build): en la home React la reutiliza en vez de redibujarla.
// En /admin y en rutas desconocidas ese HTML no corresponde, así que se descarta.
if (window.location.pathname.replace(/\/$/, '') === '') {
  hydrateRoot(contenedor, app)
} else {
  contenedor.replaceChildren()
  createRoot(contenedor).render(app)
}
