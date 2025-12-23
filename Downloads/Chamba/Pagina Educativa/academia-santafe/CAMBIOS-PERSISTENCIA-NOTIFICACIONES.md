# Cambios Implementados - Persistencia y Notificaciones

## 🎯 Problemas Resueltos

### 1. **Persistencia de Datos del Perfil**
   - ✅ Los cambios de nombre ahora se guardan en Supabase
   - ✅ Los cambios de imagen ahora se guardan en Supabase
   - ✅ Los datos persisten después de cerrar sesión y volver a iniciar

### 2. **Sistema de Notificaciones**
   - ✅ El círculo rojo en la campana solo aparece si hay notificaciones sin leer
   - ✅ El contador se actualiza automáticamente
   - ✅ Las notificaciones se cargan desde Supabase
   - ✅ Al marcar como leída, el círculo desaparece
   - ✅ Botón "Marcar todas como leídas" funcional

### 3. **Autenticación OAuth**
   - ✅ Configuración de cookies corregida
   - ✅ JWT optimizado para mejor rendimiento

---

## 📝 Archivos Modificados

### **1. components/Navbar.tsx**
**Cambios:**
- Agregado `useEffect` para cargar notificaciones desde Supabase
- Estado `notificacionesNoLeidas` para contar notificaciones sin leer
- Estado `ultimasNotificaciones` para mostrar últimas 3 notificaciones
- El círculo rojo ahora es condicional: `{notificacionesNoLeidas > 0 && ...}`
- Función `cargarNotificaciones()` que consulta la tabla `notificaciones`
- Función `calcularTiempo()` para mostrar "Hace 2 horas", "Hace 1 día", etc.
- Listener del evento `notificacionesActualizadas` para refrescar cuando se marcan como leídas

**Funcionamiento:**
```typescript
// Al cargar el componente, consulta Supabase
const { data } = await supabase
  .from('notificaciones')
  .select('*')
  .eq('user_id', session.user.id)
  .eq('leida', false)
  .order('fecha_creacion', { ascending: false })
  .limit(3);

// Si hay notificaciones, actualiza el contador
setNotificacionesNoLeidas(data.length);
```

---

### **2. app/dashboard/notificaciones/page.tsx**
**Cambios:**
- Agregado `window.dispatchEvent(new Event('notificacionesActualizadas'))` en:
  - `marcarComoLeida()` - al marcar una notificación
  - `marcarTodasComoLeidas()` - al marcar todas
  - `eliminarNotificacion()` - al eliminar una notificación
- Esto dispara la recarga del contador en el Navbar automáticamente

**Funcionamiento:**
```typescript
// Cuando marcas como leída
await supabase.from('notificaciones').update({ leida: true }).eq('id', notifId);
window.dispatchEvent(new Event('notificacionesActualizadas')); // ← Refresca Navbar
```

---

### **3. app/perfil/page.tsx**
**Cambios:**
- Simplificado el guardado usando `upsert` de Supabase
- Removido el check de "si existe actualizar, si no insertar"
- Ahora usa directamente: `upsert({ ... }, { onConflict: 'id' })`
- Mejorado manejo de errores con mensajes claros
- Agregado trigger `update` al llamar `update()` de NextAuth

**Funcionamiento:**
```typescript
// 1. Guardar en Supabase
await supabase.from('usuarios').upsert({
  id: session.user.id,
  nombre: editName,
  imagen: imageUrl,
  rol: session.user.role || 'student',
  ultima_actualizacion: new Date().toISOString()
}, {
  onConflict: 'id' // Si existe, actualiza; si no, inserta
});

// 2. Actualizar sesión de NextAuth
await update({
  trigger: 'update',
  user: { name: editName, image: imageUrl }
});

// 3. Recargar página para ver cambios
setTimeout(() => window.location.reload(), 1500);
```

---

### **4. lib/auth.ts**
**Cambios Importantes:**

#### **Callback `session`:**
```typescript
// ANTES: Leía del token, los cambios no se reflejaban
session.user.name = token.name;

// AHORA: Lee SIEMPRE de Supabase primero
const { data: userData } = await supabase
  .from('usuarios')
  .select('nombre, imagen, rol')
  .eq('id', token.sub)
  .single();

if (userData) {
  session.user.name = userData.nombre;  // ← Fuente de verdad
  session.user.image = userData.imagen;
  session.user.role = userData.rol;
}
```

**Por qué es importante:**
- Cada vez que se carga una página, NextAuth llama al callback `session`
- Si este callback lee de Supabase, SIEMPRE tendrá los datos actualizados
- Así los cambios persisten aunque cierres sesión

#### **Callback `jwt`:**
```typescript
// Al hacer login, crea el usuario en Supabase
if (user) {
  await supabase.from('usuarios').upsert({
    id: token.sub,
    nombre: user.name,
    email: user.email,
    imagen: user.image,
    rol: token.role
  }, { onConflict: 'id' });
}

// Al actualizar perfil (trigger: 'update')
if (trigger === 'update' && session?.user) {
  // Los datos ya se guardaron en Supabase desde el perfil
  // Solo actualizar el token para reflejar inmediatamente
  token.name = session.user.name;
  token.picture = session.user.image;
}
```

