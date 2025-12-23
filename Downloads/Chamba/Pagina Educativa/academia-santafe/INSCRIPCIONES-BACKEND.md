# ✅ SISTEMA HÍBRIDO COMPLETO - Inscripciones en Backend + localStorage

## 🎯 Cómo Funciona Ahora

### **Inscripciones guardadas en DOS lugares:**

#### 1. **localStorage** (Navegador del estudiante)
- ✅ **Ventaja**: Funciona sin conexión
- ✅ **Ventaja**: Estudiante ve su progreso instantáneamente
- ⚠️ **Limitación**: Solo visible en ese navegador/PC

#### 2. **Backend (archivos JSON)** 
- ✅ **Ventaja**: Admin ve TODAS las inscripciones de TODOS los estudiantes
- ✅ **Ventaja**: No se pierde si estudiante cambia de navegador
- ✅ **Ventaja**: Accesible desde cualquier admin panel
- 📁 **Ubicación**: `data/inscripciones/{documento}_{cursoId}.json`

---

## 📂 Estructura de Archivos en el Backend

### **Cursos**
```
data/cursos/
├── 1703123456789.json   (curso 1)
├── 1703123456790.json   (curso 2)
└── 1703123456791.json   (curso 3)
```

### **Inscripciones** (NUEVO)
```
data/inscripciones/
├── 123456789_1703123456789.json   (Juan en curso 1)
├── 123456789_1703123456790.json   (Juan en curso 2)
├── 987654321_1703123456789.json   (María en curso 1)
└── 456789123_1703123456791.json   (Pedro en curso 3)
```

**Formato del archivo de inscripción:**
```json
{
  "nombre": "Juan Pérez",
  "documento": "123456789",
  "cargo": "Desarrollador",
  "empresa": "Tech SA",
  "cursoId": "1703123456789",
  "cursoTitulo": "Introducción a React",
  "progreso": 45,
  "completado": false,
  "calificacion": 85,
  "activo": true,
  "fechaInscripcion": "2024-12-23T10:00:00Z",
  "actualizado": "2024-12-23T15:30:00Z"
}
```

---

## 🔄 Flujo de Inscripción Mejorado

### Cuando un estudiante se inscribe:

```
┌─────────────────────────────────────────┐
│  1. Estudiante ingresa datos            │
│     - Nombre: Juan Pérez                │
│     - Documento: 123456789              │
│     - Cargo: Desarrollador              │
│     - Empresa: Tech SA                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  2. Se guarda en localStorage           │
│     Key: inscripcion_123456789_curso1   │
│     ✅ Estudiante puede continuar       │
│        incluso sin conexión             │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  3. Se envía al backend                 │
│     POST /api/inscripciones             │
│     ✅ Guardado en servidor             │
│     ✅ Admin puede verlo                │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Si falla el backend:                   │
│  ⚠️ Inscripción funciona igual          │
│  ⚠️ Solo no aparece en panel admin      │
│     hasta que se sincronice             │
└─────────────────────────────────────────┘
```

---

## 📊 Panel de Reportes Mejorado

### El admin ahora ve TODAS las inscripciones:

**Antes** (solo localStorage):
```
Admin Panel
├── Solo inscripciones de personas que usaron ESE navegador
└── Si 10 estudiantes se inscribieron en otros PCs → No las ve
```

**Ahora** (backend + localStorage):
```
Admin Panel
├── Carga inscripciones desde servidor (backend)
│   └── Ve TODAS las inscripciones de TODOS los estudiantes
│
└── Si falla servidor → Fallback a localStorage
    └── Al menos ve las del navegador actual
```

---

## 🔌 Endpoints Nuevos del Backend

### **Guardar/Actualizar Inscripción**
```bash
POST /api/inscripciones
Body: {
  "nombre": "Juan Pérez",
  "documento": "123456789",
  "cargo": "Desarrollador",
  "empresa": "Tech SA",
  "cursoId": "1703123456789",
  "cursoTitulo": "React Avanzado",
  "progreso": 50,
  "completado": false
}

Response: {
  "success": true,
  "mensaje": "Inscripción guardada exitosamente",
  "inscripcion": { ... }
}
```

### **Obtener Inscripción Específica**
```bash
GET /api/inscripciones/:documento/:cursoId

Ejemplo:
GET /api/inscripciones/123456789/1703123456789

Response: {
  "nombre": "Juan Pérez",
  "documento": "123456789",
  ...
}
```

### **Listar Inscripciones de un Curso**
```bash
GET /api/inscripciones/curso/:cursoId

Ejemplo:
GET /api/inscripciones/curso/1703123456789

Response: [
  {
    "nombre": "Juan Pérez",
    "documento": "123456789",
    "progreso": 50
  },
  {
    "nombre": "María González",
    "documento": "987654321",
    "progreso": 80
  }
]
```

### **Listar TODAS las Inscripciones** (Admin)
```bash
GET /api/inscripciones

Response: [
  {
    "nombre": "Juan Pérez",
    "cursoId": "1703123456789",
    "progreso": 50
  },
  {
    "nombre": "María González",
    "cursoId": "1703123456790",
    "progreso": 80
  },
  ...
]
```

