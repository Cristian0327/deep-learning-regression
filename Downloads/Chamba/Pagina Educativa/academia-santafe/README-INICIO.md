# 🎓 Academia Santa Fe - LMS con IA

Sistema de Gestión de Aprendizaje (LMS) con generación automática de preguntas mediante Inteligencia Artificial.

## ✨ Características

- 🤖 **Generación de Preguntas con IA**: OpenAI genera automáticamente evaluaciones desde el contenido
- 🎲 **Evaluaciones Aleatorias**: Preguntas y respuestas en orden random cada intento
- 📚 **Retroalimentación Educativa**: Explicación de por qué cada respuesta es correcta/incorrecta
- 📜 **Certificados Automáticos**: Descarga en PDF al completar 100%
- 🔓 **Sin Login**: Sistema de inscripción con nombre + documento
- 💾 **Sin Base de Datos**: Todo en LocalStorage (navegador) y archivos JSON
- 🚀 **100% Portable**: Funciona en Netlify, Hostinger, Vercel

---

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```powershell
npm install
```

### 2. Configurar Variables de Entorno

Crea el archivo `.env.local`:

```bash
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Obtener API Key de OpenAI**:
1. Ve a https://platform.openai.com/api-keys
2. Crea una cuenta o inicia sesión
3. Click "Create new secret key"
4. Copia la key (empieza con `sk-...`)

### 3. Iniciar Servidor de Desarrollo

**DOS terminales al mismo tiempo:**

**Terminal 1 - Next.js (Frontend):**
```powershell
npm run dev
```

**Terminal 2 - Express (API Local):**
```powershell
cd api
node server.js
```

### 4. Abrir en Navegador

```
http://localhost:3000
```

---

## 📖 Documentación

- **[IA-GENERACION-PREGUNTAS.md](IA-GENERACION-PREGUNTAS.md)**: Guía completa del sistema de IA
- **[NETLIFY-DEPLOY.md](NETLIFY-DEPLOY.md)**: Deploy en Netlify paso a paso
- **[DEPLOY.md](DEPLOY.md)**: Otras opciones de hosting (Hostinger, Vercel)
- **[SISTEMA-SIN-LOGIN.md](SISTEMA-SIN-LOGIN.md)**: Cómo funciona el sistema sin autenticación

---

## 🎯 Uso Básico

### Para Administradores

1. **Crear Curso**:
   - Ve a http://localhost:3000/AdminCursos
   - Click "Crear Nuevo Curso"
   - Llena: Título, categoría, instructor, contenido

2. **Generar Preguntas con IA**:
   - En el mismo formulario, baja a "🤖 Generador de Preguntas con IA"
   - Click "Abrir Panel IA"
   - Configura número de preguntas y dificultad
   - Click "✨ Generar Preguntas con IA"
   - Revisa las preguntas generadas
   - Click "Agregar Todas" o agrega individualmente

3. **Guardar Curso**:
   - Click "Guardar Curso"
   - Listo! El curso está disponible

### Para Estudiantes

1. **Ver Cursos**:
   - Ve a http://localhost:3000/cursos
   - Click en un curso

2. **Inscribirse**:
   - Ingresa la clave de inscripción (definida por admin)
   - Aparece modal: ingresa nombre + documento
   - ¡Inscrito!

3. **Estudiar**:
   - Lee el contenido del curso
   - Ve el video (si hay)

4. **Evaluación**:
   - Click "Iniciar Evaluación"
   - **Las preguntas están en orden aleatorio**
   - **Las respuestas (A, B, C, D) también**
   - Responde todas

5. **Resultado**:
   - Si aprueba (100%): Descarga certificado
   - Si falla: Ve retroalimentación completa
   - Click "🔄 Reintentar (Preguntas Aleatorias)"
   - **Nuevo orden cada vez**

---

## 🏗️ Estructura del Proyecto

```
academia-santafe/
├── app/                          # Páginas de Next.js
│   ├── AdminCursos/page.tsx      # Panel admin con IA
│   ├── curso/[id]/page.tsx       # Página individual de curso (con aleatorización)
│   └── cursos/page.tsx           # Lista de cursos
├── netlify/functions/            # Netlify Functions (API serverless)
│   ├── cursos.js                 # CRUD de cursos
│   └── generar-preguntas.js      # IA - Generación automática
├── api/                          # API Express (desarrollo local)
│   ├── server.js                 # Servidor local
│   └── data/cursos/              # Almacenamiento JSON
├── components/                   # Componentes React
├── lib/                          # Utilidades
│   ├── api-client.ts             # Cliente HTTP
│   ├── api-config.ts             # Configuración (auto-detecta Netlify)
│   └── generarCertificado.ts     # Generador de PDF
├── public/                       # Archivos estáticos
├── .env.local                    # Variables de entorno (TÚ LO CREAS)
├── netlify.toml                  # Configuración Netlify
└── package.json                  # Dependencias
```

---

## 🤖 Cómo Funciona la IA

1. **Admin llena contenido del curso** (texto + bloques)
2. **Click "Generar Preguntas"**
3. **Backend envía contenido a OpenAI API**:
   ```
   Prompt: "Eres un experto educador. Genera X preguntas de opción 
   múltiple desde este contenido. Incluye retroalimentación de por 
   qué cada respuesta es correcta o incorrecta."
   ```
4. **OpenAI responde** con JSON:
   ```json
   [
     {
       "pregunta": "¿Qué es...?",
       "opciones": ["A", "B", "C", "D"],
       "respuestaCorrecta": 1,
       "retroalimentacion": "La B es correcta porque..."
     }
   ]
   ```
5. **Admin revisa y aprueba**
6. **Se guardan en el curso**

### Al Tomar Evaluación:

1. **Aleatorización de preguntas**:
   ```javascript
   const shuffled = [...preguntas].sort(() => Math.random() - 0.5);
   ```

2. **Aleatorización de respuestas**:
   ```javascript
   const opcionesConIndice = opciones.map((op, idx) => ({
     texto: op,
     indiceOriginal: idx
   }));
   const opcionesAleatorias = opcionesConIndice.sort(() => Math.random() - 0.5);
   ```

3. **Feedback inmediato**: Al seleccionar incorrecta, aparece:
   - ❌ "Respuesta incorrecta"
   - Explicación de la IA
   - 💡 Respuesta correcta

4. **Resumen final**: Si falla, ve todas las incorrectas con explicaciones

---

## 🔧 Scripts Disponibles

```powershell
# Desarrollo
npm run dev              # Next.js en localhost:3000