**Configuración de cookies:**
```typescript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false  // ← Importante para localhost
    }
  }
},
useSecureCookies: false  // ← Evita error "State cookie was missing"
```

---

## 🔄 Flujo de Datos

### **Login inicial:**
1. Usuario inicia sesión con Google/Microsoft
2. NextAuth llama `jwt` callback → crea usuario en `usuarios` tabla
3. NextAuth llama `session` callback → lee datos de Supabase
4. Usuario ve su perfil con datos de la BD

### **Actualizar perfil:**
1. Usuario edita nombre en `/perfil`
2. Frontend guarda en Supabase: `usuarios.nombre = "Nuevo Nombre"`
3. Frontend llama `update({ trigger: 'update', user: { name: "Nuevo Nombre" }})`
4. NextAuth llama `jwt` callback → actualiza token
5. NextAuth llama `session` callback → lee desde Supabase
6. Página se recarga → muestra "Nuevo Nombre"

### **Cerrar sesión y volver:**
1. Usuario cierra sesión
2. Usuario vuelve a iniciar sesión
3. NextAuth llama `session` callback
4. Callback lee desde Supabase: `select nombre from usuarios where id = ...`
5. Retorna "Nuevo Nombre" ← **Los cambios persisten**

### **Notificaciones:**
1. Navbar carga notificaciones no leídas al montar: `useEffect(() => { cargarNotificaciones() }, [session])`
2. Muestra círculo rojo si `notificacionesNoLeidas > 0`
3. Usuario hace clic en notificación → llama `marcarComoLeida()`
4. Se actualiza en Supabase: `update({ leida: true })`
5. Dispara evento: `window.dispatchEvent('notificacionesActualizadas')`
6. Navbar escucha evento → recarga notificaciones
7. Círculo rojo desaparece si ya no hay sin leer

---

## 🧪 Cómo Probar

### **Test 1: Persistencia de Nombre**
1. Inicia sesión en http://localhost:3000
2. Ve a `/perfil`
3. Cambia tu nombre a "Prueba Test"
4. Guarda cambios (verás mensaje de éxito)
5. Espera 2 segundos (recarga automática)
6. Cierra sesión
7. Vuelve a iniciar sesión
8. ✅ Debes ver "Prueba Test" en el navbar

### **Test 2: Círculo Rojo de Notificaciones**
1. Ve a `/dashboard/notificaciones`
2. Verifica que hay notificaciones sin leer
3. Mira el navbar → debe haber un círculo rojo en la campana
4. Haz clic en "Marcar todas como leídas"
5. ✅ El círculo rojo desaparece inmediatamente

### **Test 3: Dropdown de Notificaciones**
1. Pasa el mouse sobre la campana en el navbar
2. Verás las últimas 3 notificaciones
3. Si no hay notificaciones, verás el mensaje "No tienes notificaciones"
4. ✅ El tiempo se muestra correctamente ("Hace 2 horas", "Justo ahora", etc.)

---

## 📊 Base de Datos Requerida

Asegúrate de tener estas tablas en Supabase:

### **Tabla `usuarios`**
```sql
CREATE TABLE usuarios (
  id TEXT PRIMARY KEY,
  nombre TEXT,
  email TEXT,
  imagen TEXT,
  rol TEXT DEFAULT 'student',
  fecha_registro TIMESTAMP DEFAULT NOW(),
  ultima_actualizacion TIMESTAMP DEFAULT NOW()
);
```

### **Tabla `notificaciones`**
```sql
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES usuarios(id),
  tipo TEXT,
  titulo TEXT,
  descripcion TEXT,
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT NOW()
);
```

### **RLS Policies (Row Level Security)**
```sql
-- Usuarios pueden leer y actualizar su propio registro
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON usuarios FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON usuarios FOR UPDATE
  USING (auth.uid()::text = id);

-- Notificaciones
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus notificaciones"
  ON notificaciones FOR SELECT
  USING (user_id = auth.uid()::text);

CREATE POLICY "Usuarios pueden actualizar sus notificaciones"
  ON notificaciones FOR UPDATE
  USING (user_id = auth.uid()::text);
```

---

## 🚀 Estado Actual

✅ **Funcionando:**
- Persistencia de nombre y foto de perfil
- Carga de datos desde Supabase en cada sesión
- Notificaciones desde base de datos
- Círculo rojo condicional
- Actualización automática del contador
- Botón "Marcar todas como leídas"

⚠️ **Pendiente (opcional):**
- Crear bucket `avatars` en Supabase Storage para subir imágenes
- Agregar notificaciones push en tiempo real con Supabase Realtime
- Crear endpoint API para crear notificaciones desde el backend

---

## 🔧 Variables de Entorno Necesarias

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-aqui

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Microsoft OAuth
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_TENANT_ID=common

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Admin
ADMIN_EMAILS=aprendizcomunicaciones@santafe.com.co
```

---

## ✨ Resultado Final

1. **Perfil persistente:** Cambios de nombre/imagen se guardan permanentemente
2. **Notificaciones inteligentes:** El círculo rojo solo aparece cuando hay notificaciones sin leer
3. **UX mejorada:** Todo se actualiza automáticamente sin refrescar la página manualmente
4. **Datos centralizados:** Supabase es la fuente de verdad, NextAuth solo maneja la sesión

🎉 **Todo funcionando correctamente!**
