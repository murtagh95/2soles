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
