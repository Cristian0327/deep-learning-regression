const fs = require('fs');
const path = require('path');

// Directorio de cursos (en Netlify se usa /tmp para escritura)
const cursosDir = process.env.NODE_ENV === 'production' 
  ? '/tmp/cursos' 
  : path.join(__dirname, '../../api/data/cursos');

// Crear directorio si no existe
if (!fs.existsSync(cursosDir)) {
  fs.mkdirSync(cursosDir, { recursive: true });
}

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { httpMethod, path: requestPath, body } = event;
    
    // GET /api/cursos - Listar todos los cursos
    if (httpMethod === 'GET' && requestPath === '/.netlify/functions/cursos') {
      const archivos = fs.readdirSync(cursosDir).filter(f => f.endsWith('.json'));
      const cursos = archivos.map(archivo => {
        const contenido = fs.readFileSync(path.join(cursosDir, archivo), 'utf8');
        return JSON.parse(contenido);
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(cursos)
      };
    }

    // GET /api/cursos/:id - Obtener un curso específico
    if (httpMethod === 'GET' && requestPath.includes('/curso/')) {
      const id = requestPath.split('/curso/')[1];
      const archivoPath = path.join(cursosDir, `${id}.json`);

      if (!fs.existsSync(archivoPath)) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Curso no encontrado' })
        };
      }

      const contenido = fs.readFileSync(archivoPath, 'utf8');
      return {
        statusCode: 200,
        headers,
        body: contenido
      };
    }

    // POST /api/cursos - Crear o actualizar curso
    if (httpMethod === 'POST' && requestPath === '/.netlify/functions/cursos') {
      const curso = JSON.parse(body);
      
      // Generar ID si no existe
      if (!curso.id) {
        curso.id = `curso-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Agregar timestamps
      const ahora = new Date().toISOString();
      if (!curso.createdAt) {
        curso.createdAt = ahora;
      }
      curso.updatedAt = ahora;

      // Guardar archivo
      const archivoPath = path.join(cursosDir, `${curso.id}.json`);
      fs.writeFileSync(archivoPath, JSON.stringify(curso, null, 2));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(curso)
      };
    }

    // DELETE /api/cursos/:id - Eliminar curso
    if (httpMethod === 'DELETE' && requestPath.includes('/curso/')) {
      const id = requestPath.split('/curso/')[1];
      const archivoPath = path.join(cursosDir, `${id}.json`);

      if (fs.existsSync(archivoPath)) {
        fs.unlinkSync(archivoPath);
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Ruta no encontrada' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
