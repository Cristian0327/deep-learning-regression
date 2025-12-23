# 📚 Academia Ladrillera Santafé

Plataforma educativa corporativa desarrollada con Next.js 14, diseñada específicamente para la gestión de cursos, capacitaciones y certificaciones del equipo de Ladrillera Santafé.

## 🎨 Diseño

- **Colores Corporativos:**
  - Azul Primario: `#1226aa`
  - Naranja Secundario: `#e87200`
  - Blanco: Base principal
- **Tipografía:** Poppins (Google Fonts)
- **Estilo:** Moderno, limpio, profesional, sin degradados

## ✨ Funcionalidades Principales

### Para Administradores/Instructores

- ✅ Autenticación con Google y Microsoft Outlook
- ✅ Subir cursos completos (carpetas con múltiples videos)
- ✅ Gestión de lecciones y módulos
- ✅ Subir materiales complementarios (PDFs, documentos)
- ✅ Ver analytics y reportes de estudiantes
- ✅ Gestionar usuarios y roles
- ✅ Configurar certificados dinámicos

### Para Estudiantes

- ✅ Login con Gmail o Outlook corporativo
- ✅ Explorar catálogo de cursos con filtros
- ✅ Inscribirse en cursos
- ✅ Reproductor de video con tracking automático de progreso
- ✅ Tomar notas durante las clases
- ✅ Calificar cursos y dejar reviews
- ✅ Dashboard personal con estadísticas
- ✅ Descargar certificados al completar cursos

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Autenticación:** NextAuth.js (Google + Microsoft OAuth)
- **Base de Datos:** Firebase Firestore
- **Storage:** Firebase Storage
- **Animaciones:** Framer Motion
- **Íconos:** Lucide React
- **Generación de PDFs:** jsPDF
- **QR Codes:** qrcode

## 📦 Instalación

### 1. Clonar el repositorio

```bash
cd "c:\Users\CRISTIAN\Downloads\Chamba\Pagina Educativa"
```

### 2. Instalar dependencias

```powershell
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` basado en `.env.example`:

```bash
copy .env.example .env.local
```

Llena las siguientes variables:

#### NextAuth

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-uno-con-openssl-rand-base64-32
```

#### Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita "Google+ API"
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:3000/api/auth/callback/google` como URI de redireccionamiento

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
```

#### Microsoft OAuth

1. Ve a [Azure Portal](https://portal.azure.com/)
2. Registra una nueva aplicación
3. Agrega `http://localhost:3000/api/auth/callback/microsoft-entra-id` como URI de redireccionamiento

```env
MICROSOFT_CLIENT_ID=tu-client-id
MICROSOFT_CLIENT_SECRET=tu-client-secret
MICROSOFT_TENANT_ID=common
```

#### Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Authentication (Google + Microsoft)
4. Habilita Firestore Database
5. Habilita Storage
6. Copia las credenciales

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

Para Firebase Admin (server-side):

```env
FIREBASE_ADMIN_PROJECT_ID=tu-proyecto-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA\n-----END PRIVATE KEY-----\n"
```

### 4. Ejecutar en desarrollo

```powershell
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
academia-santafe/
├── app/
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts  # Configuración NextAuth
│   ├── admin/                           # Panel de administración
│   ├── cursos/                          # Catálogo y detalle de cursos
│   ├── dashboard/                       # Dashboard del estudiante
│   ├── perfil/                          # Perfil de usuario
│   ├── globals.css                      # Estilos globales
│   ├── layout.tsx                       # Layout principal
│   └── page.tsx                         # Página de inicio
├── components/
│   ├── home/                            # Componentes de la landing
│   ├── layout/                          # Navbar, Footer
│   ├── admin/                           # Componentes del panel admin
│   ├── course/                          # Componentes de cursos
│   └── providers/                       # Providers (Session, etc.)
├── lib/
│   ├── firebase/
│   │   ├── config.ts                    # Cliente Firebase
│   │   └── admin.ts                     # Firebase Admin
│   └── utils/                           # Utilidades
├── types/                               # TypeScript types
├── public/                              # Assets estáticos
└── package.json
```

