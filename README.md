# Dos Soles

Landing de reservas: React + Vite + Tailwind, con disponibilidad real en Firebase (Firestore + Authentication).

```bash
pnpm install
pnpm dev       # http://localhost:5173  ·  panel admin en /admin
pnpm build
```

## Configurar Firebase (una sola vez, plan gratuito "Spark")

1. Crear un proyecto en https://console.firebase.google.com (Google Analytics no hace falta).
2. **Firestore Database** → Crear base de datos → modo producción → región `southamerica-east1`.
3. **Authentication** → Comenzar → habilitar **Correo electrónico/contraseña**.
   En la pestaña **Usuarios** → Agregar usuario → email y contraseña del admin. Copiar su **UID**.
4. **Firestore** → Iniciar colección `admins` → ID de documento = el UID del paso anterior
   (con cualquier campo, ej. `nombre: "Admin"`). Solo los UID de esta colección pueden reservar días.
5. **Configuración del proyecto** → Tus apps → agregar app **Web** → copiar los valores
   a `.env.local` (ver `.env.example`).
6. Publicar las reglas de seguridad de `firestore.rules`: pegarlas en Firestore → Reglas,
   o con la CLI: `pnpm dlx firebase-tools deploy --only firestore:rules`.

## Deploy (Cloudflare Workers, integración con GitHub)

El sitio es un Worker de solo archivos estáticos llamado `2soles` (https://2soles.nec-catalano.workers.dev).
La configuración está en `wrangler.jsonc`. Cada push a `main` lo vuelve a construir y publicar.

Configuración en Cloudflare → Workers & Pages → `2soles` → Settings → Build:

| Campo | Valor |
|---|---|
| Repositorio | `murtagh95/2soles`, rama `main` |
| Comando de build | `pnpm build:cloudflare` (tests unitarios + build; si un test falla, no se publica) |
| Comando de deploy | `npx wrangler deploy` |
| Variables de build | las 4 `VITE_FIREBASE_*` de `.env.local` (en *Build variables*, no en las variables del Worker) |

## Tests

```bash
pnpm test          # lógica de precios y fechas
pnpm test:reglas   # firestore.rules contra el emulador local (necesita Java 21: brew install openjdk@21)
pnpm test:prod     # chequea el Firebase real: reglas publicadas y registro de cuentas cerrado
pnpm test:todo     # los tres
```

Si cambiás `firestore.rules`, corré `pnpm test:reglas` antes de publicarlas en la consola, y `pnpm test:prod` después.

GitHub Actions (`.github/workflows/tests.yml`) corre lint, `pnpm test`, `pnpm test:reglas` y el build en cada push y PR.
`test:prod` no corre ahí porque necesita las credenciales de `.env.local`.

## Contenido que se edita a mano

- **Preguntas frecuentes:** `PREGUNTAS_FRECUENTES` en `src/config.ts`. Con la lista vacía, la sección no se muestra.
- **Feriados de respaldo:** `src/feriadosRespaldo.json` se usa si la API de feriados falla. Actualizarlo una vez por año
  con los datos de `https://api.argentinadatos.com/v1/feriados/<año>`.
- **SEO:** título, descripción, Open Graph y datos estructurados están en `index.html`. Si cambia el dominio,
  actualizar ahí, en `public/robots.txt`, y en `public/sitemap.xml`.
