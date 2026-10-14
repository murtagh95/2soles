declare module 'pannellum/build/pannellum.js'

interface PannellumViewer {
  destroy(): void
}

interface Window {
  pannellum: {
    viewer(container: HTMLElement | string, config: Record<string, unknown>): PannellumViewer
  }
}
