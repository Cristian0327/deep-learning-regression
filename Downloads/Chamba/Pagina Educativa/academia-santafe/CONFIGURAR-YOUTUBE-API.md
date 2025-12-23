# 🎬 Configuración Rápida - API de YouTube para Subtítulos

## 📋 Paso a Paso (5 minutos)

### 1️⃣ Ir a Google Cloud Console
Abre en tu navegador:
```
https://console.cloud.google.com
```

### 2️⃣ Crear o Seleccionar Proyecto

**Opción A: Si ya tienes un proyecto (el de OAuth)**
- Click en el selector de proyecto (arriba a la izquierda)
- Selecciona tu proyecto existente (ej: "Academia Santa Fe")

**Opción B: Crear nuevo proyecto**
- Click en "Seleccionar proyecto" → "Nuevo proyecto"
- Nombre: `Academia Santa Fe API`
- Click "Crear"
- Espera 10-15 segundos

### 3️⃣ Habilitar YouTube Data API v3

1. En el menú lateral (☰), ve a: **APIs y servicios** → **Biblioteca**

2. En el buscador escribe:
   ```
   YouTube Data API v3
   ```

3. Click en el resultado **"YouTube Data API v3"**

4. Click en el botón azul **"HABILITAR"**

5. Espera 5-10 segundos (se habilitará automáticamente)

### 4️⃣ Crear Credenciales (API Key)

1. En el menú lateral: **APIs y servicios** → **Credenciales**

2. Click en **"CREAR CREDENCIALES"** (botón azul arriba)

3. Selecciona: **"Clave de API"**

4. Se generará automáticamente tu API key. Ejemplo:
   ```
   AIzaSyC_1234567890abcdefghijklmnopqrstuvwxyz
   ```

5. **COPIA LA KEY** (click en el ícono de copiar 📋)

### 5️⃣ Restringir la API Key (Seguridad)

1. Click en **"Editar clave de API"** (o el ícono de lápiz ✏️)

2. **Restricciones de aplicación:**
   - Selecciona: ☑️ **"Sitios web HTTP (referentes)"**
   - Click "AGREGAR UN ELEMENTO"
   - Agrega:
     ```
     http://localhost:3000/*
     ```
   - Click "AGREGAR UN ELEMENTO" otra vez
   - Agrega (para producción):
     ```
     https://*.vercel.app/*
     ```
     O tu dominio:
     ```
     https://tudominio.com/*
     ```

3. **Restricciones de API:**
   - Selecciona: ☑️ **"Restringir clave"**
   - En la lista, busca y marca:
     - ✅ **YouTube Data API v3**
   - Desmarca todas las demás

4. Click **"GUARDAR"** (botón azul abajo)

5. Espera 1-2 minutos para que se apliquen los cambios

### 6️⃣ Configurar en tu Aplicación

1. Abre el archivo `.env.local` en VS Code

2. Busca la línea:
   ```env
   # YOUTUBE_API_KEY=tu_api_key_aqui
   ```

3. Descomenta y pega tu API key:
   ```env
   YOUTUBE_API_KEY=AIzaSyC_1234567890abcdefghijklmnopqrstuvwxyz
   ```

4. **GUARDA EL ARCHIVO** (Ctrl + S)

### 7️⃣ Reiniciar el Servidor

En la terminal, presiona **Ctrl + C** para detener el servidor, luego:

```bash
npm run dev
```

---

## ✅ Verificar que Funciona

### Prueba 1: Video con Subtítulos
1. Ve a YouTube y encuentra un video con subtítulos (ícono [CC])
2. Copia el ID del video (ej: de `https://youtube.com/watch?v=dQw4w9WgXcQ` → `dQw4w9WgXcQ`)
3. Crea un curso con ese videoUrl
4. Abre el curso
5. **Debería aparecer la transcripción interactiva abajo del video** ✨

