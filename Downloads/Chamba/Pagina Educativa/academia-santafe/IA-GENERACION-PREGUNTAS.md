# 🤖 Sistema de Generación de Preguntas con IA

## ✨ Características Implementadas

### 1. Generación Automática de Preguntas
- **IA Analiza el Contenido**: La inteligencia artificial lee todo el contenido del curso (texto + bloques)
- **Preguntas de Opción Múltiple**: Genera automáticamente preguntas con 4 opciones
- **Retroalimentación Educativa**: Cada pregunta incluye explicación de por qué cada respuesta es correcta o incorrecta
- **Configurable**: El administrador decide:
  - Número de preguntas (1-50)
  - Nivel de dificultad (Fácil, Medio, Difícil)

### 2. Orden Aleatorio de Preguntas
- **Cada intento es diferente**: Las preguntas se mezclan al iniciar la evaluación
- **Respuestas aleatorizadas**: Dentro de cada pregunta, las opciones (A, B, C, D) cambian de orden
- **Sin memoria**: Cada vez que el estudiante reintenta, obtiene un orden completamente nuevo

### 3. Retroalimentación Instructiva
- **Inmediata**: Al seleccionar una respuesta incorrecta, se muestra la explicación al instante
- **Final**: Al terminar la evaluación (si no aprueba), se muestra un resumen completo de:
  - Qué preguntó mal
  - Qué respondió
  - Cuál era la respuesta correcta
  - Por qué es correcta (explicación de la IA)

---

## 🚀 Configuración

### Paso 1: Obtener API Key de OpenAI

1. Ve a https://platform.openai.com/api-keys
2. Crea una cuenta o inicia sesión
3. Click en "Create new secret key"
4. Copia la key (empieza con `sk-...`)

### Paso 2: Configurar Variables de Entorno

**En Desarrollo (localhost):**

1. Crea el archivo `.env.local` en la raíz del proyecto
2. Agrega tu API key:

```bash
OPENAI_API_KEY=sk-tu-api-key-aqui
```

**En Netlify (Producción):**

1. Ve a tu dashboard de Netlify
2. Settings → Environment Variables
3. Agrega:
   - Key: `OPENAI_API_KEY`
   - Value: `sk-tu-api-key-aqui`

**En Hostinger u otro hosting:**

El archivo `.env.local` ya debería tener la configuración. Asegúrate de que el servidor Node.js pueda leer las variables de entorno.

---

## 📖 Cómo Usar (Para Administradores)

### Crear Curso con Preguntas IA

1. **Ve a Admin → Cursos**
2. **Click en "Crear Nuevo Curso"**
3. **Llena los datos del curso**:
   - Título, categoría, instructor
   - **IMPORTANTE**: Agrega contenido detallado en la sección de texto
   - Usa el Constructor de Curso para agregar más bloques

4. **Abre el Panel de IA** (botón morado "Generador de Preguntas con IA")

5. **Configura la generación**:
   - **Número de Preguntas**: ¿Cuántas quieres? (ej: 10)
   - **Dificultad**: 
     - Fácil: Conceptos básicos
     - Medio: Aplicación de conocimientos
     - Difícil: Análisis y síntesis

6. **Click en "✨ Generar Preguntas con IA"**
   - La IA procesará el contenido (tarda 10-30 segundos)
   - Se mostrarán las preguntas generadas con vista previa

7. **Revisa las Preguntas Generadas**:
   - Lee cada pregunta
   - Verifica que las opciones sean correctas
   - Comprueba la retroalimentación

8. **Agrega las Preguntas**:
   - Click en "+ Agregar" en cada pregunta individual, O
   - Click en "Agregar Todas" para incluir todas

9. **Guarda el Curso**

---

## 🎓 Experiencia del Estudiante

### Al Tomar la Evaluación:

1. **Inscripción**: Ingresa nombre + documento
2. **Estudia el Contenido**: Lee el material del curso
3. **Click en "Iniciar Evaluación"**

### Durante la Evaluación:

