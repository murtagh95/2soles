// Baja de la API los feriados del año actual y el siguiente y los guarda en src/feriadosRespaldo.json,
// la copia que usa el sitio si la API falla. Correr una vez por año: pnpm feriados:actualizar
import { writeFileSync } from 'node:fs'

const anio = new Date().getFullYear()
const anios = await Promise.all(
  [anio, anio + 1].map(async (a) => {
    const r = await fetch(`https://api.argentinadatos.com/v1/feriados/${a}`)
    if (!r.ok) throw new Error(`La API respondió ${r.status} para ${a}`)
    const lista = await r.json()
    if (lista.length === 0) throw new Error(`La API todavía no tiene feriados de ${a}`)
    return lista.map(({ fecha, nombre }) => ({ fecha, nombre }))
  }),
)
writeFileSync(new URL('../src/feriadosRespaldo.json', import.meta.url), JSON.stringify(anios.flat(), null, 2) + '\n')
console.log(`Feriados guardados: ${anio} (${anios[0].length}) y ${anio + 1} (${anios[1].length})`)
