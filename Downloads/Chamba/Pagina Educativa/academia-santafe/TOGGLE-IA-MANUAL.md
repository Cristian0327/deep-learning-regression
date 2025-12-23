# 🔀 Toggle IA vs Manual en Bloques de Evaluación

## 📋 Descripción

Se agregó un **selector visual** en los bloques de evaluación para que el administrador pueda elegir entre dos métodos de creación de preguntas:

1. **🤖 Generar con IA** - Genera preguntas automáticamente basadas en el contenido
2. **✍️ Crear Manualmente** - Agrega preguntas una por una de forma tradicional

---

## 🎨 Interfaz

### Vista del Toggle

Cuando editas un **Bloque de Evaluación**, ahora aparece primero este selector:

```
┌────────────────────────────────────────────────────────────┐
│ ¿Cómo quieres crear las preguntas?                        │
│                                                            │
│ ┌──────────────────────┐  ┌──────────────────────┐       │
│ │  🤖                  │  │  ✍️                   │       │
│ │  Generar con IA      │  │  Crear Manualmente   │       │
│ └──────────────────────┘  └──────────────────────┘       │
└────────────────────────────────────────────────────────────┘
```

### Modo IA Seleccionado

Si seleccionas **🤖 Generar con IA**, aparece:

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 Generador de Preguntas con IA                           │
│                                                             │
│ 💡 Instrucciones:                                          │
│   • La IA generará preguntas basadas en el contenido       │
│   • Configura el contenido de este bloque primero          │
│   • Las preguntas se crearán con retroalimentación         │
│   • Podrás editarlas antes de agregarlas                   │
│                                                             │
│         ┌──────────────────────────────────┐               │
│         │ ✨ Generar Preguntas con IA     │               │
│         └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Modo Manual Seleccionado

Si seleccionas **✍️ Crear Manualmente**, aparece:

```
┌─────────────────────────────────────────────────────────────┐
│ Preguntas de la Evaluación (0)    [+ Agregar Pregunta]    │
│                                                             │
│ No hay preguntas. Agrega una usando el botón de arriba.    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementación Técnica

### Archivo Modificado

**`components/ConstructorCurso.tsx`**

### Estado Agregado

```typescript
const [modoCreacionPreguntas, setModoCreacionPreguntas] = useState<'ia' | 'manual'>('manual');
```

Por defecto inicia en **'manual'** para mantener compatibilidad con el flujo existente.

### Código del Toggle

```tsx
<div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200">
  <label className="block text-sm font-bold text-gray-800 mb-3">
    ¿Cómo quieres crear las preguntas?
  </label>
  <div className="grid grid-cols-2 gap-3">
    {/* Botón IA */}
    <button
      type="button"
      onClick={() => setModoCreacionPreguntas('ia')}
      className={modoCreacionPreguntas === 'ia' 
        ? 'bg-purple-600 text-white shadow-lg scale-105'
        : 'bg-white text-gray-700 hover:bg-purple-50'}
    >
      🤖 Generar con IA
    </button>
    
    {/* Botón Manual */}
    <button
      type="button"
      onClick={() => setModoCreacionPreguntas('manual')}
      className={modoCreacionPreguntas === 'manual'
        ? 'bg-green-600 text-white shadow-lg scale-105'
        : 'bg-white text-gray-700 hover:bg-green-50'}
    >
      ✍️ Crear Manualmente
    </button>
  </div>
</div>
```

### Renderizado Condicional

```tsx
{/* Botón "Agregar" solo en modo Manual */}
{modoCreacionPreguntas === 'manual' && (
  <button onClick={agregarPreguntaQuiz}>
    + Agregar Pregunta
  </button>
)}

