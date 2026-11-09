import { useSyncExternalStore } from 'react'

const sinSuscripcion = () => () => {}

// false en el prerender y en la hidratación, true después. Sirve para lo que depende de la fecha de hoy,
// que en el build no es la misma que cuando alguien abre la página.
export function useMontado() {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  )
}
