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

El sitio es un Worker de solo archivos estáticos llamado `2soles` (https://2soles.mysavia.app).
La configuración está en `wrangler.jsonc`. Cada push a `main` lo vuelve a construir y publicar.

Configuración en Cloudflare → Workers & Pages → `2soles` → Settings → Build:

| Campo | Valor |
|---|---|
| Repositorio | `murtagh95/2soles`, rama `main` |
| Comando de build | `pnpm build:cloudflare` (tests unitarios + build; si un test falla, no se publica) |
| Comando de deploy | `npx wrangler deploy` |
| Variables de build | las 4 `VITE_FIREBASE_*` de `.env.local` (en *Build variables*, no en las variables del Worker) |

**Prerender:** `pnpm build` arma la home en Node (`src/prerender.tsx` + `scripts/prerender.mjs`) y la deja escrita en
`dist/index.html`, así Google y el navegador ven el contenido sin esperar al JavaScript. Ningún componente puede usar
`window` ni `document` durante el render (solo dentro de `useEffect`); lo que depende de la fecha de hoy se dibuja
después de montar (`useMontado`).

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
  con `pnpm feriados:actualizar`, que baja el año actual y el siguiente.
- **SEO:** título, descripción, Open Graph y datos estructurados están en `index.html`. Si cambia el dominio,
  actualizar ahí, en `public/robots.txt`, y en `public/sitemap.xml`.

## Seguridad

- **Encabezados HTTP:** `public/_headers` define la CSP y los encabezados de seguridad que aplica Cloudflare. Si se agrega
  un servicio externo nuevo (analytics, otro mapa), hay que sumar su dominio a la CSP. Para probarlos local:
  `pnpm build && npx wrangler dev`.
- **App Check (opcional, recomendado):** hace que Firestore acepte solo pedidos de este sitio.
  1. Google Cloud (proyecto `dossoles-5002a`) → reCAPTCHA → crear clave web para `2soles.mysavia.app` y `localhost`.
  2. Firebase → App Check → registrar la app web con esa clave (proveedor reCAPTCHA Enterprise).
  3. Cargar `VITE_RECAPTCHA_ENTERPRISE_KEY` en `.env.local` y como build variable en Cloudflare, y publicar.
  4. Mirar unos días en Firebase → App Check que las solicitudes salgan verificadas; después, **Exigir** para Cloud Firestore.
  5. Poner `APP_CHECK_EXIGIDO=1` en `.env.local`: `pnpm test:prod` pasa a confirmar que sin token no se puede leer.
  Para `pnpm dev` con App Check, registrar un token de depuración en App Check → Administrar tokens de depuración y
  ponerlo en `VITE_APPCHECK_DEBUG_TOKEN`.
- **Clave de API:** Google Cloud → Credenciales → Browser key → restringir a los sitios `https://2soles.mysavia.app/*` y
  `http://localhost:5173/*`.
- **Login:** Firebase Authentication → Configuración → activar la protección contra enumeración de emails.
- **Dependencias:** Dependabot (`.github/dependabot.yml`) abre un PR por semana con las actualizaciones menores, y el CI
  falla si `pnpm audit --prod` encuentra algo alto o crítico. Los `pnpm.overrides` de `package.json` fuerzan versiones
  corregidas de dependencias internas de Firebase; cuando Firebase las actualice, se pueden borrar.
