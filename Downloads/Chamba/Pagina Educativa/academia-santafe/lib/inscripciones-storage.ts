// Helper para manejar inscripciones en localStorage (SIN BASE DE DATOS)

export interface InscripcionData {
  nombre: string;
  documento: string;
  cargo?: string;
  empresa?: string;
  cursoId: string;
  progreso: number;
  completado: boolean;
  activo: boolean;
  fechaInscripcion: string;
  fechaCompletado?: string;
  calificacion?: number;
}

// Obtener todas las inscripciones de todas las personas en localStorage
export const obtenerTodasInscripciones = (): InscripcionData[] => {
  if (typeof window === 'undefined') return [];
  
  const inscripciones: InscripcionData[] = [];
  
  // Iterar por todas las keys de localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('inscripcion_')) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const inscripcion = JSON.parse(data) as InscripcionData;
          inscripciones.push(inscripcion);
        }
      } catch (error) {
        console.error(`Error al parsear inscripción ${key}:`, error);
      }
    }
  }
  
  return inscripciones;
};

// Obtener inscripciones de un documento específico
export const obtenerInscripcionesPorDocumento = (documento: string): InscripcionData[] => {
  if (typeof window === 'undefined') return [];
  
  const inscripciones: InscripcionData[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`inscripcion_${documento}_`)) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const inscripcion = JSON.parse(data) as InscripcionData;
          inscripciones.push(inscripcion);
        }
      } catch (error) {
        console.error(`Error al parsear inscripción ${key}:`, error);
      }
    }
  }
  
  return inscripciones;
};

// Obtener inscripciones de un email específico (para usuarios autenticados con NextAuth)
// Como NextAuth usa email en lugar de documento, buscamos por nombre
export const obtenerInscripcionesPorEmail = (email: string): InscripcionData[] => {
  // Para usuarios autenticados con email, usamos el email como documento
  return obtenerInscripcionesPorDocumento(email);
};

// Obtener inscripciones de un curso específico
export const obtenerInscripcionesPorCurso = (cursoId: string): InscripcionData[] => {
  if (typeof window === 'undefined') return [];
  
  const inscripciones: InscripcionData[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith(`_${cursoId}`)) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const inscripcion = JSON.parse(data) as InscripcionData;
          inscripciones.push(inscripcion);
        }
      } catch (error) {
        console.error(`Error al parsear inscripción ${key}:`, error);
      }
    }
  }
  
  return inscripciones;
};

// Actualizar progreso de una inscripción
export const actualizarProgreso = (
  documento: string,
  cursoId: string,
  progreso: number,
  completado: boolean = false
): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const inscripcionKey = `inscripcion_${documento}_${cursoId}`;
    const data = localStorage.getItem(inscripcionKey);
    
    if (!data) return false;
    
    const inscripcion = JSON.parse(data) as InscripcionData;
    inscripcion.progreso = progreso;
    inscripcion.completado = completado;
    
    if (completado && !inscripcion.fechaCompletado) {
      inscripcion.fechaCompletado = new Date().toISOString();
    }
    
    localStorage.setItem(inscripcionKey, JSON.stringify(inscripcion));
    return true;
  } catch (error) {
    console.error('Error al actualizar progreso:', error);
    return false;
  }
};

// Guardar calificación de una evaluación
export const guardarCalificacion = (
  documento: string,
  cursoId: string,
  calificacion: number
): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const inscripcionKey = `inscripcion_${documento}_${cursoId}`;
    const data = localStorage.getItem(inscripcionKey);
    
    if (!data) return false;
    
    const inscripcion = JSON.parse(data) as InscripcionData;
    inscripcion.calificacion = calificacion;
    
    localStorage.setItem(inscripcionKey, JSON.stringify(inscripcion));
    return true;
  } catch (error) {
    console.error('Error al guardar calificación:', error);
    return false;
  }
};

// Obtener estadísticas de un usuario
export const obtenerEstadisticasUsuario = (documento: string) => {
  const inscripciones = obtenerInscripcionesPorDocumento(documento);
  
  const cursosCompletados = inscripciones.filter(i => i.completado).length;
  const cursosEnProgreso = inscripciones.filter(i => !i.completado && i.activo).length;
  const progresoPromedio = inscripciones.length > 0
    ? Math.round(inscripciones.reduce((sum, i) => sum + i.progreso, 0) / inscripciones.length)
    : 0;
  
  return {
    totalCursos: inscripciones.length,
    cursosCompletados,
    cursosEnProgreso,
    progresoPromedio
  };
};