- **Preguntas Aleatorias**: El orden cambia cada vez
- **Retroalimentación Inmediata**: 
  - Si selecciona una respuesta incorrecta, aparece:
    - ❌ "Respuesta incorrecta"
    - Explicación de por qué está mal
    - 💡 Cuál es la correcta y por qué

### Al Finalizar:

**Si aprueba (100%):**
- ✅ "¡Felicitaciones!"
- Descarga el certificado
- Progreso al 100%

**Si no aprueba (<100%):**
- 📚 "Revisa tus errores"
- Lista de todas las preguntas incorrectas con:
  - Tu respuesta
  - Respuesta correcta
  - Explicación detallada
- 🔄 Botón "Reintentar (Preguntas Aleatorias)"

### Al Reintentar:

- Nuevo orden de preguntas
- Nuevas posiciones de respuestas (A, B, C, D mezcladas)
- Mismo contenido educativo pero presentación diferente

---

## 🔧 Detalles Técnicos

### Arquitectura

```
AdminCursos/page.tsx
│
├─ Estado: generandoPreguntasIA, preguntasGeneradas
├─ Función: generarPreguntasConIA()
│  └─ Llama a: /.netlify/functions/generar-preguntas
│
netlify/functions/generar-preguntas.js
│
├─ Recibe: { contenidoCurso, numPreguntas, dificultad }
├─ Llama a: OpenAI API (gpt-3.5-turbo)
├─ Retorna: Array de preguntas con retroalimentación
│
curso/[id]/page.tsx
│
├─ Estado: preguntasAleatorias, respuestasIncorrectas
├─ Función: iniciarEvaluacion()
│  ├─ Mezcla orden de preguntas
│  └─ Mezcla orden de respuestas
├─ Función: siguientePregunta()
│  └─ Registra errores con retroalimentación
└─ UI: Muestra feedback inmediato + resumen final
```

### Algoritmo de Aleatorización

**Preguntas:**
```javascript
const preguntasShuffled = [...evaluaciones].sort(() => Math.random() - 0.5);
```

**Respuestas:**
```javascript
const opcionesConIndice = opciones.map((opcion, idx) => ({
  texto: opcion,
  indiceOriginal: idx
}));

const opcionesAleatorias = opcionesConIndice.sort(() => Math.random() - 0.5);

const nuevaRespuestaCorrecta = opcionesAleatorias.findIndex(
  op => op.indiceOriginal === pregunta.respuestaCorrecta
);
```

### Modelo de Datos

**Pregunta Generada por IA:**
```json
{
  "id": "pregunta_1234567890_0",
  "tipo": "multiple",
  "pregunta": "¿Cuál es el objetivo principal de la seguridad industrial?",
  "opciones": [
    "Aumentar la productividad",
    "Prevenir accidentes y enfermedades laborales",
    "Reducir costos operativos",
    "Cumplir normativas legales"
  ],
  "respuestaCorrecta": 1,
  "retroalimentacion": "La seguridad industrial tiene como objetivo principal prevenir accidentes y enfermedades laborales, protegiendo la salud de los trabajadores. Aunque aumentar productividad y cumplir normativas son importantes, el enfoque central es la prevención de riesgos."
}
```

### Prompt de OpenAI

El sistema envía este prompt a la IA:

```
Eres un experto educador creando una evaluación de opción múltiple.

CONTENIDO DEL CURSO:
[Todo el texto del curso]

INSTRUCCIONES:
- Genera X preguntas de opción múltiple
- Nivel de dificultad: [facil/medio/dificil]
- Cada pregunta debe tener 4 opciones (A, B, C, D)
- Indica cuál es la respuesta correcta
- IMPORTANTE: Incluye una retroalimentación educativa que explique 
  POR QUÉ la respuesta correcta es correcta y 
  POR QUÉ las otras opciones son incorrectas

FORMATO JSON...
```

---

## 💰 Costos de OpenAI

### Modelo: gpt-3.5-turbo

