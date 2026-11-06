// CONFIGURACIÓN: número de teléfono con código de país y área, sin + ni espacios
export const TELEFONO_WHATSAPP = '5492612528971'

export const HORARIO = '10:30 a 19:30 hs'

// Precios que se usan hasta que se carguen desde el panel de admin (/admin → Precios)
export const PRECIOS_POR_DEFECTO = {
  semana: 100000,
  finDeSemanaYFeriado: 120000,
  especiales: {},
}

export const IMAGENES = {
  // Ancho y alto reales de cada archivo, para que el navegador reserve el espacio antes de cargarlas
  portada: { src: '/images/portada.webp', ancho: 1024, alto: 768 },
  quincho: { src: '/images/quincho.webp', ancho: 1024, alto: 768 },
  pileta: { src: '/images/pileta.webp', ancho: 1024, alto: 768 },
  parque: { src: '/images/parque.webp', ancho: 1024, alto: 768 },
  // Imagen equirectangular tomada con el DJI (ej. '/images/panorama360.jpg').
  // Mientras sea null, la sección Tour 360° no se muestra.
  panorama360: '/images/3D527256-3393-4AA1-AB3D-8E5948BA1FBB_1_105_c.jpeg' as string | null,
}

export const UBICACION = {
  direccion: 'Calle Belgrano, Rodeo del Medio, Maipú, Mendoza',
  // Coordenadas: -33.027243, -68.730593
  // Abre Google Maps con el recorrido hasta el lugar
  linkGoogleMaps: 'https://www.google.com/maps/dir/?api=1&destination=-33.027243,-68.730593',
  // Google Maps → Compartir → Incorporar un mapa → copiar el src del iframe
  embedMapa:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d263.7867177470402!2d-68.73059287979301!3d-33.02724327469488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e73002ee8d579%3A0x750d10a8619b81f7!2sDos%20soles!5e1!3m2!1ses-419!2sar!4v1793981590390!5m2!1ses-419!2sar',
}

// Fotos de la galería (800 px de ancho, 4:3)
export const GALERIA = [
  { src: '/images/galeria/1.webp', alt: 'Quincho, parque y baños vistos desde el fondo del predio' },
  { src: '/images/galeria/2.webp', alt: 'Baños y parque con árboles' },
  { src: '/images/galeria/3.webp', alt: 'Parque con juegos y la pileta cercada al fondo' },
  { src: '/images/galeria/4.webp', alt: 'Parque y pileta cercada con álamos al fondo' },
  { src: '/images/galeria/5.webp', alt: 'Camino de entrada al predio' },
  { src: '/images/galeria/6.webp', alt: 'Quincho visto desde el costado del parque' },
  { src: '/images/galeria/7.webp', alt: 'Parque y baños vistos desde el alambrado' },
]

// Preguntas frecuentes. Mientras la lista esté vacía, la sección no se muestra.
// Ejemplo: { pregunta: '¿Cuántas personas entran?', respuesta: 'Hasta 30 personas.' },
export const PREGUNTAS_FRECUENTES: { pregunta: string; respuesta: string }[] = [
  {
    pregunta: '¿Qué pasa si llueve o hace mal tiempo?',
    respuesta:
      'La reserva no se cancela ni se reprograma por mal clima. El quincho es techado y tiene lugar para todos, así que el día se disfruta igual: el asado, la mesa y la charla siguen bajo techo.',
  },
]
