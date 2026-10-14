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

## Deploy (opcional, gratis en Firebase Hosting)

```bash
pnpm build
pnpm dlx firebase-tools login
pnpm dlx firebase-tools use --add      # elegir el proyecto
pnpm dlx firebase-tools deploy
```

## Tests

```bash
pnpm test          # lógica de precios y fechas
pnpm test:reglas   # firestore.rules contra el emulador local (necesita Java 21: brew install openjdk@21)
pnpm test:prod     # chequea el Firebase real: reglas publicadas y registro de cuentas cerrado
pnpm test:todo     # los tres
```

Si cambiás `firestore.rules`, corré `pnpm test:reglas` antes de publicarlas en la consola, y `pnpm test:prod` después.
