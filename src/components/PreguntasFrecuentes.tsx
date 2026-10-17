import { PREGUNTAS_FRECUENTES } from '../config.ts'

// Datos estructurados para que Google pueda mostrar las preguntas en el resultado de búsqueda
const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PREGUNTAS_FRECUENTES.map((p) => ({
    '@type': 'Question',
    name: p.pregunta,
    acceptedAnswer: { '@type': 'Answer', text: p.respuesta },
  })),
})

export default function PreguntasFrecuentes() {
  if (PREGUNTAS_FRECUENTES.length === 0) return null
  return (
    <section id="preguntas" className="py-16 px-4 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Preguntas frecuentes</h2>
      <div className="space-y-3">
        {PREGUNTAS_FRECUENTES.map((p) => (
          <details key={p.pregunta} className="group rounded-xl bg-white shadow p-4">
            <summary className="cursor-pointer font-bold list-none flex justify-between items-center">
              {p.pregunta}
              <span className="text-green-600 transition group-open:rotate-45 text-xl leading-none">+</span>
            </summary>
            <p className="mt-3 text-gray-600 text-sm">{p.respuesta}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json">{jsonLd}</script>
    </section>
  )
}
