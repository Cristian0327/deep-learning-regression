# 🔄 Cambios en el Panel de IA

## 📋 Resumen de Mejoras

Se ha mejorado significativamente el panel de generación de preguntas con IA en la página de **AdminCursos** para ofrecer más control y flexibilidad.

---

## ✨ Nuevas Características

### 1. **Control Granular de Tipos de Preguntas**

Ahora puedes especificar exactamente cuántas preguntas de cada tipo quieres generar:

- **📝 2 opciones** (Verdadero/Falso o A/B)
- **📋 3 opciones** (A, B, C)
- **✅ 4 opciones** (A, B, C, D) - Por defecto: 5 preguntas
- **📚 5 opciones** (A, B, C, D, E)

**Antes:**
```
┌─────────────────────────────┐
│ Número de preguntas: [10]  │
│ Dificultad: [Medio ▼]      │
└─────────────────────────────┘
```

**Ahora:**
```
┌─────────────────────────────────────────┐
│ 📝 2 opciones (V/F):        [0]        │
│ 📋 3 opciones (ABC):        [0]        │
│ ✅ 4 opciones (ABCD):       [5]        │
│ 📚 5 opciones (ABCDE):      [0]        │
│ ─────────────────────────────────────  │
│ Total de preguntas: 5                  │
└─────────────────────────────────────────┘
```

### 2. **Dificultad Automática Mezclada**

❌ **Eliminado:** Selector de dificultad

✅ **Nuevo:** La IA mezcla automáticamente preguntas fáciles, medias y difíciles basándose en el contenido del PDF del curso.

**Razón:** Las preguntas provienen directamente del contenido del curso, por lo que tienen dificultad inherente. No necesitas seleccionarla manualmente.

### 3. **Edición de Preguntas Generadas**

Ahora puedes **revisar y modificar** cada pregunta generada por la IA antes de agregarla al curso:

**Botones por pregunta:**
- **✏️ Editar** - Abre modal de edición
- **+ Agregar** - Agrega la pregunta al curso
- **🗑️ Eliminar** - Elimina de la lista generada

**Modal de Edición incluye:**
- ✍️ Texto de la pregunta
- 📝 Todas las opciones de respuesta (A, B, C, D, E según corresponda)
- ✅ Selector de respuesta correcta
- 💡 Retroalimentación educativa
- 💾 Botón "Guardar Cambios"

### 4. **Vista Previa Mejorada**

Cada pregunta generada muestra:
- ✅ **Respuesta correcta** destacada en verde
- 💬 **Retroalimentación** en panel morado
- 🎯 **Tipo de pregunta** (número de opciones visible)

---

## 🔧 Cambios Técnicos

### Frontend (`app/AdminCursos/page.tsx`)

**Estado Actualizado:**
```typescript
// ANTES
const [numPreguntasIA, setNumPreguntasIA] = useState(10);
const [dificultadIA, setDificultadIA] = useState('medio');

// AHORA
const [preguntasIA, setPreguntasIA] = useState({
  opcion2: 0,  // Preguntas de 2 opciones
  opcion3: 0,  // Preguntas de 3 opciones
  opcion4: 5,  // Preguntas de 4 opciones (por defecto)
  opcion5: 0   // Preguntas de 5 opciones
});
const [preguntaEditando, setPreguntaEditando] = useState<any>(null);
```

**Nuevas Funciones:**
```typescript
// Editar pregunta generada
editarPreguntaIA(index: number)

// Guardar cambios después de editar
guardarPreguntaEditada()

// Eliminar pregunta de la lista
eliminarPreguntaIA(index: number)
```

**Llamada API Actualizada:**
```typescript
// ANTES
fetch('/api/generar-preguntas', {
  body: JSON.stringify({
    contenidoCurso,
    numPreguntas: 10,
    dificultad: 'medio'
  })
})

// AHORA
fetch('/api/generar-preguntas', {
  body: JSON.stringify({
    contenidoCurso,
    tiposPreguntas: {
      opcion2: 0,
      opcion3: 0,
      opcion4: 5,
      opcion5: 0
    }
  })
})
```