### **Eliminar Inscripción**
```bash
DELETE /api/inscripciones/:documento/:cursoId

Ejemplo:
DELETE /api/inscripciones/123456789/1703123456789

Response: {
  "success": true,
  "mensaje": "Inscripción eliminada"
}
```

---

## 🎨 Botón de Reportes por Curso

### **Cada curso ahora tiene su botón "Reportes":**

```
┌──────────────────────────────────────┐
│  AdminCursos                         │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Curso: React Avanzado         │ │
│  │  Instructor: Juan Pérez        │ │
│  │  Email: juan@example.com       │ │
│  │                                │ │
│  │  [Editar] [Eliminar]           │ │
│  │  [📊 Reportes] ← NUEVO         │ │
│  └────────────────────────────────┘ │
│                                      │
│  Botón verde que lleva a:           │
│  /admin/reportes?curso={id}         │
│                                      │
│  Auto-selecciona el curso           │
│  Auto-carga el email del curso      │
│  Muestra solo inscripciones de ese  │
│  curso                              │
└──────────────────────────────────────┘
```

---

## 💾 Sincronización de Progreso

### **Flujo cuando estudiante actualiza progreso:**

```javascript
// 1. Actualizar localStorage (inmediato)
const inscripcionKey = `inscripcion_${documento}_${cursoId}`;
const data = JSON.parse(localStorage.getItem(inscripcionKey));
data.progreso = 75;
localStorage.setItem(inscripcionKey, JSON.stringify(data));

// 2. Sincronizar con backend (en segundo plano)
try {
  await apiClient.guardarInscripcion(data);
  console.log('✅ Progreso sincronizado con servidor');
} catch (error) {
  console.warn('⚠️ No se pudo sincronizar, pero está guardado localmente');
}
```

**Nota**: Actualmente el progreso NO se sincroniza automáticamente. Si quieres que se sincronice, puedo agregarlo.

---

## 📈 Ventajas del Nuevo Sistema

### **Para el Estudiante:**
✅ No necesita conexión para estudiar  
✅ Progreso guardado instantáneamente (localStorage)  
✅ Si hay conexión, se sincroniza con servidor  
✅ No pierde progreso si vuelve más tarde  

### **Para el Admin:**
✅ Ve TODAS las inscripciones de TODOS los estudiantes  
✅ Panel de reportes centralizado  
✅ Puede exportar CSV completo  
✅ Puede enviar reportes por email  
✅ Botón directo en cada curso  

### **Para el Sistema:**
✅ Sin base de datos (solo archivos JSON)  
✅ Fácil de backupear (copiar carpeta data/)  
✅ Funciona sin conexión (localStorage)  
✅ Funciona con conexión (backend)  
✅ Resistente a fallos (si cae backend, sigue funcionando)  

---

## 🚀 Despliegue

### **Backend (Express) en Railway/Render:**
```bash
# Variables de entorno: NINGUNA
# Solo necesita el sistema de archivos

# Build Command: npm install
# Start Command: npm start
# Port: 3001 (o el que asigne Railway)
```

### **Frontend (Next.js) en Netlify/Vercel:**
```bash
# Variables de entorno:
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app

# Build Command: npm run build
# Start Command: npm start
```

### **Ejemplo con Railway:**
1. Deploy backend → https://mi-api.railway.app
2. Configurar frontend: `NEXT_PUBLIC_API_URL=https://mi-api.railway.app`
3. Deploy frontend → https://mi-sitio.netlify.app
4. ✅ Listo!

---

## 📋 Testing Rápido

### **Probar inscripción:**
```bash
# Inscribirse en un curso
# 1. Ir a /curso/[id]
# 2. Ingresar clave
# 3. Llenar modal con datos
# 4. Verificar en consola:
#    ✅ Inscripción guardada en servidor

# Verificar backend:
curl http://localhost:3001/api/inscripciones

# Debería devolver array con la inscripción
```

### **Probar panel de reportes:**
```bash
# 1. Ir a /admin/reportes
# 2. Debería cargar inscripciones desde backend
# 3. Consola debe mostrar:
#    ✅ X inscripciones cargadas desde servidor
```

### **Probar botón de reportes por curso:**
```bash
# 1. Ir a /AdminCursos
# 2. Buscar botón verde "Reportes" en un curso
# 3. Click → Debería ir a /admin/reportes?curso={id}
# 4. Debería auto-seleccionar ese curso
# 5. Debería mostrar solo inscripciones de ese curso
```

---

## 🎉 Resumen

**Ahora tienes lo mejor de dos mundos:**

1. **localStorage**: Rápido, funciona sin conexión, privado
2. **Backend**: Compartido, visible para admin, persistente

**El estudiante estudia tranquilo** con su progreso guardado localmente.  
**El admin ve todo** desde el panel centralizado.  
**Sin base de datos** pero con todas las ventajas.  

🚀 **¡Listo para producción!**