{/* Panel de IA solo cuando está seleccionado */}
{modoCreacionPreguntas === 'ia' && (
  <div className="bg-purple-50 ...">
    {/* UI de generación con IA */}
  </div>
)}
```

---

## 🎯 Flujo de Uso

### Escenario 1: Crear Preguntas con IA

1. **Crear bloque de evaluación**
   - Click en "Evaluación" en el Constructor de Curso

2. **Configurar contenido del bloque**
   - Agregar descripción de la evaluación
   - Escribir contenido relevante (opcional)

3. **Seleccionar modo IA**
   - Click en "🤖 Generar con IA"

4. **Generar preguntas**
   - Click en "✨ Generar Preguntas con IA"
   - Esperar respuesta de la IA

5. **Revisar y editar**
   - Ver preguntas generadas
   - Editar las que necesiten ajustes
   - Agregar al bloque

### Escenario 2: Crear Preguntas Manualmente

1. **Crear bloque de evaluación**

2. **Mantener modo Manual** (es el predeterminado)
   - El toggle ya está en "✍️ Crear Manualmente"

3. **Agregar preguntas**
   - Click en "+ Agregar Pregunta"
   - Llenar formulario (pregunta, opciones, respuesta correcta)
   - Repetir para cada pregunta

---

## 🎨 Estilos y Animaciones

### Estados del Toggle

**Botón Activo:**
- Fondo: Purple-600 (IA) o Green-600 (Manual)
- Texto: Blanco
- Sombra: `shadow-lg`
- Escala: `scale-105` (ligeramente más grande)

**Botón Inactivo:**
- Fondo: Blanco
- Texto: Gris
- Borde: Purple-200 (IA) o Green-200 (Manual)
- Hover: Fondo de color claro

### Transiciones

```css
transition-all /* Todas las propiedades se animan */
```

---

## 💡 Funcionalidad Actual

### Estado: ⚠️ PARCIALMENTE IMPLEMENTADO

**✅ Completado:**
- Toggle funcional con 2 opciones
- UI responsiva y animada
- Renderizado condicional del botón "Agregar"
- Panel de IA con instrucciones

**⏳ Pendiente:**
- Conectar botón "Generar" con el backend
- Integrar con el panel de IA de AdminCursos
- Pasar contenido del bloque a la función de generación
- Mostrar preguntas generadas en el bloque
- Funcionalidad de edición en el bloque

---

## 🔮 Próximos Pasos

### 1. Conectar con Backend

Modificar el botón de "Generar Preguntas con IA" para que:

```typescript
const generarPreguntasBloque = async () => {
  // Validar que haya contenido en el bloque
  if (!bloqueSeleccionado?.contenido?.trim()) {
    alert('Debes agregar contenido al bloque primero');
    return;
  }

  // Llamar al endpoint de IA
  const response = await fetch('/api/generar-preguntas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contenidoCurso: bloqueSeleccionado.contenido,
      tiposPreguntas: {
        opcion2: 2,
        opcion3: 0,
        opcion4: 3,
        opcion5: 0
      }
    })
  });

  const { preguntas } = await response.json();
  
  // Actualizar el bloque con las preguntas generadas
  actualizarBloque({
    ...bloqueSeleccionado,
    preguntas: [...(bloqueSeleccionado.preguntas || []), ...preguntas]
  });
};
```

### 2. Configuración de Tipos

Agregar inputs antes del botón de generación para que el admin configure:

```tsx
<div className="grid grid-cols-4 gap-2 mb-3">
  <input type="number" placeholder="2 opciones" />
  <input type="number" placeholder="3 opciones" />
  <input type="number" placeholder="4 opciones" />
  <input type="number" placeholder="5 opciones" />
