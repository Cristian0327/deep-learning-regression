# ✅ SISTEMA COMPLETO - SIN BASE DE DATOS

## 🎯 Arquitectura del Sistema

### Backend: Express.js (Puerto 3001)
- **Ubicación**: `/api/server.js`
- **Almacenamiento**: Archivos JSON en `/data/cursos/`
- **Sin base de datos**: Solo usa sistema de archivos (fs)

### Frontend: Next.js (Puerto 3000)
- **Ubicación**: `/app/`
- **Lee cursos**: Desde backend Express vía HTTP
- **Guarda inscripciones**: localStorage del navegador

---

## 📦 ¿Dónde se Guarda Cada Cosa?

### 1. **CURSOS** → Backend (archivos JSON)
**Ubicación**: `data/cursos/{id}.json`

```json
{
  "id": "1703123456789",
  "titulo": "Introducción a React",
  "descripcion": "...",
  "categoria": "Desarrollo Web",
  "instructor": "Juan Pérez",
  "emailReporte": "instructor@example.com",
  "bloques": [...],
  "activo": true
}
```

**Cómo funcionan los cursos:**
1. Admin crea curso en `/AdminCursos` → Frontend envía POST al backend
2. Backend guarda archivo JSON en `/data/cursos/`
3. Estudiante entra a `/curso/[id]` → Frontend lee del backend
4. **TODOS los navegadores** ven el mismo curso (está en servidor)

✅ **Ventaja**: Los cursos se comparten entre TODOS los usuarios  
✅ **Persiste**: Los archivos quedan en el servidor  

---

### 2. **INSCRIPCIONES** → localStorage (navegador del estudiante)
**Ubicación**: `localStorage` del navegador del estudiante

**Key**: `inscripcion_{documento}_{cursoId}`

```json
{
  "nombre": "María González",
  "documento": "123456789",
  "cargo": "Desarrolladora",
  "empresa": "Tech SA",
  "cursoId": "1703123456789",
  "progreso": 45,
  "completado": false,
  "calificacion": 85,
  "fechaInscripcion": "2024-12-23T11:00:00Z"
}
```

**Cómo funcionan las inscripciones:**
1. Estudiante ingresa nombre/documento en modal
2. Datos se guardan en localStorage de SU navegador
3. Progreso se actualiza en SU navegador
4. Calificaciones se guardan en SU navegador

✅ **Privado**: Cada estudiante solo ve SU progreso  
✅ **Sin backend**: No requiere servidor para guardar  
⚠️ **Limitación**: Si cambia de navegador/PC, pierde progreso  

---

### 3. **DATOS DEL USUARIO ACTUAL** → localStorage
**Ubicación**: `localStorage` del navegador del estudiante

**Key**: `datosUsuarioActual`

```json
{
  "nombre": "María González",
  "documento": "123456789",
  "cargo": "Desarrolladora",
  "empresa": "Tech SA"
}
```

Se usa para:
- Identificar al usuario sin login
- Generar certificados con su nombre
- Asociar progreso y calificaciones

---

### 4. **REPORTES** → Email (SMTP)
**Ubicación**: Endpoint `/api/reportes-diarios/route.ts`

El admin puede:
1. Ver todas las inscripciones en `/admin/reportes`
2. Filtrar por curso
3. Exportar a CSV (descarga local)
4. **Enviar por email** con botón "Enviar Reporte"

**¿Cómo lee las inscripciones el admin?**
- El admin abre `/admin/reportes` en SU navegador
- El código JavaScript lee TODAS las keys de localStorage que empiezan con `inscripcion_`
- Las agrupa por curso y las muestra en tabla
- Las puede exportar a CSV

⚠️ **IMPORTANTE**: El admin solo ve las inscripciones de personas que han usado ESE MISMO NAVEGADOR/PC. Para ver todas las inscripciones de todos los estudiantes, necesitarían guardar inscripciones en el backend también.

---

## 🔄 Flujo Completo del Sistema

### Para el ADMINISTRADOR:

1. **Crear Curso**:
   ```
   Admin → AdminCursos → Crear curso → 
   Frontend POST al backend → 
   Backend guarda JSON en data/cursos/ → 
   ✅ Curso visible para TODOS
   ```

2. **Ver Reportes**:
   ```
   Admin → /admin/reportes → 
   JavaScript lee localStorage → 
   Muestra inscripciones → 
   Puede exportar CSV o enviar email
   ```

### Para el ESTUDIANTE:

1. **Inscribirse**:
   ```
   Estudiante → /curso/[id] → 
   Ingresa clave → 
   Modal pide nombre/documento → 
   Guarda en localStorage → 
   ✅ Inscrito
   ```

2. **Estudiar**:
   ```
   Estudiante → Ve contenido → 
   Completa lecciones → 
   Progreso se actualiza en localStorage → 
   Hace evaluaciones → 
   Calificación en localStorage
   ```

3. **Certificado**:
   ```
   Estudiante → Completa 100% → 
   Modal de certificado → 
   PDF generado con nombre de localStorage → 
   Descarga directa (no se guarda en servidor)
   ```

