# ⚡ Guía de Prueba Rápida - 5 Minutos

## 🎯 Objetivo

Verificar que TODO funciona:
- ✅ IA genera preguntas
- ✅ Preguntas aleatorias
- ✅ Retroalimentación funciona

---

## 📋 Preparación (2 minutos)

### 1. Instalar Dependencias

```powershell
cd academia-santafe
npm install
```

### 2. Configurar OpenAI

**Opción A: Con API Key real**

Crea `.env.local`:
```bash
OPENAI_API_KEY=sk-tu-key-de-openai
```

**Opción B: Sin API Key (solo test local)**

Puedes probar todo excepto la IA. Continúa sin este archivo.

### 3. Iniciar Servidores

**Terminal 1 - Next.js:**
```powershell
npm run dev
```

**Terminal 2 - API:**
```powershell
cd api
node server.js
```

---

## ✅ Test 1: Panel de IA (1 minuto)

1. Abre: http://localhost:3000/AdminCursos
2. Click **"Crear Nuevo Curso"**
3. Llena:
   - Título: "Test IA"
   - Categoría: "Prueba"
   - Instructor: "Tu Nombre"
   - Contenido (IMPORTANTE): 
     ```
     La seguridad industrial es fundamental para prevenir accidentes.
     Los EPP (Elementos de Protección Personal) incluyen casco, guantes y gafas.
     Las normas OSHA regulan la seguridad en el trabajo.
     ```

4. **Baja hasta ver**: "🤖 Generador de Preguntas con IA"
5. Click **"Abrir Panel IA"**
6. Configura:
   - Número: 5
   - Dificultad: Medio
7. Click **"✨ Generar Preguntas con IA"**

**Resultado Esperado**:
- ⏳ Aparece "Generando preguntas..." (20-30 segundos)
- ✅ Aparecen 5 preguntas con:
  - 4 opciones cada una
  - Indicador de cuál es correcta (fondo verde)
  - Retroalimentación visible

**Si falla**:
- ❌ Error "API key not found" → Verifica `.env.local`
- ❌ Error de red → Verifica que ambos servidores estén corriendo

**Si funciona**: ✅ Continúa

---

## ✅ Test 2: Guardar Curso con Preguntas IA (30 segundos)

1. En las preguntas generadas, click **"Agregar Todas"**
2. Verifica que aparezcan en la lista de evaluaciones
3. Click **"Guardar Curso"**
4. Debería aparecer en la lista de cursos

**Resultado Esperado**:
- ✅ Curso guardado exitosamente
- ✅ Aparece en la lista con las 5 preguntas

---

## ✅ Test 3: Aleatorización de Preguntas (1 minuto)

1. Ve a: http://localhost:3000/cursos
2. Click en el curso "Test IA"
3. Inscríbete:
   - Clave: (la que pusiste, o déjala vacía si no pusiste)
   - Nombre: "Estudiante Test"
   - Documento: "123456"
4. Click **"Iniciar Evaluación"**

**Observa**:
- Las preguntas están en un orden
- Las opciones A, B, C, D están en posiciones específicas

5. **SIN responder**, abre la consola (F12)
6. Ejecuta:
   ```javascript
   window.location.reload()
   ```
7. Inscríbete de nuevo (usa documento diferente: "123457")
8. Click **"Iniciar Evaluación"** otra vez

**Resultado Esperado**:
- ✅ El **ORDEN de las preguntas es DIFERENTE**
- ✅ Las **opciones A, B, C, D cambiaron de posición**

**Ejemplo**:
```
Intento 1:
Pregunta 1: "¿Qué es EPP?"
  A. Elementos de Protección Personal ✓
  B. Equipo de Prevención Primaria
  C. ...
  
Intento 2:
Pregunta 1: "¿Qué regulan las normas OSHA?"
  A. Seguridad industrial
  B. Salud ocupacional ✓
  C. ...
```

**Si funciona**: ✅ Continúa

---

## ✅ Test 4: Retroalimentación Inmediata (30 segundos)

1. En la evaluación, **selecciona una respuesta INCORRECTA**
2. Observa debajo del botón

**Resultado Esperado**:
- ✅ Aparece un recuadro rojo con:
  - "❌ Respuesta incorrecta"
  - Explicación de la IA
  - "💡 Respuesta correcta: [texto]"

