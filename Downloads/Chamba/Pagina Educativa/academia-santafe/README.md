# 📚 Academia Ladrillera Santafé

Plataforma de capacitación y formación continua diseñada específicamente para el personal de Ladrillera Santafé.

## 🎯 Características

### Para Estudiantes
- ✅ Autenticación con Google y Microsoft (Outlook)
- ✅ Exploración de cursos por categorías
- ✅ Reproductor de video con seguimiento de progreso
- ✅ Dashboard personalizado con estadísticas
- ✅ Tomar notas durante las lecciones
- ✅ Calificar y comentar cursos
- ✅ Descargar certificados automáticos al completar cursos
- ✅ Materiales descargables (PDFs, documentos)

### Para Administradores/Instructores
- ✅ Panel de administración intuitivo
- ✅ Subir cursos mediante drag & drop de carpetas
- ✅ Gestión de usuarios y roles
- ✅ Analytics de estudiantes y cursos
- ✅ Generación automática de certificados
- ✅ Moderación de reseñas

## 🎨 Diseño

La plataforma utiliza la identidad corporativa de Ladrillera Santafé:

- **Colores principales:**
  - Azul corporativo: `#1226aa`
  - Naranja corporativo: `#e87200`
  - Blanco: `#ffffff`

- **Tipografía:** Poppins (Google Fonts)
- **Estilo:** Moderno, limpio y profesional

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+ instalado
- Cuenta de Firebase
- Credenciales OAuth de Google y Microsoft

### Instalación

1. **Instalar dependencias:**
```powershell
npm install
```

2. **Configurar variables de entorno:**

Copia `.env.local.example` a `.env.local` y completa los valores:

```bash
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=genera-secreto-con-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=tu-microsoft-client-id
MICROSOFT_CLIENT_SECRET=tu-microsoft-client-secret

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Admin Emails
ADMIN_EMAILS=admin@ladrillera-santafe.com
```

3. **Ejecutar en modo desarrollo:**
```powershell
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📝 Cómo Subir un Curso

### Estructura de Carpeta

Crea una carpeta con la siguiente estructura:

```
📁 Nombre-del-Curso/
  📄 info.txt
  🖼️ portada.jpg
  📁 modulo-1-introduccion/
    📹 1-Video-Leccion.mp4
    📹 2-Segundo-Video.mp4
  📁 modulo-2-contenido/
    📹 1-Leccion-Principal.mp4
    📹 2-Ejercicios.mp4
  📁 materiales/
    📄 Manual.pdf
    📄 Presentacion.pptx
```

### Archivo `info.txt`

```
Título: Seguridad en Alturas
Instructor: Ing. Carlos Rodríguez
Categoría: Seguridad Industrial
Duración: 4 horas
Descripción: Curso completo sobre normativas y procedimientos para trabajo en alturas según normativa colombiana.
Requisitos: Ninguno
Nivel: Básico
```

### Pasos para Publicar

1. Inicia sesión con tu cuenta de administrador
2. Ve a **Administración → Nuevo Curso**
3. Arrastra la carpeta completa del curso
4. Espera a que los videos se suban (2-10 min según tamaño)
5. Revisa la vista previa
6. Click en **Publicar**

¡Listo! El curso estará disponible inmediatamente para los estudiantes.

## 🔐 Sistema de Roles

- **Estudiante (student):** Puede ver cursos, inscribirse, tomar lecciones y obtener certificados
- **Instructor:** Puede subir y gestionar sus propios cursos
- **Administrador (admin):** Acceso total a la plataforma, gestión de usuarios y cursos

Los emails en `ADMIN_EMAILS` tendrán rol de administrador automáticamente.

## 🎓 Certificados

Los certificados se generan automáticamente cuando un estudiante completa el 100% de un curso.

### Plantilla de Certificado

1. Sube un PDF o imagen base en **Administración → Configuración → Certificados**
2. El sistema reemplazará dinámicamente:
   - Nombre del estudiante
   - Nombre del curso
   - Fecha de finalización
   - Código QR de verificación

## 📊 Tech Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Autenticación:** NextAuth.js (Google + Microsoft OAuth)
- **Base de Datos:** Firebase Firestore
- **Almacenamiento:** Firebase Storage
- **Video Player:** React Player
- **PDF Generation:** jsPDF
- **Icons:** Lucide React

## 🌐 Despliegue en Producción

### Opción 1: Vercel (Recomendado)

1. Crea una cuenta en [Vercel](https://vercel.com)
2. Conecta el repositorio
3. Configura las variables de entorno
4. Deploy automático con cada push

### Opción 2: Otro hosting

```powershell
npm run build
npm run start
```

## 📱 Responsive

La plataforma es completamente responsive y funciona en:
- 📱 Móviles
- 📱 Tablets
- 💻 Laptops
- 🖥️ Monitores grandes

## 🔧 Mantenimiento

### Actualizar dependencias
```powershell
npm update
```

### Limpiar caché
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

## 📞 Soporte

Para dudas técnicas o problemas:
- Email: soporte-tecnico@ladrillera-santafe.com
- Desarrollador: Cristian (Pasante Ing. Multimedia)

## 📄 Licencia

Uso exclusivo de Ladrillera Santafé. Todos los derechos reservados.

---

**Desarrollado con** ❤️ **por el equipo de Ladrillera Santafé**

