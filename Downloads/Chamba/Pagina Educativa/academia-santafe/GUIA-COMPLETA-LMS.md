# 🎓 Sistema Completo LMS - Academia Santa Fe

## ✅ Características Implementadas

### 1. 📝 Sistema de Administración de Cursos (`/AdminCursos`)
- **CRUD completo** de cursos (Crear, Leer, Eliminar)
- **Sistema de evaluaciones** con dos tipos de preguntas:
  - Opción múltiple (4 opciones con respuesta correcta)
  - Preguntas abiertas
  - Retroalimentación personalizada para cada pregunta
- **Campos de curso**:
  - Información básica: título, descripción, categoría
  - Duración estimada y nivel
  - Instructor y contenido del curso
  - URL del video de YouTube
  - Clave de inscripción (para control de acceso)
  - Array de evaluaciones

### 2. 🎬 Página de Curso Individual (`/curso/[id]`)
- **Sistema de inscripción** con validación de clave
- **Reproductor de video** integrado de YouTube
- **Transcripción interactiva** con:
  - Búsqueda de palabras clave
  - Resaltado de términos buscados
  - Marcas de tiempo clicables
  - Sincronización con el video (pendiente API key)
- **Sistema de evaluaciones** para estudiantes:
  - Progreso visual pregunta por pregunta
  - Soporte para preguntas múltiples y abiertas
  - Calificación automática (70% mínimo para aprobar)
  - Retroalimentación al finalizar
- **Barra de progreso** del curso
- **Generación de certificados** en PDF al aprobar

### 3. 🏆 Sistema de Certificados
- **Generación automática** en PDF con jsPDF
- **Diseño profesional** con:
  - Borde decorativo en colores de la marca
  - Nombre del estudiante y curso
  - Fecha de completado
  - Firma del instructor
  - Sello de Academia Santa Fe
- **Descarga directa** al aprobar evaluación con 70%+

### 4. 📊 Sistema de Progreso y Base de Datos
- **Tabla `cursos`**: Almacena toda la información de cursos
- **Tabla `progreso_estudiantes`**: Rastrea:
  - Inscripciones de estudiantes
  - Porcentaje de progreso (0-100%)
  - Estado de completado
  - Fecha de inscripción y completado
- **Tabla `evaluaciones_estudiantes`**: Guarda:
  - Respuestas de cada estudiante
  - Calificaciones obtenidas
  - Estado de aprobación
  - Historial de intentos

### 5. 🔐 Control de Acceso
- **Autenticación** con NextAuth (Google + Microsoft)
- **Sistema de inscripción** con clave única por curso
- **Validación** de usuarios inscritos antes de acceder al contenido
- **Redirección** automática si no está autenticado

### 6. 🎨 Interfaz de Usuario
- **Diseño moderno** con Tailwind CSS
- **Componentes reutilizables**: Navbar, Footer
- **Animaciones suaves** y transiciones
- **Responsive design** para móviles y desktop
- **Estados de carga** y mensajes de error

---

## 📋 Cómo Usar el Sistema

### Para Administradores