**Ejemplo**:
```
❌ Respuesta incorrecta

La respuesta "Equipo de Prevención Primaria" es incorrecta 
porque EPP significa Elementos de Protección Personal. 
Los EPP son dispositivos individuales que protegen al 
trabajador de riesgos específicos.

💡 Respuesta correcta: Elementos de Protección Personal
```

**Si funciona**: ✅ Continúa

---

## ✅ Test 5: Resumen de Errores (30 segundos)

1. Responde todas las preguntas **INCORRECTAMENTE**
2. Click **"Finalizar"**

**Resultado Esperado**:
- ❌ "Intenta de Nuevo - Obtuviste 0%"
- ✅ Aparece sección "📚 Revisa tus errores:"
- ✅ Lista de TODAS las preguntas con:
  - Tu respuesta (roja)
  - Respuesta correcta (verde)
  - Explicación completa de la IA

3. Click **"🔄 Reintentar (Preguntas Aleatorias)"**

**Resultado Esperado**:
- ✅ Evaluación reinicia
- ✅ **Orden diferente de preguntas**
- ✅ **Opciones mezcladas de nuevo**

---

## ✅ Test 6: Aprobar y Certificado (30 segundos)

1. Esta vez, responde todas **CORRECTAMENTE**
   - Usa la retroalimentación del intento anterior
2. Click **"Finalizar"**

**Resultado Esperado**:
- ✅ "¡Felicitaciones! Obtuviste 100%"
- ✅ Botón "Descargar Certificado"
3. Click **"Descargar Certificado"**

**Resultado Esperado**:
- ✅ Se descarga un PDF
- ✅ Tiene tu nombre "Estudiante Test"
- ✅ Nombre del curso "Test IA"
- ✅ Fecha actual

---

## 🎯 Checklist Final

Marca lo que funciona:

- [ ] Panel de IA carga
- [ ] Genera preguntas automáticamente
- [ ] Preguntas tienen retroalimentación
- [ ] Preguntas se agregan al curso
- [ ] Curso se guarda
- [ ] Evaluación carga
- [ ] Preguntas en orden aleatorio
- [ ] Respuestas (A, B, C, D) mezcladas
- [ ] Retroalimentación inmediata aparece
- [ ] Resumen de errores completo
- [ ] Reintentar cambia el orden
- [ ] Certificado se descarga

**Si TODO tiene ✅**: **SISTEMA 100% FUNCIONAL** 🎉

---

## 🚨 Problemas Comunes

### "OPENAI_API_KEY is not defined"

**Causa**: Archivo `.env.local` no existe o está mal

**Solución**:
```powershell
# Crear archivo
echo OPENAI_API_KEY=sk-tu-key > .env.local

# Reiniciar servidor
# Ctrl+C en terminal de Next.js
npm run dev
```

### "Cannot GET /api/cursos"

**Causa**: Servidor Express no está corriendo

**Solución**:
```powershell
# En otra terminal
cd api
node server.js
```

### IA tarda mucho

**Normal**: La primera llamada a OpenAI puede tardar 30-60 segundos

### Preguntas no son aleatorias

**Posible causa**: Estás usando el mismo navegador/documento

**Solución**: 
- Abre en ventana incógnita
- O usa documento diferente cada vez
- O borra LocalStorage:
  ```javascript
  localStorage.clear()
  ```

---

## 📊 Métricas de Éxito

Si completaste los 6 tests:

- ✅ **IA**: Funcional
- ✅ **Aleatorización**: Funcional
- ✅ **Retroalimentación**: Funcional
- ✅ **Sistema Completo**: Funcional

**Tiempo total de prueba**: 5 minutos

---

## 🚀 Siguiente Paso: Deploy

Si todo funciona en local, continúa con:

```
NETLIFY-DEPLOY.md
```

Para subir a producción en Netlify (gratis).

---

## 💡 Tips

1. **Guarda el curso de prueba**: Te sirve como template
2. **Exporta las preguntas**: Para reutilizar en otros cursos
3. **Varía la dificultad**: Prueba Fácil/Medio/Difícil para ver diferencias
4. **Contenido más largo**: Más contenido = mejores preguntas de IA

---

**¡Listo! El sistema funciona perfectamente. 🎉**

Siguiente: Deploy a Netlify → [NETLIFY-DEPLOY.md](NETLIFY-DEPLOY.md)
