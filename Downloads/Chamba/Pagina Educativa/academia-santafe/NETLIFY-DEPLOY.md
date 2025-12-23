# 🚀 Deploy en Netlify - Guía Completa

## ✨ Características del Sistema

### ✅ Netlify Functions (Serverless API)
- ✅ `/netlify/functions/cursos.js` - CRUD de cursos
- ✅ `/netlify/functions/generar-preguntas.js` - IA generación automática
- ✅ Almacenamiento en `/tmp` (producción) o local (desarrollo)
- ✅ Sin base de datos - 100% portable

### ✅ Sistema de IA
- ✅ Genera preguntas automáticamente desde contenido del curso
- ✅ Retroalimentación educativa incluida
- ✅ Configurable (número de preguntas + dificultad)

### ✅ Evaluaciones Aleatorias
- ✅ Orden de preguntas random cada intento
- ✅ Orden de respuestas (A, B, C, D) aleatorio
- ✅ Retroalimentación inmediata y final

---

## 📦 Prerequisitos

1. **Cuenta Netlify** (gratis): https://netlify.com
2. **OpenAI API Key**: https://platform.openai.com/api-keys
3. **Código del proyecto** (esta carpeta)

---

## 🎯 Opción 1: Deploy Manual (SIN GIT)

**Perfecto para pasantes sin acceso a GitHub**

### Paso 1: Instalar Netlify CLI

```powershell
npm install -g netlify-cli
```

### Paso 2: Login

```powershell
netlify login
```

Se abrirá el navegador, autoriza la aplicación.

### Paso 3: Build Local

```powershell
# En la carpeta del proyecto
cd academia-santafe

# Instalar dependencias
npm install

# Build de producción
npm run build
```

### Paso 4: Deploy

```powershell
# Primera vez (crea nuevo sitio)
netlify deploy

# Te preguntará:
# - Create & configure a new site? → Yes
# - Team: → Selecciona tu team
# - Site name: → academia-santafe (o el que quieras)
# - Publish directory: → .next

# Cuando esté listo, deploy a producción:
netlify deploy --prod
```

### Paso 5: Configurar Variables de Entorno

```powershell
# Agregar API Key de OpenAI
netlify env:set OPENAI_API_KEY "sk-tu-api-key-aqui"

# Verificar
netlify env:list
```

### Paso 6: Redeploy

```powershell
netlify deploy --prod
```

---

## 🔄 Opción 2: Deploy Drag & Drop (MÁS FÁCIL)

### Paso 1: Build Local

```powershell
npm install
npm run build
```

### Paso 2: Crear ZIP

1. Selecciona estas carpetas/archivos:
   - `.next`
   - `netlify`
   - `node_modules`
   - `package.json`
   - `next.config.ts`
   - `netlify.toml`

2. Click derecho → Enviar a → Carpeta comprimida (ZIP)

### Paso 3: Subir a Netlify

1. Ve a https://app.netlify.com
2. Click **"Add new site"** → **"Deploy manually"**
3. Arrastra el ZIP
4. Espera a que termine

### Paso 4: Configurar Variables

1. Site Settings → Environment Variables
2. Click **"Add a variable"**:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-...`
3. **Deploys** → **Trigger deploy** → **Deploy site**

---

## ⚙️ Verificación del Deploy

### 1. Verificar el Sitio

URL: `https://tu-sitio.netlify.app`

Deberías ver la página principal del LMS.

### 2. Verificar Functions

Abre en el navegador:
```
https://tu-sitio.netlify.app/.netlify/functions/cursos
```

Debería responder:
```json
[]
```
(o array de cursos si ya hay algunos)

### 3. Verificar IA

1. Ve a: `https://tu-sitio.netlify.app/AdminCursos`
2. Click **"Crear Nuevo Curso"**
3. Llena título, categoría, contenido (IMPORTANTE: agrega texto)
4. Scroll hasta **"🤖 Generador de Preguntas con IA"**
5. Click **"Abrir Panel IA"**
6. Configura:
   - Número: 5
   - Dificultad: Medio
7. Click **"✨ Generar Preguntas con IA"**

Si aparecen preguntas → ✅ **TODO FUNCIONANDO**

Si error → ⚠️ Revisa variables de entorno

---

## 🔧 Configuración Avanzada