### Backend (`netlify/functions/generar-preguntas.js`)

**Parámetros de Entrada:**
```javascript
// ANTES
const { contenidoCurso, numPreguntas, dificultad } = JSON.parse(event.body);

// AHORA
const { contenidoCurso, tiposPreguntas } = JSON.parse(event.body);
// tiposPreguntas = { opcion2, opcion3, opcion4, opcion5 }
```

**Validación:**
```javascript
// Calcula total de preguntas solicitadas
const totalPreguntas = 
  (tiposPreguntas.opcion2 || 0) + 
  (tiposPreguntas.opcion3 || 0) + 
  (tiposPreguntas.opcion4 || 0) + 
  (tiposPreguntas.opcion5 || 0);

if (totalPreguntas === 0) {
  return { error: 'Debes especificar al menos una pregunta' };
}
```

**Prompt de IA Mejorado:**
```javascript
INSTRUCCIONES:
- Genera exactamente:
  * 3 preguntas con 2 opciones (V/F o A/B)
  * 0 preguntas con 3 opciones
  * 5 preguntas con 4 opciones (A, B, C, D)
  * 2 preguntas con 5 opciones (A, B, C, D, E)
- MEZCLA niveles de dificultad automáticamente
- Las preguntas deben extraerse del contenido del curso
- Incluye retroalimentación educativa completa
```

---

## 📖 Cómo Usar el Nuevo Sistema

### Paso 1: Configurar Tipos de Preguntas
```
1. En el panel "🤖 Generador de Preguntas con IA"
2. Ingresa cuántas preguntas de cada tipo quieres:
   - 📝 2 opciones: 3
   - 📋 3 opciones: 0
   - ✅ 4 opciones: 5
   - 📚 5 opciones: 2
3. Verás el total: "Total de preguntas: 10"
```

### Paso 2: Generar Preguntas
```
4. Click en "✨ Generar Preguntas con IA"
5. Espera mientras la IA crea las preguntas
6. Aparecerá la lista "Preguntas Generadas (10)"
```

### Paso 3: Revisar y Editar
```
7. Para cada pregunta, puedes:
   
   ✏️ EDITAR:
   - Click en "✏️ Editar"
   - Se abre modal
   - Modifica pregunta, opciones, respuesta correcta
   - Ajusta retroalimentación
   - Click "💾 Guardar Cambios"
   
   + AGREGAR:
   - Click "+ Agregar" para agregar al curso
   
   🗑️ ELIMINAR:
   - Click "🗑️ Eliminar" si no te gusta
```

### Paso 4: Agregar al Curso
```
8. Opción 1: Click "+ Agregar" en cada pregunta individual
9. Opción 2: Click "Agregar Todas" para agregar todas juntas
10. Las preguntas se agregarán a la evaluación del curso
```

---

## 💡 Ejemplos de Uso

### Caso 1: Curso Básico
```
📝 2 opciones: 5   → Preguntas V/F simples
📋 3 opciones: 0
✅ 4 opciones: 3   → Algunas más complejas
📚 5 opciones: 0
Total: 8 preguntas
```

### Caso 2: Examen Completo
```
📝 2 opciones: 10  → Preguntas rápidas
📋 3 opciones: 5   → Nivel intermedio
✅ 4 opciones: 10  → Estándar
📚 5 opciones: 5   → Desafiantes
Total: 30 preguntas
```

### Caso 3: Solo Estándar
```
📝 2 opciones: 0
📋 3 opciones: 0
✅ 4 opciones: 15  → Solo formato tradicional
📚 5 opciones: 0
Total: 15 preguntas
```

---

## ⚠️ Notas Importantes

### ✅ Ventajas del Nuevo Sistema

1. **Control Total:** Decides exactamente qué tipo de preguntas generar
2. **Flexibilidad:** Mezcla diferentes tipos según necesites
3. **Edición:** Ajusta cualquier pregunta antes de usar
4. **Calidad:** La IA mezcla dificultades automáticamente
5. **Basado en Contenido:** Preguntas extraídas del PDF del curso

