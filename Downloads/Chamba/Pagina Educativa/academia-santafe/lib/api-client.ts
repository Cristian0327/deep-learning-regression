import config from './api-config';

// Cliente HTTP para consumir la API de archivos JSON
// Sin base de datos - usa sistema de archivos del servidor Express
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...config.requestConfig,
        ...options,
        headers: {
          ...config.requestConfig.headers,
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status} error:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en request a ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos de cursos
  async listarCursos(): Promise<any[]> {
    // En producción sin backend, usar localStorage
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      try {
        // Intentar cargar desde archivos estáticos primero
        const response = await fetch('/data/cursos-list.json');
        if (response.ok) {
          const cursosEstaticos = await response.json();
          
          // Combinar con cursos de localStorage
          const cursosLocalJSON = localStorage.getItem('cursos');
          const cursosLocal = cursosLocalJSON ? JSON.parse(cursosLocalJSON) : [];
          
          // Merge (prioridad a localStorage)
          const todosLosCursos = [...cursosEstaticos];
          cursosLocal.forEach((cursoLocal: any) => {
            const existe = todosLosCursos.findIndex(c => c.id === cursoLocal.id);
            if (existe >= 0) {
              todosLosCursos[existe] = cursoLocal; // Actualizar
            } else {
              todosLosCursos.push(cursoLocal); // Agregar nuevo
            }
          });
          
          return todosLosCursos;
        }
      } catch (error) {
        console.warn('No se pudieron cargar cursos estáticos, usando solo localStorage');
      }
      
      // Fallback: solo localStorage
      const cursosJSON = localStorage.getItem('cursos');
      return cursosJSON ? JSON.parse(cursosJSON) : [];
    }
    
    // En desarrollo, usar backend
    return this.request(config.endpoints.cursos);
  }

  async obtenerCurso(id: string): Promise<any> {
    // En producción sin backend
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      try {
        // Intentar desde archivo estático
        const response = await fetch(`/data/cursos/${id}.json`);
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn('No se pudo cargar curso estático, buscando en localStorage');
      }
      
      // Fallback: buscar en localStorage
      const cursosJSON = localStorage.getItem('cursos');
      const cursos = cursosJSON ? JSON.parse(cursosJSON) : [];
      return cursos.find((c: any) => c.id === id) || null;
    }
    
    // En desarrollo, usar backend
    return this.request(config.endpoints.curso(id));
  }

  async guardarCurso(curso: any): Promise<any> {
    // En producción sin backend, usar localStorage
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      const cursosJSON = localStorage.getItem('cursos');
      const cursos = cursosJSON ? JSON.parse(cursosJSON) : [];
      
      if (curso.id) {
        // Actualizar
        const index = cursos.findIndex((c: any) => c.id === curso.id);
        if (index !== -1) {
          cursos[index] = { ...curso, actualizado: new Date().toISOString() };
        } else {
          cursos.push({ ...curso, createdAt: new Date().toISOString() });
        }
      } else {
        // Crear nuevo
        curso.id = Date.now().toString();
        curso.createdAt = new Date().toISOString();
        curso.activo = true;
        cursos.push(curso);
      }
      
      localStorage.setItem('cursos', JSON.stringify(cursos));
      return { success: true, mensaje: 'Curso guardado en navegador', curso };
    }
    
    // En desarrollo, usar backend
    return this.request(config.endpoints.cursos, {
      method: 'POST',
      body: JSON.stringify(curso)
    });
  }

  async eliminarCurso(id: string): Promise<void> {
    // En producción sin backend, usar localStorage
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      const cursosJSON = localStorage.getItem('cursos');
      const cursos = cursosJSON ? JSON.parse(cursosJSON) : [];
      const cursosFiltrados = cursos.filter((c: any) => c.id !== id);
      localStorage.setItem('cursos', JSON.stringify(cursosFiltrados));
      return;
    }
    
    // En desarrollo, usar backend
    return this.request(config.endpoints.curso(id), {
      method: 'DELETE'
    });
  }

  // Métodos de inscripciones
  async guardarInscripcion(inscripcion: any): Promise<any> {
    return this.request(config.endpoints.inscripciones, {
      method: 'POST',
      body: JSON.stringify(inscripcion)
    });
  }

  async obtenerInscripcion(documento: string, cursoId: string): Promise<any> {
    return this.request(config.endpoints.inscripcion(documento, cursoId));
  }

  async listarInscripcionesCurso(cursoId: string): Promise<any[]> {
    return this.request(config.endpoints.inscripcionesCurso(cursoId));
  }

  async listarTodasInscripciones(): Promise<any[]> {
    return this.request(config.endpoints.inscripciones);
  }

  async eliminarInscripcion(documento: string, cursoId: string): Promise<void> {
    return this.request(config.endpoints.inscripcion(documento, cursoId), {
      method: 'DELETE'
    });
  }

  // Health check
  async health(): Promise<any> {
    return this.request(config.endpoints.health);
  }
}

export default new ApiClient();
