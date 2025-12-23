# 🎯 Sistema de Certificados con Plantilla PDF

## ✅ Características

### 1. **Aprobación al 100%**
- Se requiere **100% de respuestas correctas** para aprobar
- Solo con 100% se desbloquea el certificado

### 2. **Plantilla PDF Personalizable**
Ahora puedes usar **tu propio PDF** como plantilla de certificado.

#### Cómo Funciona:
1. **Diseña tu certificado** en cualquier programa (Word, Canva, Photoshop, etc.)
2. **Exporta como PDF** (A4 horizontal recomendado)
3. **Sube el PDF** a un servidor y obtén la URL directa
4. **El sistema automáticamente**:
   - Carga tu PDF como base
   - Agrega el nombre del estudiante sobre el PDF
   - Agrega el nombre del curso
   - Agrega la fecha y el instructor
   - Genera el certificado final

---

## 📤 Cómo Subir tu PDF de Plantilla

### Opción 1: Google Drive (Recomendado)
1. Sube tu PDF a Google Drive
2. Click derecho → "Obtener enlace"
3. Cambia a "Cualquiera con el enlace puede ver"
4. Copia el enlace
5. Modifica la URL de este formato:
   ```
   https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing
   ```
   A este formato:
   ```
   https://drive.google.com/uc?export=download&id=1ABC123xyz
   ```
6. Pega la URL modificada en el campo "URL de Plantilla del Certificado"

### Opción 2: Dropbox
1. Sube tu PDF a Dropbox
2. Click en "Compartir"
3. Crea un enlace
4. Cambia el final de `?dl=0` a `?dl=1` para obtener la descarga directa
5. Pega la URL en el formulario

### Opción 3: Tu Propio Servidor
1. Sube el PDF a tu servidor web
2. Asegúrate de que sea accesible públicamente
3. Usa la URL directa (ej: `https://tudominio.com/certificados/plantilla.pdf`)

---

## 🎨 Diseño de la Plantilla PDF

### Recomendaciones:

**Tamaño**: A4 horizontal (297mm x 210mm)

**Espacios a dejar libre** (el sistema escribirá aquí):
- **Centro superior (55% altura)**: Nombre del estudiante (28pt, negrita)
- **Centro medio (40% altura)**: Nombre del curso (18pt, negrita, azul)
- **Centro inferior (30% altura)**: Fecha (12pt, normal)
- **Centro inferior (25% altura)**: Instructor (12pt, normal)

**Elementos que puedes incluir**:
- Logos de la empresa
- Bordes decorativos
- Firmas escaneadas (en la parte baja)
- Sellos oficiales
- Colores corporativos
- Texto fijo (ej: "Certificado de Finalización")

**Ejemplo de diseño**:
```
┌─────────────────────────────────────────────┐
│  [LOGO]    CERTIFICADO DE FINALIZACIÓN      │
│                                             │
│              [Espacio para nombre]          │ ← 55% altura
│                                             │
│         Por completar el curso              │
│          [Espacio para curso]               │ ← 40% altura
│                                             │
│         [Espacio para fecha]                │ ← 30% altura
│       [Espacio para instructor]             │ ← 25% altura
│                                             │
│  [Firma]                          [Sello]   │
└─────────────────────────────────────────────┘
```

---

## 🔧 Uso en AdminCursos

1. Ve a `/AdminCursos`
2. Al crear/editar un curso, encontrarás el campo:
   **"URL de Plantilla del Certificado (PDF)"**
3. Pega la URL directa de tu PDF
4. Guarda el curso
5. ¡Listo! Los estudiantes recibirán tu certificado personalizado al aprobar

---

## ⚙️ Posiciones del Texto (Ajustables)

Si necesitas ajustar dónde aparece el texto en tu PDF, edita el archivo:
`lib/generarCertificado.ts`

En la función `generarCertificadoDesdePDF`, busca estas líneas:

```typescript
y: height * 0.55,  // Nombre (55% desde abajo)
y: height * 0.40,  // Curso (40% desde abajo)
y: height * 0.30,  // Fecha (30% desde abajo)
y: height * 0.25,  // Instructor (25% desde abajo)
```

Cambia los valores `0.55`, `0.40`, etc. según tu diseño.

---

## 📋 Ejemplo de Uso

**Plantilla PDF**: Diseño con logo de la empresa, bordes dorados, y firma del director.

**Sistema agrega**:
- Nombre: "Juan Pérez García"
- Curso: "Seguridad Industrial Nivel 1"
- Fecha: "29 de noviembre de 2025"
- Instructor: "Ing. María González"

**Resultado**: PDF final con tu diseño + datos del estudiante listos para imprimir.

---

## 🆚 PDF vs Diseño por Defecto

| Característica | Con Plantilla PDF | Sin Plantilla |
|---------------|-------------------|---------------|
| Diseño | Tu PDF personalizado | Diseño azul estándar |
| Logos | Tus logos corporativos | Logo "Academia Santa Fe" |
| Firmas | Firmas escaneadas reales | Línea de firma |
| Sellos | Sellos oficiales | Círculo decorativo |
| Control total | ✅ Sí | ❌ No |

---

## 🚀 Servidor Reiniciado

✅ El servidor está corriendo con soporte completo para PDFs
✅ Instalado `pdf-lib` para manipular PDFs dinámicamente
✅ Sistema listo para usar plantillas PDF personalizadas

**URL**: http://localhost:3000
**AdminCursos**: http://localhost:3000/AdminCursos
