# 🚀 Checklist de Configuración para Producción

## 📋 Cuando suban a Vercel/Netlify

### ✅ **Paso 1: Obtener el Dominio**

Después de hacer deploy en Vercel, obtendrás algo como:
```
https://academia-santafe.vercel.app
```

O tu dominio personalizado:
```
https://tudominio.com
```

**COPIA este dominio** - lo usarás en todos los pasos siguientes.

---

## 🔐 **Paso 2: Configurar Google OAuth**

1. Ve a: https://console.cloud.google.com/apis/credentials

2. Click en tu **OAuth 2.0 Client ID** (el que creaste para desarrollo)

3. En **"URIs de redireccionamiento autorizados"**, click **"AGREGAR URI"**

4. Agrega:
   ```
   https://academia-santafe.vercel.app/api/auth/callback/google
   ```
   (Reemplaza con tu dominio real)

5. **GUARDAR**

6. ✅ Listo (1 minuto)

---

## 🔐 **Paso 3: Configurar Microsoft OAuth**

1. Ve a: https://portal.azure.com

2. Azure Active Directory → Aplicaciones → Tu aplicación

3. **Autenticación** (menú lateral)

4. En **"URI de redireccionamiento"**, click **"Agregar una plataforma"** → **"Web"**

5. Agrega:
   ```
   https://academia-santafe.vercel.app/api/auth/callback/microsoft
   ```

6. **CONFIGURAR**

7. ✅ Listo (1 minuto)

---

## 🎬 **Paso 4: Configurar YouTube API (Opcional - Solo si usas API oficial)**

1. Ve a: https://console.cloud.google.com/apis/credentials

2. Click en tu **API Key de YouTube**

3. En **"Restricciones de sitios web HTTP"**, click **"AGREGAR UN ELEMENTO"**

4. Agrega:
   ```
   https://academia-santafe.vercel.app/*
   ```

5. **GUARDAR**

6. ✅ Listo (1 minuto)

---

## ⚙️ **Paso 5: Variables de Entorno en Vercel**

En tu panel de Vercel:

1. Settings → **Environment Variables**

2. Agrega TODAS estas variables:

```env
# NextAuth
NEXTAUTH_URL=https://academia-santafe.vercel.app
NEXTAUTH_SECRET=genera-un-nuevo-secret-para-produccion-aqui-12345

# Google OAuth (los mismos que tienes en .env.local)
GOOGLE_CLIENT_ID=tu_client_id_de_google
GOOGLE_CLIENT_SECRET=tu_client_secret_de_google

# Microsoft OAuth (los mismos que tienes en .env.local)
MICROSOFT_CLIENT_ID=tu_client_id_de_microsoft
MICROSOFT_CLIENT_SECRET=tu_client_secret_de_microsoft
MICROSOFT_TENANT_ID=tu_tenant_id

# Supabase (los mismos que tienes en .env.local)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase

# YouTube API (opcional - solo si usas API oficial)
YOUTUBE_API_KEY=tu_api_key_de_youtube

# Admin Emails
ADMIN_EMAILS=admin@ladrillera-santafe.com
```

3. Click **"Save"** en cada una

4. ✅ Listo (3 minutos)

---

## 🔄 **Paso 6: Redeploy**

En Vercel:

1. Deployments → Click en el último deployment

2. Click **"Redeploy"**

3. Espera 1-2 minutos

4. ✅ ¡Listo!

---

## ✅ **Verificación Final**

Prueba en tu sitio de producción:

### 1. Login con Google
```
https://academia-santafe.vercel.app
→ Click "Iniciar con Google"
→ Debería funcionar ✅
```

### 2. Login con Microsoft
```
https://academia-santafe.vercel.app
→ Click "Iniciar con Microsoft"
→ Debería funcionar ✅
```

### 3. Crear Curso
```
https://academia-santafe.vercel.app/AdminCursos
→ Crear curso con video de YouTube
→ Subtítulos deberían aparecer ✅
```

### 4. Certificados
```
→ Completar curso
→ Descargar certificado
→ Debería generarse en PDF ✅
```

---

## 🐛 **Solución de Problemas**

### Error: "Redirect URI mismatch"

**Causa:** El redirect URI no coincide exactamente

**Solución:**
1. Verifica que el dominio sea EXACTAMENTE igual
2. Debe incluir `https://` (no `http://`)
3. No debe tener `/` al final antes de `/api/auth`
4. Correcto: `https://tudominio.com/api/auth/callback/google`
5. Incorrecto: `http://tudominio.com/api/auth/callback/google/`

### Error: "NEXTAUTH_URL environment variable is not set"

**Causa:** Falta la variable NEXTAUTH_URL

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Agrega: `NEXTAUTH_URL=https://tudominio.com`
3. Redeploy

### Error: "Invalid client credentials"

**Causa:** Las credenciales OAuth no están en las variables de entorno

**Solución:**
1. Copia TODAS las variables de `.env.local`
2. Pégalas en Vercel Environment Variables
3. Redeploy

---

## ⏱️ **Tiempo Total de Configuración**

| Tarea | Tiempo |
|-------|--------|
| Google OAuth | 1 min |
| Microsoft OAuth | 1 min |
| YouTube API | 1 min |
| Variables de Entorno | 3 min |
| Redeploy | 2 min |
| **TOTAL** | **8 minutos** |

---

## 📝 **Notas Importantes**

1. ✅ **NO necesitas crear nuevas credenciales** - usas las mismas
2. ✅ **Solo agregas el dominio de producción** a las existentes
3. ✅ **Las de desarrollo (localhost) siguen funcionando**
4. ✅ **Puedes tener ambos al mismo tiempo** (desarrollo + producción)

---

## 🎯 **Resumen Ultra Rápido**

```
1. Obtén tu dominio de Vercel
2. Agrégalo a Google OAuth redirect URIs
3. Agrégalo a Microsoft OAuth redirect URIs
4. Agrégalo a YouTube API (si usas)
5. Copia variables de entorno a Vercel
6. Redeploy
7. ¡Funciona! ✅
```

**Total: 8 minutos** ⏱️

---

¡Es todo! El sistema funciona exactamente igual en producción que en desarrollo 🚀
