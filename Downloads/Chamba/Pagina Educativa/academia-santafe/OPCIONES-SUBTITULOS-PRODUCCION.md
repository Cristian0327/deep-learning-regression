# 🚀 Opciones para Subtítulos en Producción

## 📊 Comparativa de Soluciones

| Opción | Requiere Config | Funciona en Producción | Confiabilidad | Costo |
|--------|----------------|------------------------|---------------|-------|
| **YouTube API Oficial** | ✅ API Key | ✅ Solo agregar dominio | ⭐⭐⭐⭐⭐ 100% | 💰 Gratis (10k/día) |
| **youtube-transcript (npm)** | ❌ No | ✅ Funciona directo | ⭐⭐⭐ 70% | 💰 Gratis ilimitado |
| **Subir Archivos Manuales** | ❌ No | ✅ Funciona directo | ⭐⭐⭐⭐⭐ 100% | 💰 Gratis |

---

## ✅ **OPCIÓN 1: YouTube API Oficial (RECOMENDADA)**

### ¿Por qué es la mejor?

- ✅ **Más confiable**: API oficial de Google
- ✅ **No se rompe**: Estable a largo plazo
- ✅ **Fácil en producción**: Solo agregar dominio
- ✅ **Sin límites prácticos**: 10,000 unidades/día = ~200 videos

### Para Producción (Cuando suban el sitio)

#### Paso 1: Obtener el Dominio de Producción

Cuando suban a **Vercel**, **Netlify** o cualquier host, obtendrán un dominio como:
```
https://academia-santafe.vercel.app
```

#### Paso 2: Agregar Dominio a la API Key

1. Ve a: https://console.cloud.google.com/apis/credentials

2. Click en tu **API key de YouTube**

3. En "Restricciones de aplicación" → "Sitios web HTTP", agrega:
   ```
   https://academia-santafe.vercel.app/*
   ```

4. **Guarda**

5. Espera 2-3 minutos

#### Paso 3: Configurar Variables de Entorno en Vercel

En tu panel de Vercel:

1. Ve a: **Settings** → **Environment Variables**

2. Agrega:
   ```
   YOUTUBE_API_KEY = AIzaSyC_tu_api_key_aqui
   ```

3. **Save**

4. **Redeploy** tu aplicación

**¡Y listo!** Los subtítulos funcionarán en producción.

### ⚠️ Importante

- La API key **NO** requiere OAuth
- **NO** afecta el login de usuarios
- **NO** necesita configurar redirect URIs
- Solo agregas el dominio y funciona

---

## 🔧 **OPCIÓN 2: youtube-transcript (Sin API Key)**

### Ventajas

- ✅ No requiere API key
- ✅ No requiere configuración en Google Cloud
- ✅ Funciona inmediatamente
- ✅ Gratis ilimitado

### Desventajas

- ⚠️ Usa scraping (no oficial)
- ⚠️ Puede fallar si YouTube cambia su HTML
- ⚠️ Menos confiable a largo plazo
- ⚠️ Puede ser más lento

### Implementación

Ya instalamos el paquete. Ahora solo cambia la ruta de la API:

**Archivo:** `components/TranscripcionVideo.tsx`

Cambia esta línea:
```typescript
const response = await fetch(`/api/youtube/transcripcion?videoId=${videoId}`);
```

Por:
```typescript
const response = await fetch(`/api/youtube/transcripcion-sin-api?videoId=${videoId}`);
```

**¡Y ya funciona sin API key!**

### Para Producción

- ✅ **No requiere ninguna configuración adicional**
- ✅ Funciona exactamente igual en producción
- ✅ No hay que tocar Google Cloud Console

---

## 📁 **OPCIÓN 3: Subir Transcripciones Manualmente**

### Cómo Funciona

1. El instructor genera la transcripción (IA, manual, etc.)
2. Sube el archivo `.txt` o `.srt` junto con el curso
3. Se muestra automáticamente

### Ventajas

- ✅ 100% confiable
- ✅ Control total del contenido
- ✅ Mejor calidad (revisada por humano)
- ✅ No depende de YouTube

### Desventajas

- ⚠️ Trabajo manual
- ⚠️ No es automático

### Implementación

Necesitarías agregar un campo en el formulario de crear curso:

```typescript
// Campo nuevo en el formulario
<input 
  type="file" 
  accept=".txt,.srt"
  onChange={handleTranscripcionUpload}
/>
```

Y guardarlo en Supabase junto con el curso.

---

## 💡 **MI RECOMENDACIÓN**

### Para Desarrollo (Ahora)

Usa **youtube-transcript** (Opción 2) porque:
- No requiere configurar API key
- Funciona inmediatamente
- Puedes probarlo ya

### Para Producción (Cuando suban el sitio)

Cambia a **YouTube API Oficial** (Opción 1) porque:
- Más estable
- Más confiable
- Solo toma 5 minutos configurar
- No se va a romper

---

## 🔄 **Cómo Cambiar Entre Opciones**

### Usar youtube-transcript (Sin API Key)

En `components/TranscripcionVideo.tsx` línea ~33:

```typescript
const response = await fetch(`/api/youtube/transcripcion-sin-api?videoId=${videoId}`);
```

### Usar YouTube API Oficial

En `components/TranscripcionVideo.tsx` línea ~33:

```typescript
const response = await fetch(`/api/youtube/transcripcion?videoId=${videoId}`);
```

**Es solo cambiar la URL del endpoint** 🎯

---

## 🚀 **Plan Recomendado**

### Fase 1: Desarrollo Local (Ahora)

```bash
# Ya instalamos youtube-transcript
# Solo usa el endpoint sin API:
/api/youtube/transcripcion-sin-api
```

✅ **Ventaja**: Puedes probar todo YA sin configurar nada

### Fase 2: Pre-Producción

1. Crea la API key de YouTube (5 minutos)
2. Agrégala a `.env.local`
3. Cambia a usar `/api/youtube/transcripcion`
4. Prueba que funciona

### Fase 3: Producción (Cuando suban)

1. Agrega tu dominio de Vercel a la API key (2 minutos)
2. Agrega `YOUTUBE_API_KEY` a las variables de entorno de Vercel
3. Deploy

---

## 🎯 **¿Cuál Usar?**

### Si quieres probarlo AHORA sin configurar nada:
```
→ Usa youtube-transcript (Opción 2)
```

### Si quieres la solución más robusta a largo plazo:
```
→ Usa YouTube API Oficial (Opción 1)
```

### Si tus instructores quieren control total:
```
→ Subir archivos manuales (Opción 3)
```

---

## 📝 **Próximos Pasos Sugeridos**

1. **AHORA**: Usa `youtube-transcript` para probar
2. **ANTES DE PRODUCCIÓN**: Migra a YouTube API oficial
3. **PRODUCCIÓN**: Solo agrega el dominio a la API key

**Ventaja**: Puedes probar TODO ahora y solo toma 5 minutos cambiar después.

---

¿Quieres que configure ahora mismo la opción sin API key para que puedas probarlo inmediatamente?