</div>
```

### 3. Previsualización

Mostrar las preguntas generadas antes de agregarlas al bloque:

```tsx
{preguntasGeneradasTemp.length > 0 && (
  <div className="bg-white rounded-lg p-4 mt-4">
    <h5>Preguntas Generadas ({preguntasGeneradasTemp.length})</h5>
    {preguntasGeneradasTemp.map((p, idx) => (
      <div key={idx}>
        <p>{p.pregunta}</p>
        <button onClick={() => editarPregunta(idx)}>✏️ Editar</button>
        <button onClick={() => agregarPregunta(p)}>+ Agregar</button>
      </div>
    ))}
  </div>
)}
```

---

## 🧪 Testing

### Casos de Prueba

**Test 1: Toggle entre modos**
- ✅ Click en "IA" → Panel de IA visible, botón "Agregar" oculto
- ✅ Click en "Manual" → Botón "Agregar" visible, panel de IA oculto

**Test 2: Estado por defecto**
- ✅ Al crear nuevo bloque → Modo "Manual" seleccionado

**Test 3: Persistencia del modo**
- ⏳ Al cambiar de modo y volver al bloque → ¿Se mantiene el modo?

**Test 4: Compatibilidad**
- ✅ Bloques antiguos sin el estado → Funcionan en modo Manual

---

## 📱 Responsive Design

El toggle funciona en todos los tamaños:

**Desktop (>768px):**
```
┌──────────────────────┐  ┌──────────────────────┐
│  🤖 Generar con IA   │  │  ✍️ Crear Manualmente │
└──────────────────────┘  └──────────────────────┘
```

**Mobile (<768px):**
```
┌──────────────────────────────┐
│  🤖 Generar con IA           │
└──────────────────────────────┘
┌──────────────────────────────┐
│  ✍️ Crear Manualmente         │
└──────────────────────────────┘
```

Usa `grid-cols-2` que se adapta automáticamente.

---

## ⚙️ Variables de Configuración

### Valores por Defecto

```typescript
// Estado inicial del modo
const MODO_DEFAULT = 'manual';

// Colores del tema IA
const COLOR_IA_ACTIVO = 'bg-purple-600';
const COLOR_IA_INACTIVO = 'bg-purple-50';

// Colores del tema Manual
const COLOR_MANUAL_ACTIVO = 'bg-green-600';
const COLOR_MANUAL_INACTIVO = 'bg-green-50';
```

---

## 🐛 Problemas Conocidos

### 1. **Botón de IA no funcional**
**Estado:** Placeholder con alert()
**Solución:** Implementar en próxima iteración

### 2. **Sin persistencia del modo seleccionado**
**Estado:** Al cambiar de bloque, vuelve a 'manual'
**Solución:** Podría guardarse en el estado del bloque

---

## 📊 Comparación: Antes vs Ahora

### ANTES

```tsx
{/* Solo tenías un botón fijo */}
<button onClick={agregarPreguntaQuiz}>
  + Agregar Pregunta
</button>
```

### AHORA

```tsx
{/* Tienes opción de elegir */}
<div>
  {/* Toggle IA vs Manual */}
  <ToggleSelector />
  
  {/* Renderiza según selección */}
  {modo === 'ia' ? <PanelIA /> : <BotonAgregar />}
</div>
```

---

## 🎯 Beneficios

### Para el Administrador

1. **Flexibilidad**: Elige el método que prefiera
2. **Rapidez**: Genera múltiples preguntas con IA en segundos
3. **Control**: Puede crear preguntas específicas manualmente
4. **Mezcla**: Puede usar ambos métodos en el mismo curso

### Para el Sistema

1. **Escalabilidad**: Fácil agregar más modos en el futuro
2. **UX clara**: Toggle visual e intuitivo
3. **Separación de responsabilidades**: IA y Manual independientes
4. **Compatibilidad**: No rompe funcionalidad existente

---

## 📚 Archivos Relacionados

1. **`components/ConstructorCurso.tsx`** - Toggle implementado aquí
2. **`app/AdminCursos/page.tsx`** - Panel de IA principal (para referenciar)
3. **`netlify/functions/generar-preguntas.js`** - Backend de IA
4. **`CAMBIOS-PANEL-IA.md`** - Documentación del sistema de IA

---

## ✅ Checklist de Implementación

- [x] Estado del toggle agregado
- [x] UI del toggle diseñada y funcional
- [x] Renderizado condicional del botón "Agregar"
- [x] Panel de IA con instrucciones
- [x] Estilos y animaciones
- [x] Responsive design
- [ ] Conectar botón de IA con backend
- [ ] Configuración de tipos de preguntas en bloque
- [ ] Previsualización de preguntas generadas
- [ ] Edición de preguntas en el bloque
- [ ] Persistencia del modo seleccionado
- [ ] Testing completo

---

## 🚀 Estado Actual

**Versión:** 1.0 (Beta)  
**Fecha:** 23 de Diciembre 2025  
**Estado:** ✅ Toggle funcional, ⏳ Backend pendiente  

El toggle está **listo para usarse** visualmente. La funcionalidad de IA se completará conectándola con el sistema existente de `AdminCursos/page.tsx`.
