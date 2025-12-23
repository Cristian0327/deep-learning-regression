# 🔧 Guía de Configuración Completa

Esta guía te llevará paso a paso para configurar todos los servicios necesarios para la plataforma.

## 📋 Índice
1. [Configurar Firebase](#1-configurar-firebase)
2. [Configurar Google OAuth](#2-configurar-google-oauth)
3. [Configurar Microsoft OAuth](#3-configurar-microsoft-oauth)
4. [Configurar NextAuth](#4-configurar-nextauth)
5. [Configurar Variables de Entorno](#5-configurar-variables-de-entorno)

---

## 1. Configurar Firebase

### Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en **"Agregar proyecto"**
3. Nombre: `academia-santafe` (o el que prefieras)
4. Desactiva Google Analytics (opcional)
5. Click en **"Crear proyecto"**

### Paso 2: Configurar Firestore Database

1. En el menú lateral, click en **"Firestore Database"**
2. Click en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de producción"**
4. Ubicación: `southamerica-east1` (São Paulo - más cercano a Colombia)
5. Click en **"Habilitar"**

### Paso 3: Configurar Storage

1. En el menú lateral, click en **"Storage"**
2. Click en **"Comenzar"**
3. Acepta las reglas predeterminadas
4. Ubicación: `southamerica-east1`
5. Click en **"Listo"**

### Paso 4: Obtener Credenciales

1. Click en el ícono de **configuración** (⚙️) → **"Configuración del proyecto"**
2. Desplázate hasta **"Tus apps"**
3. Click en el ícono **"</>"** (Web)
4. Apodo de la app: `Academia Santafe Web`
5. **NO** marques "Firebase Hosting"
6. Click en **"Registrar app"**
7. **Copia** todas las credenciales que aparecen:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "academia-santafe.firebaseapp.com",
  projectId: "academia-santafe",
  storageBucket: "academia-santafe.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

Guarda estos valores, los necesitarás en las variables de entorno.

### Paso 5: Configurar Reglas de Seguridad - Firestore

1. Ve a **Firestore Database → Reglas**
2. Pega el siguiente código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Función helper para verificar autenticación
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Función para verificar si es admin
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Usuarios
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn() && request.auth.uid == userId;
      allow update: if isAdmin(); // Solo admin puede cambiar roles
    }
    
    // Cursos
    match /courses/{courseId} {
      allow read: if true; // Todos pueden ver cursos
      allow create, update, delete: if isAdmin();
    }
    
    // Lecciones
    match /lessons/{lessonId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    
    // Inscripciones
    match /enrollments/{enrollmentId} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
    
    // Progreso de lecciones
    match /lessonProgress/{progressId} {
      allow read, write: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
    
    // Reseñas
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && resource.data.userId == request.auth.uid;
    }
    
    // Certificados
    match /certificates/{certificateId} {
      allow read: if isSignedIn();
      allow create, update: if isAdmin();
    }
  }
}
```

3. Click en **"Publicar"**

### Paso 6: Configurar Reglas de Seguridad - Storage

1. Ve a **Storage → Reglas**
2. Pega el siguiente código:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Videos de cursos
    match /courses/{courseId}/{allPaths=**} {
      allow read: if true; // Todos pueden ver (videos públicos)
      allow write: if request.auth != null && 
                     request.auth.token.role == 'admin';
    }
    
    // Materiales descargables
    match /materials/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.token.role == 'admin';
    }
    
    // Certificados
    match /certificates/{userId}/{allPaths=**} {
      allow read: if request.auth != null && 
                    request.auth.uid == userId;
      allow write: if request.auth != null && 
                     request.auth.token.role == 'admin';
    }
    
    // Templates de certificados
    match /templates/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     request.auth.token.role == 'admin';
    }
  }
}
```

3. Click en **"Publicar"**

---

## 2. Configurar Google OAuth

### Paso 1: Ir a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombre: `Academia Santafe`

### Paso 2: Habilitar API

1. En el menú, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Google+ API"**
3. Click en **"Habilitar"**

### Paso 3: Configurar Pantalla de Consentimiento

1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento de OAuth"**
2. Tipo: **Interno** (si tu dominio es de Google Workspace) o **Externo**
3. Completa los campos:
   - Nombre: `Academia Ladrillera Santafé`
   - Email de soporte: tu email
   - Logo: (opcional) sube el logo de la empresa
4. Alcances: No agregues ninguno por ahora
5. Usuarios de prueba: Agrega tu email para testing
6. Click en **"Guardar y continuar"**

### Paso 4: Crear Credenciales OAuth

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Click en **"+ CREAR CREDENCIALES"** → **"ID de cliente de OAuth 2.0"**
3. Tipo: **Aplicación web**
4. Nombre: `Academia Web`
5. **URIs de redirección autorizados:**
   - Desarrollo: `http://localhost:3000/api/auth/callback/google`
   - Producción: `https://tu-dominio.com/api/auth/callback/google`
6. Click en **"Crear"**
7. **Copia** el `Client ID` y `Client Secret`

---

## 3. Configurar Microsoft OAuth

### Paso 1: Ir a Azure Portal

1. Ve a [Azure Portal](https://portal.azure.com/)
2. Busca **"Registros de aplicaciones"** (App registrations)
3. Click en **"+ Nuevo registro"**

### Paso 2: Registrar Aplicación

1. Nombre: `Academia Ladrillera Santafé`
2. Tipos de cuenta: **Cuentas en cualquier directorio organizativo (Multiinquilino)**
3. URI de redirección:
   - Tipo: **Web**
   - URL: `http://localhost:3000/api/auth/callback/microsoft`
4. Click en **"Registrar"**

### Paso 3: Obtener Credenciales

1. En la página de **Información general**, copia:
   - **Id. de aplicación (cliente)** → Este es tu `MICROSOFT_CLIENT_ID`
   - **Id. de directorio (inquilino)** → Este es tu `MICROSOFT_TENANT_ID`

### Paso 4: Crear Client Secret

1. Ve a **"Certificados y secretos"** en el menú lateral
2. Click en **"+ Nuevo secreto de cliente"**
3. Descripción: `Academia Web Secret`
4. Expiración: **24 meses** (máximo)
5. Click en **"Agregar"**
6. **¡IMPORTANTE!** Copia el **Valor** inmediatamente (solo se muestra una vez)
   - Este es tu `MICROSOFT_CLIENT_SECRET`

### Paso 5: Configurar Permisos

1. Ve a **"Permisos de API"**
2. Deberías ver `Microsoft Graph - User.Read` (ya incluido)
3. Click en **"+ Agregar un permiso"**
4. Selecciona **Microsoft Graph**
5. Selecciona **Permisos delegados**
6. Marca:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
7. Click en **"Agregar permisos"**
8. Click en **"Conceder consentimiento de administrador"** (si tienes permisos)

### Paso 6: Agregar URI de Producción

1. Ve a **"Autenticación"**
2. En **URI de redirección**, click en **"+ Agregar URI"**
3. Agrega: `https://tu-dominio.com/api/auth/callback/microsoft`
4. Click en **"Guardar"**

---

## 4. Configurar NextAuth

### Generar Secret

Ejecuta en PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copia el resultado, lo usarás en `NEXTAUTH_SECRET`.

---

## 5. Configurar Variables de Entorno

### Paso 1: Copiar Archivo de Ejemplo

```powershell
Copy-Item .env.local.example .env.local
```

### Paso 2: Completar Variables

Abre `.env.local` y completa con los valores que obtuviste:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-generado-en-paso-anterior

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123...

# Microsoft OAuth
MICROSOFT_CLIENT_ID=12345678-1234-1234-1234-123456789abc
MICROSOFT_CLIENT_SECRET=abc123~ABC...
MICROSOFT_TENANT_ID=common

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=academia-santafe.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=academia-santafe
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=academia-santafe.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123...

# Admin Emails (separados por comas)
ADMIN_EMAILS=admin@ladrillera-santafe.com,tu-email@ladrillera-santafe.com
```

### Paso 3: Reiniciar Servidor

```powershell
# Detener el servidor (Ctrl+C)
# Volver a iniciar
npm run dev
```

---

## ✅ Verificación

1. Abre [http://localhost:3000](http://localhost:3000)
2. Click en **"Iniciar Sesión"**
3. Deberías ver opciones para **Google** y **Microsoft**
4. Prueba iniciar sesión con ambos métodos

---

## 🚨 Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que las URIs en Google/Microsoft coincidan exactamente
- Asegúrate de incluir `/api/auth/callback/google` o `/microsoft`

### Error: "invalid_client"
- Verifica que copiaste correctamente el Client ID y Secret
- Sin espacios al inicio o final

### Firebase: "Permission denied"
- Verifica que publicaste las reglas de seguridad
- Asegúrate de estar autenticado

### No aparece opción de login
- Verifica que las variables de entorno estén en `.env.local`
- Reinicia el servidor después de cambiar variables

---

## 📞 Soporte

Si tienes problemas:
1. Revisa esta guía paso a paso
2. Verifica los logs en la consola del navegador (F12)
3. Contacta al desarrollador

---

**¡Listo!** Ahora tu plataforma está completamente configurada.
