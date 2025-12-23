# 🔧 Solución de Persistencia de Datos

## Problema Identificado

Actualmente los datos (perfil, notificaciones, inscripciones) **NO se persisten** porque:
1. La tabla `usuarios` no existe en Supabase
2. La tabla `notificaciones` no existe en Supabase
3. El sistema depende únicamente del JWT token de NextAuth que expira al cerrar sesión

## ✅ Solución Implementada

### 1. **Para el Perfil de Usuario**

El código ahora:
- Intenta guardar en Supabase primero
- Si falla, continúa y solo actualiza el JWT
- Al iniciar sesión, NextAuth lee de Supabase si existe

**Necesitas ejecutar:**
```sql
-- Ya existe en: supabase/usuarios.sql
-- Ejecuta este archivo en el SQL Editor de Supabase
```

### 2. **Para las Notificaciones**

Las notificaciones actualmente son solo de ejemplo y no se persisten.

**Necesitas crear la tabla:**
```sql
-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('curso_nuevo', 'recordatorio', 'certificado', 'mensaje', 'actualizacion', 'sistema')),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  curso_id TEXT,
  url_accion TEXT
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_notificaciones_user_id ON public.notificaciones(user_id);
CREATE INDEX idx_notificaciones_leida ON public.notificaciones(leida);
CREATE INDEX idx_notificaciones_fecha ON public.notificaciones(fecha_creacion DESC);

-- Row Level Security
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Los usuarios pueden ver sus propias notificaciones"
  ON public.notificaciones FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias notificaciones"
  ON public.notificaciones FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias notificaciones"
  ON public.notificaciones FOR DELETE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Solo admins pueden crear notificaciones"
  ON public.notificaciones FOR INSERT
  WITH CHECK (true); -- Ajustar según necesidad
```

### 3. **Para los Cursos Inscritos**

Ya existe la tabla `inscripciones` que debería persistir correctamente.

**Verifica que exista:**
```sql
-- Si no existe, créala
CREATE TABLE IF NOT EXISTS public.inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  curso_id TEXT NOT NULL,
  fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progreso INTEGER DEFAULT 0,
  completado BOOLEAN DEFAULT FALSE,
  activo BOOLEAN DEFAULT TRUE,
  fecha_completado TIMESTAMP WITH TIME ZONE,
  calificacion INTEGER,
  UNIQUE(user_id, curso_id)
);

-- Índices
CREATE INDEX idx_inscripciones_user ON public.inscripciones(user_id);
CREATE INDEX idx_inscripciones_curso ON public.inscripciones(curso_id);

-- RLS
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden ver sus propias inscripciones"
  ON public.inscripciones FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Los usuarios pueden crear inscripciones"
  ON public.inscripciones FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus inscripciones"
  ON public.inscripciones FOR UPDATE
  USING (auth.uid()::text = user_id);
```

## 📋 Pasos para Activar la Persistencia

### Opción A: Usando Supabase (Recomendado)

1. **Accede a tu proyecto en Supabase**
   - Ve a https://supabase.com
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - Click en "SQL Editor" en el menú lateral

3. **Ejecuta los scripts en orden:**
   ```
   1. supabase/usuarios.sql (ya existe)
   2. Script de notificaciones (copiar de arriba)
   3. Script de inscripciones (si no existe)
   ```

4. **Verifica las tablas**
   - Ve a "Table Editor"
   - Deberías ver: usuarios, notificaciones, inscripciones

### Opción B: Sin Base de Datos (Temporal)

Si no quieres configurar Supabase aún:
- Los cambios funcionarán durante la sesión activa
- Al cerrar sesión TODO se perderá
- Las notificaciones serán solo ejemplos estáticos

## 🔍 Verificar que Funciona

### Perfil de Usuario:
1. Cambia tu nombre
2. Cierra sesión
3. Vuelve a iniciar sesión
4. ✅ Tu nombre debería mantenerse si ejecutaste el SQL

### Notificaciones:
1. Marca una notificación como leída
2. Recarga la página
3. ✅ Debería seguir marcada si ejecutaste el SQL

### Inscripciones:
1. Inscríbete en un curso
2. Cierra sesión
3. Vuelve a iniciar sesión
4. ✅ El curso debería aparecer si la tabla existe

## ⚠️ Importante

**SIN EJECUTAR LOS SCRIPTS SQL:**
- Todo funciona pero NO persiste
- Al cerrar sesión pierdes todos los cambios
- Es solo temporal durante la sesión activa

**CON LOS SCRIPTS SQL EJECUTADOS:**
- Todo se guarda en la base de datos
- Los cambios persisten entre sesiones
- Funciona como una aplicación real

## 🎯 Estado Actual

- ✅ Código preparado para persistir
- ✅ Manejo de errores si no existe la BD
- ❌ Tablas no creadas en Supabase (necesitas ejecutar SQL)
- ✅ Funciona sin BD pero no persiste
