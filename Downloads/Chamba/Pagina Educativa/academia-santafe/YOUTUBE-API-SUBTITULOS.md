# 📺 API de YouTube para Subtítulos - Guía Completa

## 🔑 Cómo Obtener la API Key de YouTube

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a https://console.cloud.google.com
2. Click en "Seleccionar proyecto" → "Nuevo proyecto"
3. Nombre: `Academia Santa Fe` (o el que prefieras)
4. Click "Crear"

### Paso 2: Habilitar YouTube Data API v3

1. En el menú lateral → "APIs y servicios" → "Biblioteca"
2. Busca: **"YouTube Data API v3"**
3. Click en el resultado
4. Click "HABILITAR"

### Paso 3: Crear Credenciales (API Key)

1. En el menú lateral → "APIs y servicios" → "Credenciales"
2. Click "CREAR CREDENCIALES"
3. Selecciona "Clave de API"
4. Se generará automáticamente tu API key
5. **COPIA LA KEY** (algo como: `AIzaSyC_XxXxXxXxXxXxXxXxXxXxXxXxXxX`)

### Paso 4: Restringir la API Key (Importante para Seguridad)

1. Click en "Editar clave de API"
2. En "Restricciones de aplicación":
   - Selecciona "Sitios web HTTP (referentes)"
   - Agrega: `http://localhost:3000/*`
   - Agrega: `https://tu-dominio.com/*` (cuando estés en producción)
3. En "Restricciones de API":
   - Selecciona "Restringir clave"
   - Marca solo: ✅ **YouTube Data API v3**
4. Click "GUARDAR"

### Paso 5: Configurar en tu Aplicación

Edita `.env.local`:

```env
# YouTube Data API v3
YOUTUBE_API_KEY=AIzaSyC_XxXxXxXxXxXxXxXxXxXxXxXxXxX
```

Reinicia el servidor:
```bash
npm run dev
```

---

## 🎬 Cómo Funciona el Sistema de Subtítulos

### 1. **Requisitos Previos**

Para que los subtítulos funcionen, el video de YouTube DEBE tener:
- ✅ Subtítulos habilitados (automáticos o manuales)
- ✅ Ser público o no listado (no privado)

### 2. **Proceso del Sistema**

```
Usuario visita curso con video
       ↓
Componente TranscripcionVideo extrae videoId
       ↓
Hace petición a /api/youtube/transcripcion?videoId=ABC123
       ↓
La API busca subtítulos disponibles (español preferido)
       ↓
Descarga el archivo de captions en formato SRT
       ↓
Parsea el SRT a JSON con timestamps
       ↓
Retorna array de segmentos:
  [
    { time: 0, duration: 3.5, text: "Bienvenidos..." },
    { time: 3.5, duration: 4.2, text: "En este video..." },
    ...
  ]
       ↓
Componente muestra transcripción interactiva
```

### 3. **Funcionalidades del Sistema**

#### A) Transcripción Interactiva
- **Búsqueda**: Filtra segmentos por palabra clave
- **Resaltado**: Marca en amarillo los términos buscados
- **Timestamps**: Muestra hora:minuto:segundo de cada segmento
- **Click-to-seek**: (Requiere API key) Click en un segmento para saltar a ese momento

#### B) Formato de Respuesta
```typescript
{
  segments: [
    {
      time: 12.5,        // Segundos desde el inicio
      duration: 3.2,     // Duración del segmento
      text: "Texto del subtítulo"
    }
  ]
}
```

---

## 🛠️ Habilitar Subtítulos en Videos de YouTube

### Opción 1: Subtítulos Automáticos (Más Fácil)

1. Sube el video a YouTube
2. YouTube Studio → Videos → Selecciona el video
3. Menú lateral → "Subtítulos"
4. Espera unos minutos (YouTube genera automáticamente)
5. ✅ Subtítulos disponibles

**Idiomas soportados automáticamente**:
- Español, Inglés, Francés, Alemán, Portugués, y más

### Opción 2: Subtítulos Manuales (Más Preciso)

