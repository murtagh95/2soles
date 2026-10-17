export default function NoEncontrado() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Página no encontrada</h1>
      <p className="text-gray-600 mb-6">La dirección que abriste no existe.</p>
      <a href="/" className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full">
        Ir al inicio
      </a>
    </main>
  )
}