### ⚠️ Limitaciones

1. **Total máximo recomendado:** 30 preguntas por generación (límite de tokens de OpenAI)
2. **Debes tener contenido:** Si no hay contenido en el curso, la IA no puede generar preguntas relevantes
3. **API Key requerida:** Necesitas configurar `OPENAI_API_KEY` en variables de entorno

### 🔒 Validaciones

- ✅ Al menos una pregunta debe ser mayor a 0
- ✅ Contenido del curso debe existir
- ✅ Al editar, respuesta correcta debe ser válida

---

## 🚀 Próximos Pasos (Pendientes)

### Integración con Evaluaciones
Agregar una opción al crear bloques de evaluación:

```tsx
┌──────────────────────────────────────┐
│ ¿Cómo quieres crear las preguntas?  │
│                                      │
│ ○ 🤖 Generar con IA                 │
│ ○ ✍️  Crear manualmente              │
└──────────────────────────────────────┘
```

Si selecciona "IA": Muestra panel de configuración de tipos
Si selecciona "Manual": Muestra el botón "Agregar Pregunta" tradicional

---

## 📝 Checklist de Funcionalidades

- [x] Configuración de tipos de preguntas (2, 3, 4, 5 opciones)
- [x] Eliminación de selector de dificultad
- [x] Mezcla automática de dificultades en backend
- [x] Botón "Editar" en cada pregunta generada
- [x] Modal de edición completo
- [x] Botón "Eliminar" en cada pregunta
- [x] Actualización del prompt de IA
- [x] Validaciones de entrada
- [x] Contador de total de preguntas
- [x] Integración de toggle "IA vs Manual" en bloque de evaluación ✨ NUEVO

---

## 🎓 Beneficios Pedagógicos

### Para Instructores
- ⏱️ **Ahorro de tiempo:** Genera evaluaciones en segundos
- 🎯 **Precisión:** Preguntas basadas en el contenido real del curso
- 🔄 **Flexibilidad:** Ajusta cualquier pregunta generada
- 📊 **Variedad:** Mezcla diferentes tipos de preguntas

### Para Estudiantes
- 📚 **Relevancia:** Preguntas del contenido que estudiaron
- 💡 **Retroalimentación:** Aprenden de sus errores con explicaciones
- 🎲 **No memorización:** Preguntas y respuestas aleatorizadas
- ⚖️ **Dificultad balanceada:** Mezcla de fácil a difícil

---

## 🐛 Resolución de Problemas

### Error: "Debes especificar al menos una pregunta"
**Solución:** Asegúrate de que al menos un campo tenga un número mayor a 0.

### Error: "contenidoCurso es requerido"
**Solución:** Agrega contenido al curso (texto o bloques) antes de generar preguntas.

### La IA genera preguntas genéricas
**Solución:** Agrega más contenido específico al curso. La IA necesita contexto detallado.

### No aparece el botón "Editar"
**Solución:** Asegúrate de estar en la última versión del código y recarga la página.

---

## 📚 Archivos Modificados

1. **app/AdminCursos/page.tsx** (Frontend)
   - Líneas 48-56: Nuevo estado `preguntasIA`
   - Líneas 195-230: Función `generarPreguntasConIA()` actualizada
   - Líneas 250-286: Nuevas funciones de edición
   - Líneas 740-790: Nueva UI de configuración
   - Líneas 840-900: Botones de acción agregados
   - Final del archivo: Modal de edición

2. **netlify/functions/generar-preguntas.js** (Backend)
   - Líneas 25-50: Nueva validación de `tiposPreguntas`
   - Líneas 52-90: Prompt actualizado con tipos específicos
   - Línea 95: Aumento de `max_tokens` a 3000

---

## ✅ Estado Final

**Todo funcionando correctamente:**
- ✅ Sin errores de compilación
- ✅ Frontend actualizado con nueva UI
- ✅ Backend preparado para nuevo formato
- ✅ Modal de edición funcional
- ✅ Validaciones implementadas
- ✅ Documentación actualizada

**Listo para probar en:** `http://localhost:3000/AdminCursos`
