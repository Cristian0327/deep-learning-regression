# 🚀 INSTRUCCIONES PARA COMPLETAR LA CONFIGURACIÓN

## ✅ LO QUE YA ESTÁ HECHO (Por mí)

1. ✅ **Archivo SQL** → `supabase/supabase-progreso.sql`
2. ✅ **Página de Perfil** → `/perfil` (muestra cursos, certificados, estadísticas)
3. ✅ **Dashboard con datos reales** → Conectado a Supabase
4. ✅ **Sistema de inscripción** → Con clave de acceso
5. ✅ **Progreso automático** → Se guarda al completar lecciones
6. ✅ **Protección de rutas** → Solo admins pueden acceder a /AdminCursos
7. ✅ **Enlace de perfil** → En Navbar (escritorio y móvil)

---

## 📋 LO QUE DEBES HACER TÚ

### 1️⃣ EJECUTAR EL SQL EN SUPABASE (5 minutos)

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard
2. Click en **"SQL Editor"** (icono de base de datos en el menú lateral)
3. Click en **"New Query"**
4. Abre el archivo: `academia-santafe/supabase/supabase-progreso.sql`
5. **Copia TODO el contenido** y pégalo en Supabase
6. Click en **"Run"** (botón verde abajo a la derecha)
7. Deberías ver: `Success. No rows returned`

**Verificar que se creó correctamente:**
```sql
-- Ejecuta esto en Supabase para verificar:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('inscripciones', 'progreso_lecciones', 'certificados', 'respuestas_evaluaciones');
```

Deberías ver 4 tablas listadas.

---

### 2️⃣ CONFIGURAR OUTLOOK/MICROSOFT LOGIN (15-20 minutos)

#### A. Registrar aplicación en Azure

1. Ve a: https://portal.azure.com
2. Busca **"Azure Active Directory"** o **"Microsoft Entra ID"**
3. Click en **"App registrations"** → **"New registration"**
4. Configuración:
   - **Name**: `Academia Santafe LMS`
   - **Supported account types**: Selecciona la opción que necesites:
     - Solo tu organización (Work accounts)
     - Multitenant (Work + Personal)
     - Solo Personal (Outlook.com, Hotmail, etc.)
   - **Redirect URI**: 
     - Tipo: **Web**
     - URL: `http://localhost:3000/api/auth/callback/azure-ad`
5. Click **"Register"**

#### B. Obtener credenciales

1. En la página Overview, **COPIA**:
   - **Application (client) ID**
   - **Directory (tenant) ID**

2. Ve a **"Certificates & secrets"** (menú lateral)
3. Click **"New client secret"**
4. Descripción: `Academia Santafe Secret`
5. Expiración: **24 months** (recomendado)
6. Click **"Add"**
7. **¡IMPORTANTE!** Copia el **Value** INMEDIATAMENTE (solo se muestra una vez)

#### C. Configurar permisos

1. Ve a **"API permissions"**
2. Click **"Add a permission"** → **"Microsoft Graph"**
3. Selecciona **"Delegated permissions"**
4. Busca y agrega:
   - ✅ `User.Read` (ver perfil del usuario)
   - ✅ `email` (obtener email)
   - ✅ `profile` (obtener nombre y foto)
   - ✅ `openid` (autenticación OpenID)
   - ✅ `Mail.Send` (opcional, si quieres enviar correos)
5. Click **"Add permissions"**
6. (Opcional) Si tienes permisos de admin: Click **"Grant admin consent for [tu org]"**

#### D. Agregar URL de producción (cuando despliegues)

1. Ve a **"Authentication"**
2. En **"Redirect URIs"**, click **"Add URI"**
3. Agrega: `https://tu-dominio.com/api/auth/callback/azure-ad`
4. Click **"Save"**

---

### 3️⃣ CONFIGURAR VARIABLES DE ENTORNO

#### Archivo: `academia-santafe/.env.local`

Crea o actualiza este archivo con:

```env
# ============================================
# SUPABASE (Ya deberías tenerlo)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_aqui

# ============================================
# NEXTAUTH (Autenticación)
# ============================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera_uno_nuevo_con_el_comando_de_abajo

# ============================================
# MICROSOFT / OUTLOOK (Lo que acabas de crear)
# ============================================
MICROSOFT_CLIENT_ID=tu_application_client_id
MICROSOFT_CLIENT_SECRET=tu_client_secret_value
MICROSOFT_TENANT_ID=tu_tenant_id

# ============================================
# GOOGLE (Opcional - Si quieres Google Login)
# ============================================
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=

# ============================================
# ADMINISTRADORES (Emails con acceso a /AdminCursos)
# ============================================
ADMIN_EMAILS=tu-email@outlook.com,otro-admin@gmail.com
```

#### Generar NEXTAUTH_SECRET