### netlify.toml (Ya Incluido)

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  directory = "netlify/functions"
```

Este archivo le dice a Netlify:
- Cómo hacer el build
- Dónde están las Functions
- Cómo redirigir `/api/*` a las Functions

### Variables de Entorno

**Necesarias:**
- `OPENAI_API_KEY` - Para IA (obligatoria)

**Opcionales (ya no se usan):**
- `NEXT_PUBLIC_API_URL` - Auto-detecta Netlify
- `NEXTAUTH_*` - Ya no hay login
- `SUPABASE_*` - Ya no hay DB

---

## 🚨 Solución de Problemas

### Error: "Function not found"

**Causa**: Carpeta `netlify/functions/` no se subió

**Solución**:
```powershell
# Verificar que existe
dir netlify\functions

# Deberías ver:
# - cursos.js
# - generar-preguntas.js

# Redeploy
netlify deploy --prod
```

### Error: "OPENAI_API_KEY is not defined"

**Causa**: Variable de entorno no configurada

**Solución**:
```powershell
netlify env:set OPENAI_API_KEY "sk-..."
netlify deploy --prod
```

### Error: "Build failed"

**Causa**: Errores de TypeScript o dependencias

**Solución**:
```powershell
# Probar build local
npm run build

# Si falla, revisar errores
# Si pasa, hacer deploy de nuevo
```

### Functions Lentas

**Causa**: Netlify Functions tienen cold start

**Solución**: Normal. Primera llamada tarda 1-3 segundos, las siguientes son rápidas.

---

## 📱 Actualizar el Sitio

Cada vez que hagas cambios:

### Usando CLI:

```powershell
# 1. Build
npm run build

# 2. Deploy
netlify deploy --prod
```

### Usando Drag & Drop:

```powershell
# 1. Build
npm run build

# 2. Crear ZIP de nuevo
# 3. Subir a Netlify
```

---

## 🎨 Dominio Personalizado

### Gratis (Netlify Subdomain)

Por defecto: `https://tu-sitio.netlify.app`

Para cambiar:
1. Site Settings → Domain management
2. Click **"Options"** → **"Edit site name"**
3. Nuevo nombre: `academia-santafe`
4. URL: `https://academia-santafe.netlify.app`

### Con Tu Propio Dominio (Opcional)

Si compras `academasantafe.com`:

1. Site Settings → Domain management
2. Click **"Add a domain"**
3. Ingresa: `academasantafe.com`
4. Netlify te da nameservers
5. Ve a tu registrador de dominio (GoDaddy, Hostinger, etc.)
6. Cambia los nameservers
7. Espera 24-48 horas

---

## 💾 Backup de Datos

### Cursos (Archivos JSON)

Los cursos se guardan en `/tmp` en producción (se borran al redeploy).

**IMPORTANTE**: Para backup:

1. Ve a Admin → Cursos
2. Copia cada curso
3. Pégalos en un JSON local

**Mejor solución**: Agrega botón de exportar:

```javascript
// En AdminCursos/page.tsx
const exportarCursos = () => {
  const dataStr = JSON.stringify(cursos, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cursos-backup-${new Date().toISOString()}.json`;
  link.click();
};
```

### Datos de Usuarios (LocalStorage)

Los datos están en el navegador de cada usuario.

**No se pueden hacer backup desde el servidor.**

Cada usuario tiene en su navegador:
- Nombre + Documento
- Inscripciones
- Progreso
- Evaluaciones
- Calificaciones

---

## 📊 Monitoreo

### Netlify Analytics (Pago - $9/mes)

- Visitas
- Bandwidth
- Tiempo de carga

### Gratis:

1. **Netlify Functions Log**:
   - Functions → Función → Logs
   - Ve errores y ejecuciones

2. **Browser DevTools**:
   - F12 → Console
   - Errores de JavaScript

3. **LocalStorage Inspector**:
   ```javascript
   // En consola del navegador
   Object.keys(localStorage)
   ```

---

## 🔐 Seguridad

### API Key de OpenAI

- ✅ Está en variables de entorno (servidor)
- ✅ NO está en el código frontend
- ✅ NO es visible al usuario

### Datos de Usuarios

- ⚠️ Están en LocalStorage (navegador del usuario)
- ⚠️ Si borran cookies/caché, pierden datos
- ⚠️ No hay recuperación de contraseña (no hay login)

**Advertencia para los usuarios**:
> "No borres los datos del navegador o perderás tu progreso"

---

## 💰 Costos

### Netlify Free Tier

- ✅ 300 build minutes/mes
- ✅ 100GB bandwidth/mes
- ✅ 125,000 function invocations/mes
- ✅ SSL gratis
- ✅ CDN global

**Suficiente para:**
- 1,000 estudiantes/mes
- 100 cursos
- 10,000 evaluaciones/mes

### OpenAI API

- **gpt-3.5-turbo**: ~$0.002/1K tokens
- **Estimación**:
  - Generar 10 preguntas: $0.01-$0.05
  - 50 cursos: ~$2-5 total

**Muy económico** 💰

---

## 🎯 Checklist de Deploy

Antes de deploy:

- [ ] `npm install` sin errores
- [ ] `npm run build` exitoso
- [ ] Archivo `netlify.toml` presente
- [ ] Carpeta `netlify/functions/` con 2 archivos
- [ ] API Key de OpenAI lista

Durante deploy:

- [ ] Netlify CLI instalado
- [ ] Login en Netlify
- [ ] Variables de entorno configuradas
- [ ] Deploy a producción

Después de deploy:

- [ ] Sitio principal carga
- [ ] /.netlify/functions/cursos responde
- [ ] Admin → Cursos funciona
- [ ] Crear curso funciona
- [ ] IA genera preguntas
- [ ] Evaluaciones aleatorias funcionan
- [ ] Certificados se descargan

---

## 🚀 Próximos Pasos

Una vez desplegado en Netlify:

1. **Testear Todo**:
   - Crear curso completo
   - Generar preguntas IA
   - Inscribirse como estudiante
   - Completar evaluación
   - Descargar certificado

2. **Configurar Dominio** (opcional)

3. **Capacitar Administradores**:
   - Mostrarles el panel de IA
   - Enseñarles a revisar preguntas generadas
   - Explicar cómo funciona la aleatorización

4. **Migrar a Hostinger** (cuando sea necesario):
   - Cuando superes los límites gratuitos
   - Cuando necesites más control
   - Guía en DEPLOY.md

---

## 📞 Soporte

Si algo falla:

1. **Logs de Netlify**: Functions → Logs
2. **Consola del navegador**: F12 → Console
3. **Verificar variables**: `netlify env:list`

---

**¡Listo! Tu LMS está en la nube 🌐**

URL: `https://tu-sitio.netlify.app`
