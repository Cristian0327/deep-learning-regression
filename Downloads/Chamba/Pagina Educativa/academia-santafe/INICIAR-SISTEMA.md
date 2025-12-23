# 🚀 Cómo Iniciar el Sistema Completo

## ✅ Sistema Migrado a Arquitectura Portable

El sistema ha sido completamente migrado de **Supabase (base de datos)** a una **arquitectura portable basada en archivos JSON**.

### 🎯 Ventajas del Nuevo Sistema

- ✅ **Sin base de datos**: No necesitas configurar PostgreSQL ni Supabase
- ✅ **100% portable**: Funciona en cualquier hosting con Node.js
- ✅ **Fácil backup**: Los cursos son archivos JSON simples
- ✅ **Bajo riesgo**: Ideal para pasantes sin acceso a infraestructura crítica
- ✅ **Migración simple**: Netlify → Hostinger Business en minutos

---

## 📦 Componentes del Sistema

### 1. API Backend (Express.js)
- **Puerto**: 3001
- **Ubicación**: `academia-santafe/api/`
- **Base de datos**: Archivos JSON en `api/data/cursos/`
- **Endpoints**:
  - `GET /api/cursos` - Listar todos los cursos
  - `GET /api/cursos/:id` - Obtener un curso específico
  - `POST /api/cursos` - Crear/actualizar curso
  - `DELETE /api/cursos/:id` - Eliminar curso
  - `GET /api/health` - Estado del servidor

### 2. Frontend (Next.js)
- **Puerto**: 3000
- **Ubicación**: `academia-santafe/`
- **Páginas adaptadas**:
  - `/AdminCursos` - Gestión de cursos (CRUD completo)
  - `/cursos` - Catálogo de cursos
  - `/curso/[id]` - Vista de curso individual

### 3. Almacenamiento de Datos
- **Cursos**: `api/data/cursos/*.json` (un archivo por curso)
- **Progreso de usuario**: LocalStorage del navegador
- **Inscripciones**: LocalStorage del navegador
- **Evaluaciones**: LocalStorage del navegador
- **Calificaciones**: LocalStorage del navegador

---

## 🔧 Iniciar el Sistema (Desarrollo Local)

### Paso 1: Iniciar el API Backend

Abrir una terminal y ejecutar:

```powershell
cd "C:\Users\CRISTIAN\Downloads\Chamba\Pagina Educativa\academia-santafe\api"
npm start
```

Deberías ver:
```
╔════════════════════════════════════════╗ 
║   API Academia Santafé                  ║
║   Servidor corriendo en puerto 3001   ║  
╚════════════════════════════════════════╝
```

### Paso 2: Iniciar el Frontend Next.js

Abrir OTRA terminal y ejecutar:

```powershell
cd "C:\Users\CRISTIAN\Downloads\Chamba\Pagina Educativa\academia-santafe"
npm run dev
```

Deberías ver:
```
▲ Next.js 16.0.5 (Turbopack)
- Local:         http://localhost:3000
✓ Ready in 1797ms
```

### Paso 3: Abrir en el Navegador

Visitar: **http://localhost:3000**

#### Páginas de prueba:
- **Admin**: http://localhost:3000/AdminCursos (crear, editar, eliminar cursos)
- **Catálogo**: http://localhost:3000/cursos (ver todos los cursos)
- **Curso individual**: http://localhost:3000/curso/[id] (reemplazar `[id]` con ID real)

---

## 🎓 Flujo de Trabajo del Sistema

### Como Administrador (Crear Cursos)

1. Ir a http://localhost:3000/AdminCursos
2. Clic en "➕ Crear Nuevo Curso"
3. Llenar el formulario:
   - **Título**: Nombre del curso
   - **Descripción**: Resumen del curso
   - **Categoría**: Ej. "Desarrollo Web", "Negocios"
   - **Instructor**: Nombre del profesor
   - **Clave de Inscripción**: Password para acceso (ej. "SANTAFE2025")
   - **Video URL**: Link de YouTube
   - **Bloques de Contenido**: Lecciones, videos, PDFs, evaluaciones
4. Guardar → El curso se guarda en `api/data/cursos/{id}.json`

### Como Estudiante (Tomar Cursos)

1. Ir a http://localhost:3000/cursos
2. Buscar un curso interesante
3. Clic en "Ver Curso"
4. Ingresar la **clave de inscripción** (solicitar al instructor)
5. Estudiar el contenido
6. Completar evaluaciones (75% mínimo para aprobar)
7. Obtener certificado PDF al completar

---

## 📂 Estructura de Archivos JSON

### Ejemplo de curso guardado (`api/data/cursos/abc123.json`):