### Prueba 2: Buscar en la Transcripción
1. En la caja de búsqueda de la transcripción
2. Escribe una palabra que aparezca en el video
3. **Debería resaltar en amarillo** 🟡
4. Click en un segmento
5. **El video debería saltar a ese momento** ⏩

---

## 🔧 Solución de Problemas

### Error: "YouTube API key no configurada"
**Causa:** La variable no está en `.env.local` o el servidor no se reinició

**Solución:**
```bash
# 1. Verifica que .env.local tenga:
YOUTUBE_API_KEY=AIzaSyC...

# 2. Reinicia el servidor:
# Ctrl + C (detener)
npm run dev
```

### Error: "No hay subtítulos disponibles"
**Causa:** El video no tiene subtítulos habilitados

**Solución:**
1. Verifica que el video tenga subtítulos:
   - Abre el video en YouTube
   - Click en configuración (⚙️)
   - Click en "Subtítulos"
   - Debería mostrar idiomas disponibles

2. Habilitar subtítulos automáticos:
   - YouTube Studio → Videos → Tu video
   - Menú lateral: "Subtítulos"
   - YouTube genera subtítulos automáticos en ~5 minutos

### Error: "403 Forbidden" o "API key not valid"
**Causa:** La API key está mal restringida o no se aplicaron los cambios

**Solución:**
1. Ve a Google Cloud Console → Credenciales
2. Edita tu API key
3. Verifica:
   - ✅ YouTube Data API v3 está en la lista de APIs permitidas
   - ✅ `http://localhost:3000/*` está en referentes HTTP
4. Guarda y espera 2-3 minutos
5. Recarga tu aplicación

### Error: "Quota exceeded"
**Causa:** Superaste las 10,000 unidades diarias (muy raro)

**Solución:**
- Espera hasta mañana (se resetea a medianoche PST)
- O implementa caché para no re-descargar transcripciones

---

## 📊 Cuotas y Límites

### Cuota Gratuita Diaria
- **10,000 unidades/día** (gratis para siempre)
- Obtener captions: **~50 unidades** por video
- = **~200 videos diferentes por día**

### Monitorear Uso
1. Google Cloud Console
2. "APIs y servicios" → "Panel de control"
3. Click en "YouTube Data API v3"
4. Ve el gráfico de uso

---

## 🎥 Videos Recomendados para Pruebas

Estos videos tienen subtítulos en español:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://www.youtube.com/watch?v=9bZkp7q19f0
https://www.youtube.com/watch?v=kJQP7kiw5Fk
```

---

## 🚀 Alternativa: Sin API Key

Si **NO** quieres configurar la API key, tienes opciones:

### Opción 1: Librería npm (sin API oficial)
```bash
npm install youtube-transcript
```

**Ventajas:**
- No requiere API key
- Gratis ilimitado

**Desventajas:**
- Puede fallar en cualquier momento (no oficial)
- YouTube puede bloquearlo
- Menos confiable

### Opción 2: Subir Transcripciones Manualmente
1. Genera transcripción con IA (Whisper, Rev.com)
2. Guárdala en Supabase como texto
3. Muéstrala en el componente

---

## ✨ Funcionalidades Disponibles

Una vez configurada la API key:

✅ **Transcripción automática** de cualquier video con subtítulos
✅ **Búsqueda en tiempo real** dentro de la transcripción
✅ **Click-to-seek**: Click en un segmento para saltar al momento
✅ **Resaltado de palabras** buscadas (fondo amarillo)
✅ **Timestamps** formateados (min:seg)
✅ **Detección automática de idioma** (prioriza español)
✅ **Scroll automático** al segmento activo
✅ **Diseño responsive** con Tailwind CSS

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa la consola del navegador** (F12 → Console)
2. **Revisa la consola del servidor** (terminal donde corre `npm run dev`)
3. **Verifica el archivo `.env.local`** está guardado
4. **Espera 2-3 minutos** después de cambiar restricciones de API key

---

¡Listo! Con esto tendrás transcripciones interactivas como Coursera 🎓✨