---

## 🚀 Despliegue en Producción

### Opción 1: Railway/Render (Backend + Frontend)

**Backend Express:**
```bash
# En Railway/Render
Build Command: cd api && npm install
Start Command: cd api && npm start
```

**Frontend Next.js:**
```bash
Build Command: npm install && npm run build
Start Command: npm start
```

**Variables de entorno:**
```env
# Frontend
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app

# Backend (ninguna necesaria, usa archivos locales)
```

### Opción 2: Netlify (Frontend) + Railway (Backend)

**Netlify (Next.js):**
- Conectar repo GitHub
- Build command: `npm run build`
- Variables: `NEXT_PUBLIC_API_URL=https://tu-backend.railway.app`

**Railway (Express):**
- Conectar repo GitHub
- Root Directory: `/api`
- Start Command: `npm start`

### Opción 3: Vercel (Frontend) + Railway (Backend)

Similar a Netlify, Vercel detecta Next.js automáticamente.

---

## ⚠️ Limitaciones y Soluciones

### Limitación 1: Admin solo ve inscripciones de su navegador

**Problema**: El admin no puede ver inscripciones de estudiantes que usaron otros navegadores.

**Soluciones**:

A) **Guardar inscripciones en backend también** (recomendado):
   ```javascript
   // Al inscribirse, además de localStorage:
   await fetch('/api/inscripciones', {
     method: 'POST',
     body: JSON.stringify(inscripcionData)
   });
   ```

B) **Exportar CSV y consolidar manualmente**:
   - Cada admin exporta CSV de su navegador
   - Se consolida en Excel

C) **Usar Google Sheets API**:
   - Cada inscripción se envía a Google Sheet compartido

### Limitación 2: Estudiante pierde progreso al cambiar de dispositivo

**Problema**: Si el estudiante cambia de PC/navegador, pierde su progreso.

**Soluciones**:

A) **Guardar progreso en backend** (recomendado):
   - Crear endpoint `/api/progreso/:documento/:cursoId`
   - Guardar progreso en archivos JSON
   - Al cargar curso, consultar backend primero

B) **Sistema de sincronización**:
   - Botón "Sincronizar con servidor"
   - Envía progreso de localStorage al backend
   - Al entrar, descarga progreso del backend

C) **Código QR con token**:
   - Al inscribirse, generar código QR con token único
   - Token apunta a archivo en servidor con progreso
   - Escanear QR en cualquier dispositivo

---

## 🎉 Lo Que SÍ Funciona (Tal Como Querías)

✅ **Cursos dinámicos**: Admin crea/edita cursos → Se guardan en servidor → Todos los ven  
✅ **Sin base de datos**: Solo archivos JSON en servidor Express  
✅ **Inscripción con nombre/documento**: Modal captura datos → localStorage  
✅ **Progreso guardado**: Cada estudiante tiene su progreso en su navegador  
✅ **Calificaciones**: Se guardan en localStorage del estudiante  
✅ **Certificados**: Se generan con el nombre que ingresó  
✅ **Reportes por email**: Admin envía reportes con inscripciones  
✅ **Exportar CSV**: Descarga de datos locales  
✅ **Se puede hostear**: Railway, Render, Netlify + Railway  

---

## 📝 Archivos Clave

### Backend (Express):
- `api/server.js` - Servidor principal
- `api/package.json` - Dependencias (express, cors)
- `data/cursos/` - Carpeta donde se guardan los cursos (JSON)

### Frontend (Next.js):
- `lib/api-client.ts` - Cliente HTTP para consumir backend
- `lib/api-config.ts` - Configuración de URL del backend
- `lib/inscripciones-storage.ts` - Helpers para localStorage
- `app/AdminCursos/page.tsx` - Panel de administración de cursos
- `app/admin/reportes/page.tsx` - Panel de reportes e inscripciones
- `app/curso/[id]/page.tsx` - Página del curso con inscripción
- `app/api/reportes-diarios/route.ts` - Endpoint de envío de emails

### Configuración:
- `.env.local` - Variables de entorno (API_URL, SMTP)

---

## 🔧 Comandos

### Desarrollo Local:
```bash
# Terminal 1: Backend
cd api
npm start  # Puerto 3001

# Terminal 2: Frontend
npm run dev  # Puerto 3000
```

### Verificar que funciona:
```bash
# Verificar backend
curl http://localhost:3001/api/health

# Crear curso de prueba
curl -X POST http://localhost:3001/api/cursos \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","titulo":"Curso de Prueba"}'

# Listar cursos
curl http://localhost:3001/api/cursos
```

---

## 🎯 Resumen Final

**Sistema Híbrido Perfecto**:
- **Backend Express** → Cursos compartidos (archivos JSON)
- **localStorage** → Inscripciones privadas por usuario
- **Email** → Reportes y notificaciones
- **Sin base de datos** → Solo sistema de archivos
- **Fácil de hostear** → Railway, Render, Netlify

**Todo funciona como querías** 🚀
