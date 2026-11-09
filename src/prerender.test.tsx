import { describe, expect, test } from 'vitest'
import { render } from './prerender.tsx'

// El build arma la home en Node (sin navegador): si un componente usa window o document al renderizar, esto falla
describe('prerender de la home', () => {
  test('se puede renderizar sin navegador y trae el contenido para Google', () => {
    const html = render()
    expect(html).toContain('<h1')
    expect(html).toContain('Rodeo del Medio')
    expect(html).toContain('id="galeria"')
  })

  test('no incluye el calendario, que depende de la fecha en que se abre la página', () => {
    expect(render()).not.toMatch(/<h4[^>]*>(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre) \d{4}/)
  })
})
