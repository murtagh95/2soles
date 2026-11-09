import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.tsx'

// Lo usa scripts/prerender.mjs en el build para que index.html ya traiga la página armada
export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
