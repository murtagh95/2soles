import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth'
import { useEffect, useState, type FormEvent } from 'react'
import AdminPrecios from './AdminPrecios.tsx'
import Calendario from './Calendario.tsx'
import { mensajeErrorGuardado } from './errorGuardado.ts'
import { claveFecha } from '../fechas.ts'
import { auth } from '../auth.ts'
import { firebaseConfigurado } from '../firebase.ts'
import { useFeriados } from '../useFeriados.ts'
import { marcarOcupado, useOcupados } from '../useOcupados.ts'

export default function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [cargando, setCargando] = useState(firebaseConfigurado)

  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setCargando(false)
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">Dos Soles · Admin</h1>
          <a href="/" className="text-sm text-gray-500 hover:text-green-600">Ver sitio</a>
        </div>
        {!firebaseConfigurado ? (
          <p className="text-sm text-red-600">
            Firebase no está configurado. Completá las variables <code>VITE_FIREBASE_*</code> en <code>.env.local</code>.
          </p>
        ) : cargando ? (
          <p className="text-gray-500">Cargando...</p>
        ) : user ? (
          <Panel user={user} />
        ) : (
          <Login />
        )}
      </div>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function ingresar(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await signInWithEmailAndPassword(auth!, email, password)
    } catch {
      setError('Email o contraseña incorrectos.')
    }
  }

  return (
    <form onSubmit={ingresar} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg">Ingresar</button>
    </form>
  )
}

type Pestania = 'reservas' | 'precios'

function Panel({ user }: { user: User }) {
  const [pestania, setPestania] = useState<Pestania>('reservas')

  const clasePestania = (p: Pestania) =>
    `flex-1 py-2 text-sm font-bold rounded-md transition ${
      pestania === p ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'
    }`

  return (
    <>
      <div className="flex gap-1 p-1 mb-6 bg-gray-100 rounded-lg">
        <button onClick={() => setPestania('reservas')} className={clasePestania('reservas')}>
          <i className="fas fa-calendar-check mr-2"></i>Reservas
        </button>
        <button onClick={() => setPestania('precios')} className={clasePestania('precios')}>
          <i className="fas fa-tag mr-2"></i>Precios
        </button>
      </div>
      {pestania === 'reservas' ? <PanelReservas /> : <AdminPrecios />}
      <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm text-gray-500">
        <span>
          {user.email}
          <br />
          <span className="text-xs text-gray-400 select-all">UID: {user.uid}</span>
        </span>
        <button onClick={() => signOut(auth!)} className="hover:text-red-600">Cerrar sesión</button>
      </div>
    </>
  )
}

function PanelReservas() {
  const { ocupados, error } = useOcupados()
  const feriados = useFeriados()
  const [guardando, setGuardando] = useState<string | null>(null)
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null)
  const [hoy] = useState(() => new Date())

  async function alternar(fecha: Date) {
    const clave = claveFecha(fecha)
    setGuardando(clave)
    setErrorGuardado(null)
    try {
      await marcarOcupado(clave, !ocupados.has(clave))
    } catch (e) {
      setErrorGuardado(mensajeErrorGuardado(e))
    } finally {
      setGuardando(null)
    }
  }

  return (
    <>
      <p className="text-sm text-gray-600 mb-4">
        Tocá un día para marcarlo como reservado; tocalo de nuevo para liberarlo.
      </p>
      <Calendario mesInicial={hoy} ocupados={ocupados} feriados={feriados} onSelect={alternar} permitirOcupados />
      <div className="mt-4 min-h-5 text-sm">
        {guardando && <p className="text-gray-500">Guardando {guardando}...</p>}
        {(error || errorGuardado) && <p className="text-red-600">{errorGuardado ?? error}</p>}
      </div>
    </>
  )
}
