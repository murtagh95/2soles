export function mensajeErrorGuardado(e: unknown) {
  const codigo = (e as { code?: string }).code
  return codigo === 'permission-denied'
    ? 'Sin permiso para guardar. Revisá que las reglas de firestore.rules estén publicadas en Firebase y que el UID de abajo sea el ID de un documento en la colección "admins".'
    : `No se pudo guardar (${codigo ?? String(e)}).`
}
