export function mensajeErrorGuardado(e: unknown) {
  const codigo = (e as { code?: string }).code
  return codigo === 'permission-denied'
    ? 'Sin permiso para guardar: el UID de abajo tiene que ser el ID de un documento en la colección "admins".'
    : `No se pudo guardar (${codigo ?? String(e)}).`
}
