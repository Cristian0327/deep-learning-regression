# 🎬 Sistema de Subtítulos de YouTube - Academia Santa Fe

## ✅ Estado Actual

El sistema de subtítulos ya está **completamente implementado** en el código. Solo falta configurar la API key de YouTube.

### 📦 Componentes Instalados

- ✅ `TranscripcionVideo.tsx` - Componente de UI para mostrar transcripciones
- ✅ `app/api/youtube/transcripcion/route.ts` - API route para obtener subtítulos
- ✅ Integración en `app/curso/[id]/page.tsx` - Video + transcripción sincronizados
- ✅ Click-to-seek funcionando (saltar al momento del video)

---

## 🚀 Configuración (3 Pasos Simples)

### Opción A: Verificador Visual (Recomendado)

1. **Abre el archivo HTML incluido:**
   ```
   verificador-youtube-api.html
   ```
   (Doble click en el archivo para abrirlo en tu navegador)

2. **Obtén tu API key:**
   - Ve a https://console.cloud.google.com
   - Habilita "YouTube Data API v3"
   - Crea una API key
   - Copia la key

3. **Verifica que funciona:**
   - Pega tu API key en el verificador
   - Click "Verificar API Key"
   - Si sale ✅ verde, funciona correctamente

4. **Agrégala a tu proyecto:**
   - Abre `.env.local`
   - Agrega la línea:
     ```env
     YOUTUBE_API_KEY=TU_API_KEY_AQUI
     ```
   - Guarda el archivo
   - Reinicia el servidor: `npm run dev`

### Opción B: Manual (Paso a Paso)

📖 Lee la guía completa en: **`CONFIGURAR-YOUTUBE-API.md`**

---

## 🎯 Cómo Funciona

### 1. Usuario ve un curso con video de YouTube
```
┌─────────────────────────────────┐
│   📺 Video de YouTube           │
│   (con enablejsapi=1)           │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  📜 Transcripción Interactiva   │
│  ┌───────────────────────────┐  │
│  │ 🔍 Buscar...              │  │
│  └───────────────────────────┘  │
│                                 │
│  ⏱️ 0:05 - Bienvenidos...       │
│  ⏱️ 0:23 - En este video...     │
│  ⏱️ 1:12 - Vamos a aprender...  │
└─────────────────────────────────┘
```

### 2. Sistema obtiene subtítulos
```
Video ID → API de YouTube → Subtítulos SRT → Parseo → JSON → Componente
```

### 3. Funcionalidades Activas
- ✅ **Búsqueda instantánea**: Filtra segmentos en tiempo real
- ✅ **Resaltado amarillo**: Marca palabras buscadas
- ✅ **Click-to-seek**: Click en segmento → video salta al momento
- ✅ **Timestamps**: Formato min:seg
- ✅ **Auto-scroll**: Scroll al segmento activo
- ✅ **Idioma inteligente**: Prioriza español, fallback a inglés

---

## 📊 Ejemplo de Uso

### Antes de configurar API key:
```
┌──────────────────────────────────────┐
│ ⚠️ No hay subtítulos disponibles     │
│                                      │
│ El instructor debe configurar        │
│ YouTube API key                      │
└──────────────────────────────────────┘
```

### Después de configurar API key:
```
┌──────────────────────────────────────┐
│ 📜 Transcripción Interactiva         │
│ ┌──────────────────────────────────┐ │
│ │ 🔍 Buscar: seguridad             │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ⏱️ 0:45 - Normas de SEGURIDAD       │
│ ⏱️ 2:13 - La SEGURIDAD es vital... │
│ ⏱️ 5:30 - Equipos de SEGURIDAD      │
│                                      │
│ Mostrando 3 segmentos con "seguridad"│
└──────────────────────────────────────┘
```

---

## 🧪 Videos de Prueba

Estos videos tienen subtítulos en español:

