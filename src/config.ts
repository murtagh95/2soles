// CONFIGURACIÓN: número de teléfono con código de país y área, sin + ni espacios
export const TELEFONO_WHATSAPP = '5492612528971'

export const HORARIO = '10:30 a 19:30 hs'

// Precios que se usan hasta que se carguen desde el panel de admin (/admin → Precios)
export const PRECIOS_POR_DEFECTO = {
  semana: 35000,
  finDeSemanaYFeriado: 50000,
  especiales: {},
}

export const IMAGENES = {
  // Ancho y alto reales de cada archivo, para que el navegador reserve el espacio antes de cargarlas
  portada: { src: '/images/portada.webp', ancho: 1600, alto: 1092 },
  quincho: { src: '/images/quincho.webp', ancho: 1200, alto: 863 },
  pileta: { src: '/images/pileta.webp', ancho: 1200, alto: 652 },
  parque: { src: '/images/parque.webp', ancho: 1200, alto: 617 },
  // Imagen equirectangular tomada con el DJI (ej. '/images/panorama360.jpg').
  // Mientras sea null, la sección Tour 360° no se muestra.
  panorama360: '/images/3D527256-3393-4AA1-AB3D-8E5948BA1FBB_1_105_c.jpeg' as string | null,
}

export const UBICACION = {
  direccion: 'Ceferino de tierra 544, Maipú, Mendoza',
  // Coordenadas: -33.036916, -68.745626
  linkGoogleMaps: 'https://maps.app.goo.gl/t2wiiPA7AunoAm3o6',
  // Google Maps → Compartir → Incorporar un mapa → copiar el src del iframe
  embedMapa:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1055.024594571245!2d-68.74652403033518!3d-33.03745557407982!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e72f5fd94bb35%3A0x90cbcf2457a4bfd!2sCeferino%20de%20tierra%20544%2C%20Mendoza!5e1!3m2!1ses-419!2sar!4v1791991926820!5m2!1ses-419!2sar',
}

// Preguntas frecuentes. Mientras la lista esté vacía, la sección no se muestra.
// Ejemplo: { pregunta: '¿Cuántas personas entran?', respuesta: 'Hasta 30 personas.' },
export const PREGUNTAS_FRECUENTES: { pregunta: string; respuesta: string }[] = []
