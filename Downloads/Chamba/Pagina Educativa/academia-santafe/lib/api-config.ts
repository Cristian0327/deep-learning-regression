// Configuración de la API
// Este archivo permite cambiar fácilmente entre entornos

// Detectar si estamos en producción o desarrollo
const isClient = typeof window !== 'undefined';
const isProduction = isClient && window.location.hostname !== 'localhost';

// En desarrollo usa backend Express, en producción lee archivos estáticos
const getApiUrl = () => {
  if (!isClient) {
    // Server-side
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  
  // Client-side
  if (isProduction) {
    // Producción: archivos estáticos en /data/
    return '';  // Sin base URL, usa rutas relativas
  }
  
  // Desarrollo: backend Express
  return 'http://localhost:3001';
};

const config = {
  // URL de la API
  apiUrl: getApiUrl(),
  
  // Endpoints
  endpoints: {
    cursos: isProduction && isClient ? '/data/cursos-list.json' : '/api/cursos',
    curso: (id: string) => isProduction && isClient ? `/data/cursos/${id}.json` : `/api/cursos/${id}`,
    inscripciones: '/api/inscripciones',
    inscripcion: (documento: string, cursoId: string) => `/api/inscripciones/${documento}/${cursoId}`,
    inscripcionesCurso: (cursoId: string) => `/api/inscripciones/curso/${cursoId}`,
    health: '/api/health'
  },
  
  // Configuración de requests
  requestConfig: {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 segundos
  }
};

export default config;