| Video | ID | Descripción |
|-------|----|----|
| [Rick Astley](https://youtube.com/watch?v=dQw4w9WgXcQ) | `dQw4w9WgXcQ` | Subtítulos automáticos |
| [Gangnam Style](https://youtube.com/watch?v=9bZkp7q19f0) | `9bZkp7q19f0` | Subtítulos manuales |
| [Despacito](https://youtube.com/watch?v=kJQP7kiw5Fk) | `kJQP7kiw5Fk` | Español nativo |

---

## 🛠️ Estructura del Código

### `components/TranscripcionVideo.tsx`
```typescript
// Props
interface TranscripcionVideoProps {
  videoId: string;        // ID del video de YouTube
  onSeek?: (time: number) => void; // Callback para saltar video
}

// Estados
const [transcripcion, setTranscripcion] = useState<TranscriptSegment[]>([]);
const [busqueda, setBusqueda] = useState('');
const [segmentoActivo, setSegmentoActivo] = useState(-1);

// Funciones principales
cargarTranscripcion() // Fetch de API
handleClickSegmento() // Saltar video
formatearTiempo() // min:seg
```

### `app/api/youtube/transcripcion/route.ts`
```typescript
// Endpoint: GET /api/youtube/transcripcion?videoId=XXX

1. Validar videoId
2. Verificar YOUTUBE_API_KEY
3. Fetch captions de YouTube API
4. Buscar caption en español
5. Descargar SRT
6. Parsear a JSON { time, duration, text }
7. Retornar segments[]
```

### `app/curso/[id]/page.tsx`
```typescript
// Estados
const [videoId, setVideoId] = useState('');

// Función para controlar video
const handleVideoSeek = (time: number) => {
  iframe.contentWindow.postMessage({
    event: 'command',
    func: 'seekTo',
    args: [time, true]
  }, '*');
};

// Render
<iframe src={`${videoUrl}?enablejsapi=1`} />
<TranscripcionVideo videoId={videoId} onSeek={handleVideoSeek} />
```

---

## 📈 Cuotas de API

### Gratuito (Siempre)
- **10,000 unidades/día**
- Obtener captions: ~50 unidades
- = **200 videos/día** ✅

### Costo por operación
- Listar captions: 50 unidades
- Descargar caption: 200 unidades
- **Total por video: 250 unidades**
- = **40 videos/día gratis**

### Optimización
```javascript
// Cachear transcripciones en localStorage
localStorage.setItem(`transcript_${videoId}`, JSON.stringify(segments));

// Reutilizar si existe
const cached = localStorage.getItem(`transcript_${videoId}`);
if (cached) return JSON.parse(cached);
```

---

## 🐛 Debugging

### Verificar en Consola del Navegador (F12)

```javascript
// 1. Ver respuesta de la API
fetch('/api/youtube/transcripcion?videoId=dQw4w9WgXcQ')
  .then(r => r.json())
  .then(console.log);

// 2. Verificar API key
console.log(process.env.YOUTUBE_API_KEY); // En servidor

// 3. Probar control de video
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage(JSON.stringify({
  event: 'command',
  func: 'seekTo',
  args: [30, true]
}), '*');
```

### Verificar en Terminal del Servidor

```bash
# Si ves este error:
# "YouTube API key no configurada"

# Solución:
1. Abre .env.local
2. Verifica que tenga: YOUTUBE_API_KEY=AIza...
3. Reinicia: Ctrl+C → npm run dev
```

---

## ✨ Funcionalidades Futuras (Opcional)

### 1. Caché de Transcripciones
```typescript
// Guardar en Supabase para no re-descargar
await supabase
  .from('transcripciones')
  .insert({ video_id, segments: JSON.stringify(segments) });
```

### 2. Traducción Automática
```typescript
// Usando Google Translate API
const translated = await translateSegments(segments, 'es');
```

### 3. Sincronización Visual
```typescript
// Resaltar segmento actual mientras reproduce
videoElement.addEventListener('timeupdate', () => {
  const current = segments.find(s => 
    s.time <= currentTime && 
    s.time + s.duration > currentTime
  );
  setSegmentoActivo(current);
});
```

### 4. Descargar Transcripción
```typescript
const downloadTXT = () => {
  const text = segments.map(s => `[${formatTime(s.time)}] ${s.text}`).join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  saveAs(blob, `transcripcion_${videoId}.txt`);
};
```

---

## 📞 Recursos

- **Documentación YouTube API**: https://developers.google.com/youtube/v3
- **Google Cloud Console**: https://console.cloud.google.com
- **Guía completa**: `CONFIGURAR-YOUTUBE-API.md`
- **Verificador de API**: `verificador-youtube-api.html`

---

## ✅ Checklist Final

- [ ] API key obtenida de Google Cloud
- [ ] YouTube Data API v3 habilitada
- [ ] API key agregada a `.env.local`
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Probado con video de prueba
- [ ] Búsqueda funciona
- [ ] Click-to-seek funciona
- [ ] Sin errores en consola

---

¡Sistema de subtítulos listo! 🎉🎬
