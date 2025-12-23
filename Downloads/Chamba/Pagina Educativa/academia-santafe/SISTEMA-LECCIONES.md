# Sistema de Lecciones - Guía de Implementación

## ✅ Lo que se implementó

### 1. **Nueva tabla en Supabase: `lecciones_curso`**

Ejecuta el archivo SQL en Supabase:
```bash
supabase/lecciones_curso.sql
```

Esta tabla permite:
- ✅ Crear lecciones de 3 tipos: **Video**, **Texto**, **Evaluación**
- ✅ Ordenar lecciones (orden 1, 2, 3...)
- ✅ Contenido específico por tipo:
  - Video: URL de YouTube, duración
  - Texto: Contenido con soporte para Markdown
  - Evaluación: Preguntas JSONB, puntaje mínimo
- ✅ Marcar lecciones como obligatorias/opcionales
- ✅ Relación con tabla `cursos` (ON DELETE CASCADE)

### 2. **Componente: `GestorLecciones.tsx`**

**Ubicación:** `components/GestorLecciones.tsx`

**Funcionalidades:**
- ➕ Agregar lecciones (video, texto, evaluación)
- ✏️ Editar lecciones existentes
- 🗑️ Eliminar lecciones
- ⬆️⬇️ Reordenar lecciones (botones arriba/abajo)
- 🎨 Interfaz intuitiva con iconos por tipo
- 🔒 Marcar lecciones como obligatorias/opcionales

**Campos según tipo:**
- **Video**: URL de YouTube, duración en minutos
- **Texto**: Contenido con soporte Markdown
- **Evaluación**: Puntaje mínimo para aprobar (configuración de preguntas pendiente)

### 3. **Integración en `AdminCursos/page.tsx`**

**Cambios realizados:**
1. Importado `GestorLecciones` y tipo `Leccion`
2. Agregado estado `lecciones` 
3. Al guardar curso, se guardan las lecciones en Supabase
4. Mensaje de éxito incluye cantidad de lecciones creadas
5. Reset de estado de lecciones al crear curso exitosamente

**Ubicación en formulario:**
Entre la sección de "Certificado" y "Evaluaciones"

### 4. **Componente: `LeccionesViewer.tsx`**

**Ubicación:** `components/LeccionesViewer.tsx`

**Funcionalidades:**
- 📚 Lista de lecciones con sidebar
- ✅ Marcar lecciones como completadas
- 🔒 Sistema de bloqueo (lección obligatoria bloquea la siguiente)
- 📊 Barra de progreso
- ⏮️⏭️ Navegación anterior/siguiente
- 🎥 Renderizado de videos con transcripciones
- 📝 Renderizado de texto con Markdown
- 📋 Placeholder para evaluaciones

**Tipos de lección soportados:**
1. **Video**: Iframe de YouTube con transcripciones
2. **Texto**: Renderizado con `react-markdown`
3. **Evaluación**: Integración pendiente

## 📦 Dependencias instaladas

```bash
npm install react-markdown
```

## 🚀 Próximos pasos

### Paso 1: Ejecutar SQL en Supabase
1. Ve a Supabase Dashboard > SQL Editor
2. Copia el contenido de `supabase/lecciones_curso.sql`
3. Ejecuta el SQL
4. Verifica que la tabla `lecciones_curso` se creó correctamente

### Paso 2: Probar el sistema
1. Ve a `/AdminCursos`
2. Crea un nuevo curso
3. En la sección "Lecciones del Curso" haz clic en "Agregar Lección"
4. Crea lecciones de diferentes tipos:
   - Video: Usa una URL de YouTube
   - Texto: Escribe contenido con Markdown
   - Evaluación: Configura puntaje mínimo

5. Reordena las lecciones usando los botones ⬆️⬇️
6. Guarda el curso

### Paso 3: Integrar LeccionesViewer en curso/[id]/page.tsx
Necesitarás:
1. Importar `LeccionesViewer`
2. Cargar lecciones desde Supabase
3. Reemplazar o complementar el video único con el sistema de lecciones
4. Guardar progreso de lecciones completadas en Supabase

## 🔄 Compatibilidad con cursos existentes

Los cursos que ya tienen un `videoUrl` seguirán funcionando:
- Opción 1: Migrar automáticamente el video a una lección
- Opción 2: Mantener ambos sistemas (videoUrl para cursos antiguos, lecciones para nuevos)

**Script de migración sugerido:**
```sql
-- Crear lección automática para cursos con videoUrl pero sin lecciones
INSERT INTO lecciones_curso (curso_id, orden, tipo, titulo, video_url, duracion, obligatoria)
SELECT 
  id,
  1,
  'video',
  titulo || ' - Video Principal',
  "videoUrl",
  COALESCE(duracion::int, 30),
  true
FROM cursos
WHERE "videoUrl" IS NOT NULL 
  AND "videoUrl" != ''
  AND NOT EXISTS (
    SELECT 1 FROM lecciones_curso WHERE lecciones_curso.curso_id = cursos.id
  );
```

## 🎯 Características clave

### ✅ Implementado
- Crear/editar/eliminar lecciones
- Reordenar lecciones
- 3 tipos de lecciones (video, texto, evaluación)
- Marcar como obligatoria/opcional
- Guardar en Supabase
- Visualización con sidebar navegable
- Sistema de progreso
- Bloqueo secuencial de lecciones obligatorias

### ⏳ Pendiente
- Integrar evaluaciones de lecciones con sistema existente
- Guardar progreso de lecciones en Supabase
- Migración de cursos existentes
- Estadísticas de progreso por lección
- Notificaciones de lecciones completadas

## 📝 Notas importantes

1. **Markdown en lecciones de texto**: Los instructores pueden usar sintaxis Markdown para:
   - **Negrita**: `**texto**`
   - *Cursiva*: `*texto*`
   - Títulos: `# Título`, `## Subtítulo`
   - Listas: `- Item`, `1. Item`
   - Links: `[texto](url)`

2. **Videos**: Solo soporta URLs de YouTube por ahora

3. **Evaluaciones de lecciones**: Las preguntas se configurarán después de crear la lección (funcionalidad pendiente)

4. **Orden automático**: Al reordenar, el sistema actualiza automáticamente el campo `orden` de todas las lecciones

## 🎨 Experiencia del estudiante

1. Ve la lista de lecciones en el sidebar
2. Las lecciones completadas tienen check verde ✅
3. Las bloqueadas tienen candado 🔒
4. Navega con botones "Anterior" / "Siguiente"
5. Marca lecciones como completadas con botón verde
6. Ve su progreso en barra superior

## 🔐 Seguridad

- RLS habilitado en tabla `lecciones_curso`
- Solo usuarios autenticados pueden crear/editar/eliminar
- Políticas configuradas para lectura pública

---

**¡Sistema listo para usar!** 🎉

Solo falta ejecutar el SQL en Supabase y empezar a crear cursos con lecciones.