1. YouTube Studio → Videos → Tu video
2. "Subtítulos" → "AGREGAR"
3. Selecciona idioma: Español
4. Opciones:
   - **Subir archivo**: Sube archivo `.srt` o `.vtt`
   - **Escribir manualmente**: Escribe mientras ves el video
   - **Autosincronizar**: Escribe el texto completo, YouTube lo sincroniza

### Opción 3: Generar con IA Externa (Mejor Calidad)

Herramientas recomendadas:
- **Whisper de OpenAI**: https://github.com/openai/whisper
- **Happy Scribe**: https://www.happyscribe.com
- **Rev.com**: https://www.rev.com

Pasos:
1. Genera subtítulos con IA
2. Descarga archivo `.srt`
3. Sube a YouTube Studio

---

## 📊 Límites y Cuotas de la API

### Cuota Diaria Gratuita
- **10,000 unidades/día** (gratis)
- Cada petición de captions: **~50 unidades**
- = **~200 solicitudes de subtítulos al día** (más que suficiente)

### Monitoreo de Uso
1. Google Cloud Console
2. "APIs y servicios" → "Panel"
3. Ve el gráfico de uso en tiempo real

### Si Necesitas Más Cuota
- Plan de pago de Google Cloud
- O crea múltiples proyectos (no recomendado)

---

## 🐛 Solución de Problemas

### Error: "No hay subtítulos disponibles"
**Causa**: El video no tiene subtítulos
**Solución**:
1. Verifica en YouTube que el video tenga el ícono [CC]
2. Habilita subtítulos automáticos en YouTube Studio
3. Espera 5-10 minutos y recarga la página

### Error: "YouTube API key no configurada"
**Causa**: No está el `.env.local` configurado
**Solución**:
1. Crea/obtén la API key (pasos arriba)
2. Agrega a `.env.local`: `YOUTUBE_API_KEY=tu-key`
3. Reinicia el servidor: `npm run dev`

### Error: "403 Forbidden"
**Causa**: API key restringida incorrectamente
**Solución**:
1. Google Cloud Console → Credenciales
2. Edita tu API key
3. En "Restricciones de aplicación" agrega: `http://localhost:3000/*`
4. Guarda y espera 1-2 minutos

### Error: "Quota exceeded"
**Causa**: Superaste las 10,000 unidades diarias
**Solución**:
1. Espera hasta el próximo día (se resetea a medianoche PST)
2. O implementa caché en el servidor para reutilizar transcripciones

---

## 🚀 Sin API Key - Alternativa

Si **NO** quieres configurar la API key, aún puedes:

1. **Mostrar mensaje informativo**:
   ```
   "Transcripción no disponible. El instructor debe configurar YouTube API."
   ```

2. **Usar librería externa** (sin API oficial):
   - `youtube-transcript` (npm package)
   - No requiere API key
   - Menos confiable, puede fallar

3. **Subir transcripciones manualmente**:
   - Sube archivos `.txt` o `.srt` directamente a Supabase
   - Los estudiantes los descargan

---

## ✅ Checklist para Producción

- [ ] API key creada en Google Cloud
- [ ] YouTube Data API v3 habilitada
- [ ] API key restringida a tu dominio
- [ ] Variable `YOUTUBE_API_KEY` en `.env.local` (desarrollo)
- [ ] Variable `YOUTUBE_API_KEY` en variables de entorno de producción (Vercel/Netlify)
- [ ] Todos los videos tienen subtítulos habilitados
- [ ] Probado con al menos 3 videos diferentes
- [ ] Monitoreo de cuota configurado

---

## 🎓 Ejemplo de Video con Subtítulos

Para pruebas, usa este video que tiene subtítulos automáticos:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

Video ID: `dQw4w9WgXcQ`

---

## 📞 Recursos Útiles

- **Google Cloud Console**: https://console.cloud.google.com
- **YouTube Data API Docs**: https://developers.google.com/youtube/v3
- **Crear Subtítulos**: https://support.google.com/youtube/answer/2734796
- **Cuotas de la API**: https://developers.google.com/youtube/v3/getting-started#quota
