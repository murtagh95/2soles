// Inserta el HTML de la home en dist/index.html. Así Google y el navegador ven el contenido
// sin esperar a que cargue el JavaScript; después React reemplaza ese HTML (createRoot en main.tsx).
import { readFileSync, rmSync, writeFileSync } from 'node:fs'

const { render } = await import(new URL('../dist-ssr/prerender.js', import.meta.url).href)
const archivo = new URL('../dist/index.html', import.meta.url)
const html = readFileSync(archivo, 'utf8')
const marcador = '<div id="root"></div>'
if (!html.includes(marcador)) throw new Error(`No se encontró ${marcador} en dist/index.html`)

writeFileSync(archivo, html.replace(marcador, `<div id="root">${render()}</div>`))
rmSync(new URL('../dist-ssr', import.meta.url), { recursive: true, force: true })
console.log('Prerender listo: dist/index.html')