- **Precio**: ~$0.002 por 1,000 tokens
- **Estimación por curso**:
  - Generar 10 preguntas: ~$0.01 - $0.05 USD
  - Generar 20 preguntas: ~$0.05 - $0.10 USD

### Ejemplo Real:

Si generas 50 cursos con 10 preguntas cada uno:
- Total: 500 preguntas generadas
- Costo aproximado: $2 - $5 USD

**Es muy económico** 💰

---

## 🚨 Solución de Problemas

### Error: "API key not found"

**Causa**: No configuraste OPENAI_API_KEY

**Solución**:
1. En desarrollo: Agrega la key a `.env.local`
2. En producción: Agrega la key en las variables de entorno de Netlify

### Error: "La IA no devolvió un formato JSON válido"

**Causa**: La IA a veces responde con texto adicional

**Solución**: El sistema ya tiene un fallback que extrae el JSON del texto. Si persiste:
- Reduce el número de preguntas
- Simplifica el contenido del curso
- Verifica que el contenido no tenga caracteres especiales

### No Genera Preguntas / Tarda Mucho

**Causa**: Curso muy largo o conexión lenta

**Solución**:
- Divide el curso en módulos más pequeños
- Reduce el número de preguntas solicitadas
- Verifica tu conexión a internet

### Preguntas de Baja Calidad

**Causa**: Contenido del curso muy genérico

**Solución**:
- Agrega más detalles técnicos al curso
- Usa el Constructor de Bloques para estructurar mejor
- Incrementa el nivel de dificultad

---

## 📊 Análisis de Retroalimentación

### Métricas Disponibles (LocalStorage)

```javascript
// Evaluación guardada
{
  "nombre": "Juan Pérez",
  "documento": "123456",
  "calificacion": 80,
  "respuestas": {...},
  "fecha": "2024-01-15T10:30:00Z"
}

// Inscripción guardada
{
  "progreso": 100,
  "completado": true,
  "fechaCompletado": "2024-01-15T10:35:00Z"
}
```

### Estadísticas que Puedes Calcular:

1. **Tasa de aprobación**: % de estudiantes con 100%
2. **Promedio de intentos**: Cuántas veces reintentan
3. **Preguntas más falladas**: Analizar patrones de error
4. **Tiempo promedio**: Desde inscripción hasta certificado

---

## 🎯 Mejores Prácticas

### Para Administradores:

1. **Contenido Rico**: Mientras más detallado el curso, mejores preguntas genera la IA
2. **Revisar Siempre**: No confíes 100% en la IA, revisa cada pregunta
3. **Mezclar**: Combina preguntas de IA con preguntas manuales
4. **Actualizar**: Regenera preguntas periódicamente para mantener frescura

### Para Instructores:

1. **Explicar la Retroalimentación**: Edita las explicaciones de la IA si es necesario
2. **Dificultad Progresiva**: Usa "Fácil" para cursos básicos, "Difícil" para avanzados
3. **Contexto Cultural**: Verifica que las preguntas sean apropiadas para tu audiencia

### Para Estudiantes:

1. **Lee la Retroalimentación**: No solo memorices, entiende POR QUÉ
2. **Reintentar Aprendiendo**: Usa los intentos para aprender, no solo para aprobar
3. **Toma Notas**: Guarda las explicaciones de tus errores

---

## 🔮 Futuras Mejoras Posibles

- [ ] Otros modelos de IA (Claude, Gemini)
- [ ] Banco de preguntas por categoría
- [ ] Análisis de dificultad real (estadísticas)
- [ ] Preguntas de tipo verdadero/falso
- [ ] Exportar preguntas a PDF
- [ ] Modo "examen sorpresa" con tiempo límite

---

## 📞 Soporte

Si tienes problemas:

1. Revisa este README completo
2. Verifica las variables de entorno
3. Comprueba la consola del navegador (F12)
4. Revisa los logs de Netlify Functions

---

**¡Disfruta del poder de la IA en tu LMS! 🚀**