```json
{
  "id": "abc123",
  "titulo": "Introducción a JavaScript",
  "descripcion": "Aprende programación desde cero",
  "categoria": "Desarrollo Web",
  "instructor": "Juan Pérez",
  "duracion": "10 horas",
  "nivel": "Principiante",
  "imagen": "https://...",
  "videoUrl": "https://youtube.com/watch?v=...",
  "claveInscripcion": "JS2025",
  "bloques": "[{...lecciones...}]",
  "activo": true,
  "createdAt": "2025-01-31T10:00:00.000Z",
  "updatedAt": "2025-01-31T10:00:00.000Z"
}
```

---

## 🔒 Seguridad y Persistencia

### Datos del Backend (Cursos)
- **Almacenamiento**: Archivos JSON en `api/data/cursos/`
- **Backup**: Copiar carpeta `api/data/cursos/` periódicamente
- **Persistencia**: Los cursos sobreviven reinicios del servidor

### Datos del Frontend (Usuarios)
- **Almacenamiento**: LocalStorage del navegador
- **Limitaciones**: 
  - Si el usuario borra cookies/cache, pierde su progreso
  - No compartido entre dispositivos
  - No hay login central (usa NextAuth pero progreso es local)

### Solución Futura (Microsoft Forms)
Para tracking persistente de completados, el sistema puede enviar datos a:
- **Microsoft Forms** (ya configurado en el código)
- **Google Sheets** (alternativa)
- **Email** (notificaciones de completado)

---

## 🌐 Deployment (Producción)

### Opción 1: Netlify (Gratis)

Ver archivo [DEPLOY.md](./DEPLOY.md) sección "Netlify Functions"

### Opción 2: Hostinger Business ($13.900/mes)

1. Subir proyecto completo vía FTP
2. SSH al servidor:
   ```bash
   cd /home/usuario/academia-santafe/api
   npm install
   npm start &
   
   cd /home/usuario/academia-santafe
   npm install
   npm run build
   npm start
   ```
3. Configurar Nginx reverse proxy:
   - Frontend (Next.js) → Puerto 3000
   - API (Express) → Puerto 3001

Ver detalles completos en [DEPLOY.md](./DEPLOY.md)

---

## ⚠️ Troubleshooting

### Error: "Cannot find module 'express'"
```powershell
cd api
npm install
```

### Error: "Port 3001 already in use"
Matar proceso:
```powershell
Get-Process -Name node | Stop-Process -Force
```

### Error: "CORS blocked"
Verificar que `.env.local` tenga:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### No se guardan cursos
1. Verificar que `api/data/cursos/` exista
2. Revisar permisos de escritura
3. Ver logs del API en la terminal

### Progreso del usuario se borra
- LocalStorage se borra al limpiar cookies
- Solución: Implementar Microsoft Forms POST para persistencia

---

## 📋 Checklist Pre-Deployment

Antes de subir a producción:

- [ ] API inicia sin errores (`npm start` en `api/`)
- [ ] Frontend inicia sin errores (`npm run dev`)
- [ ] Crear curso de prueba funciona
- [ ] Editar curso funciona
- [ ] Eliminar curso funciona
- [ ] Listar cursos en `/cursos` funciona
- [ ] Ver curso individual funciona
- [ ] Inscripción con clave funciona
- [ ] Evaluaciones se guardan en LocalStorage
- [ ] Certificado PDF se genera correctamente
- [ ] Backup de `api/data/cursos/` creado
- [ ] Variables de entorno configuradas (`.env.local`)

---

## 🎯 Próximos Pasos (Futuro)

### 1. PDF → Curso Automático
```javascript
// TODO: Integrar OpenAI/Claude API
const curso = await convertirPdfACurso('archivo.pdf');
await apiClient.guardarCurso(curso);
```

### 2. Persistencia con Microsoft Forms
```javascript
// Ya configurado, solo activar
fetch('https://forms.microsoft.com/...', {
  method: 'POST',
  body: JSON.stringify(completado)
});
```

### 3. Migración a Hostinger
1. Copiar proyecto completo
2. `npm install` en ambas carpetas
3. Iniciar ambos servidores
4. Configurar proxy

Ver [DEPLOY.md](./DEPLOY.md) para guía completa.

---

## 📞 Soporte

Si algo no funciona:

1. **Revisar logs**: Terminal donde corre el API y Frontend
2. **Consola del navegador**: F12 → Console (errores JavaScript)
3. **Verificar puertos**: `netstat -ano | findstr :3001` y `:3000`
4. **Reiniciar todo**: Ctrl+C en ambas terminales, luego reiniciar

---

## 🎉 Resumen

**Antes (Supabase)**:
- ❌ Requería cuenta de Supabase
- ❌ Dependencia de PostgreSQL
- ❌ Configuración compleja
- ❌ Riesgo para pasantes
- ❌ Vendor lock-in

**Ahora (File-based)**:
- ✅ Solo archivos JSON
- ✅ Sin base de datos
- ✅ Portable a cualquier hosting
- ✅ Bajo riesgo
- ✅ Fácil backup (copiar carpeta)

**Sistema listo para producción** 🚀