## 👨‍💼 Guía para Administradores

### Cómo Subir un Curso

#### Paso 1: Organizar la carpeta del curso

Crea una carpeta en tu computadora con esta estructura:

```
📁 Nombre del Curso/
  📄 info.txt
  🖼️ portada.jpg
  📁 modulo-1-introduccion/
    📹 1-Video.mp4
    📹 2-Video.mp4
  📁 modulo-2-conceptos/
    📹 1-Video.mp4
    📹 2-Video.mp4
  📁 materiales/
    📄 Manual.pdf
    📄 Guia.pdf
```

#### Paso 2: Crear el archivo `info.txt`

Copia y llena esta plantilla:

```txt
Título: Seguridad en Alturas - Nivel Básico
Instructor: Ing. Carlos Rodríguez
Categoría: Seguridad Industrial
Nivel: Básico
Duración: 4 horas
Descripción: Curso completo sobre normativas y procedimientos para trabajo en alturas según normativa colombiana.
Requisitos: Ninguno
```

#### Paso 3: Subir a la plataforma

1. Inicia sesión con tu cuenta de Outlook corporativo
2. Ve a **"Administrar"** en el menú superior
3. Click en **"Nuevo Curso"**
4. Arrastra la carpeta completa del curso
5. Espera a que se suban los videos (2-5 min según tamaño)
6. ✅ ¡Listo! El curso estará visible para todos

### Reglas de Firestore (Seguridad)

Configura estas reglas en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Courses
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth.token.role in ['admin', 'instructor'];
    }
    
    // Progress
    match /progress/{progressId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Reviews
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

### Reglas de Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /courses/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['admin', 'instructor'];
    }
    
    match /certificates/{allPaths=**} {
      allow read: if request.auth != null;
    }
  }
}
```

## 🚀 Despliegue en Producción

### Opción 1: Vercel (Recomendado)

1. Instala Vercel CLI:
```powershell
npm i -g vercel
```

2. Deploy:
```powershell
vercel
```

3. Configura las variables de entorno en el dashboard de Vercel

### Opción 2: Netlify

```powershell
npm run build
netlify deploy --prod
```

## 📊 Configurar Primer Admin

Después del primer deploy, necesitas asignar el rol de admin manualmente:

1. Ve a Firebase Console → Firestore
2. Busca la colección `users`
3. Encuentra tu usuario (por email)
4. Edita el campo `role` y cambia a `admin`

## 🎓 Cómo Funciona el Sistema de Certificados

1. El estudiante completa el 100% del curso
2. Automáticamente se genera un PDF con:
   - Nombre del estudiante
   - Nombre del curso
   - Fecha de finalización
   - Código QR de verificación único
3. El certificado se guarda en Firebase Storage
4. El estudiante puede descargarlo desde su dashboard

## 📱 Responsive Design

La plataforma es completamente responsive:
- **Mobile:** Hamburger menu, cards apiladas
- **Tablet:** Grid de 2 columnas
- **Desktop:** Grid de 3+ columnas, menú completo

## 🔒 Seguridad

- Autenticación OAuth 2.0
- Tokens JWT seguros
- Firestore Security Rules
- Storage Rules por rol
- HTTPS obligatorio en producción
- Variables de entorno protegidas

## 🐛 Troubleshooting

### Error: "Cannot find module 'next-auth'"

```powershell
npm install
```

### Los videos no se reproducen

- Verifica que los videos estén en formato MP4
- Verifica las reglas de Storage en Firebase
- Comprueba que el usuario esté autenticado

### No puedo subir cursos

- Verifica que tu rol sea `admin` o `instructor` en Firestore
- Comprueba las reglas de Storage

## 📞 Soporte

Para soporte técnico, contacta a:
- **Email:** cristian@ladrillera-santafe.com
- **Tel:** +57 (123) 456-7890

## 📝 Licencia

© 2025 Ladrillera Santafé. Todos los derechos reservados.

---

**Desarrollado con ❤️ por Cristian - Ing. Multimedia**