En PowerShell ejecuta:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

O usa este online: https://generate-secret.vercel.app/32

---

### 4️⃣ PROBAR QUE TODO FUNCIONA

1. **Reinicia el servidor**:
   ```powershell
   cd academia-santafe
   npm run dev
   ```

2. **Prueba el login**:
   - Ve a: http://localhost:3000
   - Click en **"Iniciar Sesión"**
   - Deberías ver el botón de **Microsoft**
   - Inicia sesión con Outlook

3. **Prueba la inscripción**:
   - Ve a un curso: http://localhost:3000/cursos
   - Click en un curso
   - Ingresa la clave de inscripción
   - Debería inscribirte automáticamente

4. **Prueba el progreso**:
   - Ve a una lección del curso
   - Marca como completada
   - Ve a `/dashboard` → Debería mostrar el progreso

5. **Prueba el perfil**:
   - Click en tu foto/avatar en Navbar
   - Click en **"Mi Perfil"**
   - Deberías ver tus cursos inscritos y estadísticas

---

## 🔒 SEGURIDAD IMPORTANTE

### Protección de Admin

El middleware ya está configurado. Para que un usuario sea admin:

1. Agrega su email en `.env.local`:
   ```env
   ADMIN_EMAILS=admin@outlook.com,instructor@gmail.com
   ```

2. Reinicia el servidor

3. Ese usuario verá:
   - Link "Administración" en Navbar
   - Acceso a `/AdminCursos`
   - Otros usuarios serán redirigidos a `/dashboard`

---

## 🌐 DESPLEGAR A PRODUCCIÓN (Netlify/Vercel)

### Opción A: Vercel (Recomendado para Next.js)

1. Ve a: https://vercel.com
2. Click **"Import Project"**
3. Conecta tu repositorio de GitHub
4. En **"Environment Variables"**, agrega TODAS las variables de `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXTAUTH_URL` → Cambiar a `https://tu-dominio.vercel.app`
   - `NEXTAUTH_SECRET`
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_CLIENT_SECRET`
   - `MICROSOFT_TENANT_ID`
   - `ADMIN_EMAILS`

5. Click **"Deploy"**

6. **IMPORTANTE**: Ve a Azure Portal:
   - Agrega la URL de Vercel en **Redirect URIs**:
     - `https://tu-proyecto.vercel.app/api/auth/callback/azure-ad`

### Opción B: Netlify

1. Ve a: https://netlify.com
2. Click **"Add new site"** → **"Import existing project"**
3. Conecta GitHub
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. En **Environment variables**, agrega las mismas de arriba
6. Deploy
7. Agrega la URL en Azure Portal (igual que Vercel)

---

## ✅ CHECKLIST FINAL

- [ ] SQL ejecutado en Supabase (4 tablas creadas)
- [ ] App registrada en Azure Portal
- [ ] Credenciales copiadas (Client ID, Secret, Tenant ID)
- [ ] `.env.local` configurado con todas las variables
- [ ] `ADMIN_EMAILS` tiene al menos un email
- [ ] Login con Outlook funciona en localhost
- [ ] Inscripción a curso funciona
- [ ] Progreso se guarda automáticamente
- [ ] Dashboard muestra datos reales
- [ ] Perfil muestra cursos y estadísticas
- [ ] Solo admins pueden acceder a `/AdminCursos`

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Invalid redirect URI"
- Verifica que la URL en Azure Portal sea EXACTA (sin espacios, con `/api/auth/callback/azure-ad`)

### Error: "NEXTAUTH_SECRET not configured"
- Genera un nuevo secret con el comando de arriba
- Agrégalo a `.env.local`
- Reinicia el servidor

### No veo mis cursos en Dashboard
- Verifica que ejecutaste el SQL correctamente
- Inspecciona la consola del navegador (F12)
- Verifica que `session.user.id` tenga un valor

### No puedo acceder a /AdminCursos
- Verifica que tu email esté en `ADMIN_EMAILS`
- Reinicia el servidor después de cambiar `.env.local`
- Cierra sesión y vuelve a iniciar

---

## 📧 PRÓXIMOS PASOS (Opcional)

1. **Enviar correos con Outlook**:
   - Usa Microsoft Graph API
   - Endpoint: `https://graph.microsoft.com/v1.0/me/sendMail`
   - Requiere permiso `Mail.Send`

2. **Generar certificados automáticamente**:
   - Cuando progreso = 100%
   - Usar la función `generarCertificado()` que ya tienes
   - Guardar en tabla `certificados`

3. **Notificaciones por email**:
   - Curso completado → Enviar certificado
   - Nueva lección disponible → Notificar

---

**¡Todo está listo!** Solo necesitas ejecutar el SQL y configurar Outlook. El resto ya funciona. 🚀