# Producción
npm run build            # Crear build de producción
npm start                # Iniciar servidor de producción

# Linter
npm run lint             # Verificar código
```

---

## 📦 Tecnologías

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **OpenAI API** - Generación de preguntas con IA
- **jsPDF** - Generación de certificados
- **Express.js** - API local (desarrollo)
- **Netlify Functions** - API serverless (producción)

---

## 🚨 Troubleshooting

### "OPENAI_API_KEY is not defined"

**Solución**: Crea `.env.local` con tu API key:
```bash
OPENAI_API_KEY=sk-...
```

### "Cannot GET /api/cursos"

**Solución**: Inicia el servidor Express:
```powershell
cd api
node server.js
```

### "Module not found: Can't resolve 'openai'"

**Solución**: Instala dependencias:
```powershell
npm install
```

### IA no genera preguntas

**Solución**:
1. Verifica API key en `.env.local`
2. Comprueba que el curso tenga contenido
3. Revisa consola del navegador (F12)

---

## 📄 Licencia

Proyecto educativo - Academia Santa Fe

---

## 🤝 Soporte

Para issues:
1. Revisa los archivos `.md` de documentación
2. Verifica consola del navegador (F12)
3. Comprueba variables de entorno

---

**¡Listo para empezar! 🎉**

```powershell
npm install
npm run dev
```

Luego en otra terminal:

```powershell
cd api
node server.js
```

Abre: http://localhost:3000
