// Clave de un día en formato YYYY-MM-DD (hora local), usada como ID del documento en Firestore
export function claveFecha(fecha: Date) {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function esPasado(fecha: Date) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return fecha < hoy
}

// Primer día libre después de `desde`, salteando ocupados y pasados. null si no hay en `maxDias`.
export function proximoLibre(desde: Date, ocupados: Set<string>, maxDias = 90) {
  for (let i = 1; i <= maxDias; i++) {
    const fecha = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate() + i)
    if (!esPasado(fecha) && !ocupados.has(claveFecha(fecha))) return fecha
  }
  return null
}

// "sábado 14 de noviembre"
export function formatearDia(fecha: Date) {
  return fecha.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}