#### 1. Crear un Curso
1. Navega a `/AdminCursos`
2. Rellena el formulario con:
   - **Título**: Nombre del curso
   - **Descripción**: Resumen breve
   - **Categoría**: Área temática (ej: "Seguridad Industrial")
   - **Duración**: Tiempo estimado (ej: "8 horas")
   - **Nivel**: Principiante/Intermedio/Avanzado
   - **Instructor**: Nombre del profesor
   - **Video URL**: Link de YouTube (ej: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
   - **Clave de inscripción**: Código único para estudiantes (ej: "SANTA2024")
   - **Duración estimada**: En horas
   - **Prerequisitos**: Conocimientos previos necesarios
   - **Contenido**: Lista de temas (uno por línea)

3. **Agregar Evaluaciones**:
   - Click en "Agregar Evaluación"
   - Selecciona tipo:
     - **Opción Múltiple**: Escribe pregunta + 4 opciones + marca la correcta
     - **Pregunta Abierta**: Solo escribe la pregunta
   - Agrega retroalimentación (explicación de la respuesta)
   - Click en "Agregar" para añadir al curso
   - Repite para más preguntas

4. Click en "Guardar Curso"

#### 2. Visualizar Cursos Creados
- Los cursos aparecen en la lista inferior
- Muestra: título, categoría, instructor, nivel
- Cada curso tiene un botón "Eliminar"

### Para Estudiantes

#### 1. Inscribirse a un Curso
1. Navega a `/cursos` y explora los cursos disponibles
2. Click en "Ver Detalles" del curso deseado
3. Inicia sesión si no lo has hecho (Google o Microsoft)
4. Ingresa la **clave de inscripción** proporcionada por el instructor
5. Click en "Inscribirse"

#### 2. Tomar el Curso
1. Una vez inscrito, verás:
   - Video del curso (YouTube embebido)
   - Transcripción interactiva debajo del video
   - Barra de progreso del curso
   - Contenido del curso en el sidebar

2. **Usar la transcripción**:
   - Busca palabras clave en la barra de búsqueda
   - Click en cualquier segmento para saltar a ese momento del video (requiere API key)
   - Los resultados se resaltan en amarillo

#### 3. Tomar la Evaluación
1. Scroll hasta "Evaluación del Curso"
2. Click en "Iniciar Evaluación"
3. Responde cada pregunta:
   - **Opción múltiple**: Click en la opción correcta
   - **Pregunta abierta**: Escribe tu respuesta en el textarea
4. Click en "Siguiente" para avanzar
5. Al finalizar, verás tu calificación

#### 4. Descargar Certificado
- Si apruebas con **70% o más**, aparece el botón "Descargar Certificado"
- El PDF incluye:
  - Tu nombre (desde tu cuenta)
  - Nombre del curso
  - Nombre del instructor
  - Fecha de completado
  - Sello de Academia Santa Fe

---

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas

Archivo: `.env.local`

```env
# NextAuth - Autenticación
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key-aqui

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=tu-microsoft-client-id
MICROSOFT_CLIENT_SECRET=tu-microsoft-client-secret
MICROSOFT_TENANT_ID=tu-tenant-id

# Supabase - Base de datos
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# YouTube Data API v3 - OPCIONAL (para transcripciones)
# Obtén tu API key en: https://console.cloud.google.com/apis/credentials
# YOUTUBE_API_KEY=tu-youtube-api-key
```

### Cómo Obtener YouTube API Key (Opcional)

**Nota**: El sistema funciona sin API key, pero las transcripciones solo estarán disponibles si configuras esto.

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita "YouTube Data API v3"
4. Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
5. Copia la API key generada
6. Pégala en `.env.local` como `YOUTUBE_API_KEY=tu-key-aqui`
7. Reinicia el servidor: `npm run dev`

**Sin API key**: Los estudiantes verán un mensaje explicando que la transcripción no está disponible.

---

## 📦 Estructura de la Base de Datos

### Tabla: `cursos`
```sql
- id (int8, PK)
- titulo (text)
- descripcion (text)
- categoria (text)
- duracion (text)
- nivel (text) -- default: 'Principiante'
- instructor (text)
- imagen (text)
- contenido (text)
- precio (text) -- default: '0'
- fechaCreacion (timestamptz) -- default: now()
- activo (bool) -- default: true
- videoUrl (text)
- claveInscripcion (text)
- evaluaciones (jsonb) -- default: []
- certificadoTemplate (text)
- duracionEstimada (int4) -- default: 64
- prerequisitos (text)
```

### Tabla: `progreso_estudiantes`
```sql
- id (int8, PK)
- usuario_id (text) -- email del usuario
- curso_id (int8) -- FK a cursos
- progreso (int4) -- 0-100
- completado (bool) -- default: false
- fecha_completado (timestamptz)
- created_at (timestamptz)
```

### Tabla: `evaluaciones_estudiantes`
```sql
- id (int8, PK)
- usuario_id (text)
- curso_id (int8)
- evaluacion_id (text)
- respuestas (jsonb) -- objeto con respuestas
- calificacion (int4) -- 0-100
- aprobado (bool) -- default: false
- created_at (timestamptz)
```

---

## 🚀 Despliegue

### Pasos para Producción

1. **Preparar Supabase**:
   - Asegúrate de que las 3 tablas existen
   - Configura las políticas de seguridad (RLS) si es necesario

2. **Variables de Entorno**:
   - Actualiza `NEXTAUTH_URL` a tu dominio de producción
   - Cambia `NEXTAUTH_SECRET` por una clave segura aleatoria
   - Verifica que todos los OAuth credentials estén configurados

3. **Build y Deploy**:
   ```bash
   npm run build
   npm start
   ```

4. **Hosting Recomendado**:
   - **Vercel** (recomendado para Next.js): Deploy automático desde GitHub
   - **Netlify**: Alternativa con configuración similar
   - **VPS**: Cualquier servidor con Node.js 18+

5. **Configurar OAuth en Producción**:
   - Google: Agrega tu dominio a "Authorized redirect URIs"
   - Microsoft: Agrega `https://tu-dominio.com/api/auth/callback/azure-ad`

---

## 🐛 Solución de Problemas

### Error: "YouTube API key no configurada"
**Solución**: Esto es normal si no tienes API key. Las transcripciones solo funcionarán después de configurar `YOUTUBE_API_KEY` en `.env.local`.

### Error al inscribirse: "Clave incorrecta"
**Solución**: Verifica que la clave ingresada coincida exactamente con la configurada en el curso (respeta mayúsculas/minúsculas).

### Certificado no se descarga
**Solución**: 
- Verifica que el navegador permita descargas
- Asegúrate de haber aprobado con 70%+ en la evaluación
- Revisa la consola del navegador por errores de jsPDF

### Video de YouTube no se muestra
**Solución**:
- Verifica que la URL sea correcta: `https://www.youtube.com/watch?v=VIDEO_ID`
- Asegúrate de que el video no esté privado o restringido
- Algunos videos corporativos bloquean embeds

### Progreso no se actualiza
**Solución**: 
- Verifica que estés autenticado
- Revisa que la tabla `progreso_estudiantes` tenga el registro
- Comprueba la consola del navegador por errores de Supabase

---

## 📝 Próximas Mejoras (Opcional)

- [ ] Panel de administrador mejorado con estadísticas
- [ ] Sistema de notificaciones por email al completar curso
- [ ] Foro de discusión por curso
- [ ] Módulos de curso (dividir en secciones)
- [ ] Soporte para múltiples videos por curso
- [ ] Sistema de calificaciones para cursos
- [ ] Dashboard de estudiante con todos sus cursos
- [ ] Gamificación (badges, puntos, leaderboard)

---

## 💡 Consejos de Uso

1. **Crea claves de inscripción fáciles de recordar** pero únicas (ej: `SEGURIDAD2024`, `OPERACIONES_ABR`)

2. **Agrega al menos 5 evaluaciones** por curso para una evaluación completa

3. **Usa retroalimentación detallada** en las evaluaciones para ayudar al aprendizaje

4. **Verifica los videos antes de publicar** el curso (que sean públicos y embebibles)

5. **Habilita subtítulos en YouTube** si quieres que las transcripciones funcionen

6. **Mantén las claves de inscripción seguras** y cámbialas periódicamente

---

## 📞 Soporte

Si encuentras problemas, revisa:
1. La consola del navegador (F12 → Console)
2. Los logs del servidor terminal
3. La configuración de Supabase (tabla visible, datos correctos)
4. Las variables de entorno (todas configuradas)

**¡El sistema está completo y listo para usar!** 🎉
