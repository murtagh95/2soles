import { useState } from 'react'
import { claveFecha, esPasado } from '../fechas.ts'
import { formatearPrecioCorto } from '../precios.ts'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']

type Props = {
  mesInicial: Date
  ocupados: Set<string>
  onSelect: (fecha: Date) => void
  // Días elegidos, por clave YYYY-MM-DD
  seleccionados?: Set<string>
  // Vista pública: tocar un día ocupado avisa en vez de no hacer nada
  onOcupado?: (fecha: Date) => void
  // Precio de cada día, para mostrarlo abreviado debajo del número
  precioDe?: (fecha: Date) => number
  // En el panel de admin los días ocupados se pueden clickear para liberarlos
  permitirOcupados?: boolean
  // Fecha YYYY-MM-DD → nombre del feriado
  feriados?: Map<string, string>
  // Días resaltados con un borde (en el admin: los que tienen precio especial)
  destacados?: Set<string>
  leyendaDestacados?: string
}

export default function Calendario({
  mesInicial,
  ocupados,
  onSelect,
  seleccionados = new Set(),
  onOcupado,
  precioDe,
  permitirOcupados = false,
  feriados = new Map(),
  destacados = new Set(),
  leyendaDestacados,
}: Props) {
  const [currentDate, setCurrentDate] = useState(
    () => new Date(mesInicial.getFullYear(), mesInicial.getMonth(), 1),
  )

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cambiarMes = (delta: number) => setCurrentDate(new Date(year, month + delta, 1))

  // Cantidades del mes que se está viendo, para la leyenda
  const prefijoMes = claveFecha(currentDate).slice(0, 8)
  const contarEnMes = (claves: Iterable<string>) => [...claves].filter((c) => c.startsWith(prefijoMes)).length
  const ocupadosMes = contarEnMes(ocupados)
  const feriadosMes = contarEnMes(feriados.keys())
  const destacadosMes = contarEnMes(destacados)

  function claseDia(fecha: Date) {
    if (seleccionados.has(claveFecha(fecha))) return 'bg-green-700 text-white shadow-md'
    if (ocupados.has(claveFecha(fecha))) {
      return permitirOcupados
        ? 'bg-red-500 text-white hover:bg-red-600'
        : 'bg-red-100 text-red-700 line-through cursor-help'
    }
    if (esPasado(fecha)) return 'text-gray-300 cursor-not-allowed'
    if (feriados.has(claveFecha(fecha))) return 'bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold'
    return 'hover:bg-gray-200 text-gray-700'
  }

  function descripcionDia(clave: string, ocupado: boolean) {
    const partes = [feriados.get(clave), ocupado ? (permitirOcupados ? 'Reservado' : 'No disponible') : undefined]
    return partes.filter(Boolean).join(' · ') || undefined
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => cambiarMes(-1)}
          aria-label="Mes anterior"
          className="h-11 w-11 bg-white rounded-full shadow hover:bg-gray-100 text-lg"
        >
          &lt;
        </button>
        <h4 className="font-bold text-lg capitalize">
          {MESES[month]} {year}
        </h4>
        <button
          onClick={() => cambiarMes(1)}
          aria-label="Mes siguiente"
          className="h-11 w-11 bg-white rounded-full shadow hover:bg-gray-100 text-lg"
        >
          &gt;
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2 font-bold text-gray-500">
        {DIAS_SEMANA.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`vacio-${i}`}></div>
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((dia) => {
          const fecha = new Date(year, month, dia)
          const clave = claveFecha(fecha)
          const ocupado = ocupados.has(clave)
          const pasado = esPasado(fecha)
          // Un ocupado se puede tocar si hay onOcupado (para avisar), pero no se elige
          const bloqueado = ocupado && !permitirOcupados
          const precio = precioDe && !pasado && !ocupado ? precioDe(fecha) : undefined
          return (
            <div key={dia}>
              <button
                onClick={() => (bloqueado ? onOcupado?.(fecha) : onSelect(fecha))}
                disabled={pasado || (bloqueado && !onOcupado)}
                aria-disabled={bloqueado || undefined}
                aria-pressed={seleccionados.has(clave) || undefined}
                title={descripcionDia(clave, ocupado)}
                className={`w-11 ${precio !== undefined ? 'h-12 rounded-xl' : 'h-11 rounded-full'} mx-auto transition flex flex-col items-center justify-center leading-none ${claseDia(fecha)} ${
                  destacados.has(clave) ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                {dia}
                {precio !== undefined && <span className="mt-1 text-[10px] font-normal opacity-80">{formatearPrecioCorto(precio)}</span>}
              </button>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs text-gray-500">
        {!permitirOcupados && <ItemLeyenda clase="bg-green-700" texto="Elegidos" />}
        <ItemLeyenda
          clase={permitirOcupados ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}
          cantidad={ocupadosMes}
          texto={permitirOcupados ? 'Reservados' : 'No disponibles'}
        />
        <ItemLeyenda clase="bg-orange-50 text-orange-800" cantidad={feriadosMes} texto="Feriados" />
        {leyendaDestacados && (
          <ItemLeyenda clase="ring-2 ring-yellow-400 text-gray-700" cantidad={destacadosMes} texto={leyendaDestacados} />
        )}
      </div>
    </>
  )
}

// Muestra cómo se ve cada tipo de día y, si corresponde, cuántos hay en el mes
function ItemLeyenda({ clase, texto, cantidad }: { clase: string; texto: string; cantidad?: number }) {
  return (
    <span className="flex items-center gap-1">
      <span
        className={`flex items-center justify-center rounded-full font-bold ${cantidad === undefined ? 'w-3 h-3' : 'w-5 h-5 text-[10px]'} ${clase}`}
      >
        {cantidad}
      </span>
      {texto}
    </span>
  )
}
