# Instrucciones para Configurar la Tabla de Usuarios

## Pasos para crear la tabla de usuarios en Supabase:

1. **Accede a tu proyecto de Supabase**
   - Ve a https://supabase.com
   - Inicia sesión y selecciona tu proyecto

2. **Abre el Editor SQL**
   - En el menú lateral, haz clic en "SQL Editor"
   - Crea una nueva consulta

3. **Ejecuta el script SQL**
   - Abre el archivo `supabase/usuarios.sql`
   - Copia todo el contenido
   - Pégalo en el editor SQL de Supabase
   - Haz clic en "Run" para ejecutar

4. **Verifica la creación de la tabla**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver la tabla `usuarios` con las siguientes columnas:
     - `id` (TEXT, PRIMARY KEY)
     - `nombre` (TEXT)
     - `email` (TEXT, UNIQUE)
     - `imagen` (TEXT)
     - `rol` (TEXT, default: 'student')
     - `fecha_creacion` (TIMESTAMP)
     - `ultima_actualizacion` (TIMESTAMP)

## Crear el Bucket de Avatares (Opcional)

Para poder subir imágenes de perfil:

1. **Ve a Storage**
   - En el menú lateral, haz clic en "Storage"

2. **Crea un nuevo bucket**
   - Haz clic en "New bucket"
   - Nombre: `avatars`
   - Público: Sí (marca la casilla "Public bucket")
   - Haz clic en "Create bucket"

3. **Configura políticas de acceso**
   - Haz clic en el bucket `avatars`
   - Ve a "Policies"
   - Crea las siguientes políticas:

**Política para subir archivos:**
```sql
CREATE POLICY "Los usuarios pueden subir su avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Política para actualizar archivos:**
```sql
CREATE POLICY "Los usuarios pueden actualizar su avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Política para ver archivos:**
```sql
CREATE POLICY "Todos pueden ver los avatares"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

## Notas Importantes

- Si no creas el bucket de avatares, la aplicación funcionará pero no podrás subir imágenes de perfil
- Los usuarios podrán seguir usando URLs externas (como las de Google/Microsoft OAuth) sin problemas
- La tabla de usuarios se creará automáticamente al primer inicio de sesión si no existe
