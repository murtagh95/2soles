import { HORARIO } from '../config.ts'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
      <p>Dos Soles &copy; 2026 - Todos los derechos reservados.</p>
      <p className="mt-2">Horario de atención: {HORARIO}</p>
    </footer>
  )
}
