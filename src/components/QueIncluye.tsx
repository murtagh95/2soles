import { HORARIO, INCLUYE } from '../config.ts'

export default function QueIncluye() {
  return (
    <section id="incluye" className="px-4 pb-16 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-gray-800">Qué incluye el alquiler</h2>
        <p className="text-center text-gray-600 mb-6">Todo el predio para tu grupo, de {HORARIO}.</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {INCLUYE.map((item) => (
            <li key={item} className="flex items-center gap-3 rounded-lg bg-green-50 px-4 py-3 text-gray-800 font-medium">
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 shrink-0 fill-green-700">
                <path d="M10 0a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.7 7.7-5.5 5.5a1 1 0 0 1-1.4 0l-2.5-2.5a1 1 0 1 1 1.4-1.4l1.8 1.8 4.8-4.8a1 1 0 1 1 1.4 1.4Z" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
