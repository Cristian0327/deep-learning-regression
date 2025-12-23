# 📸 Cambios en Subida de Archivos - Certificados e Imágenes

## ✅ Cambios Implementados

### 1. **Campo de Imagen del Curso**
**ANTES:**
- Campo de texto para ingresar URL de imagen
- Requería alojar la imagen en un servidor externo

**AHORA:**
- ✅ **Upload directo de archivos de imagen**
- ✅ Formatos soportados: JPEG, JPG, PNG, GIF, WEBP
- ✅ Tamaño máximo: 5MB
- ✅ Vista previa automática de la imagen
- ✅ Almacenamiento en base64 en Supabase
- ✅ Botón para eliminar y cambiar la imagen

### 2. **Campo de Plantilla de Certificado**
**ANTES:**
- Solo aceptaba archivos PDF
- Campo de texto con URL

**AHORA:**
- ✅ **Upload directo de PDF o imágenes**
- ✅ Formatos soportados: 
  - **PDF** (application/pdf)
  - **JPEG, JPG** (image/jpeg, image/jpg)
  - **PNG** (image/png)
  - **GIF** (image/gif)
  - **WEBP** (image/webp)
- ✅ Tamaño máximo: 5MB
- ✅ Conversión automática de imágenes a PDF
- ✅ Texto dinámico sobre la plantilla (nombre, curso, fecha, instructor)

---

## 🎨 Interfaz de Usuario

### Upload de Imagen del Curso
```
┌─────────────────────────────────────────┐
│  📤 Click para subir imagen             │
│                                         │
│  Máximo 5MB • JPEG, JPG, PNG, GIF, WEBP│
└─────────────────────────────────────────┘
```

**Después de subir:**
```
┌─────────────────────────────────────────┐
│ ✅ mi_imagen.jpg                        │
│    245.67 KB                 [Eliminar] │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │      [Vista Previa Imagen]        │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Upload de Certificado
```
┌─────────────────────────────────────────┐
│  📤 Click para subir archivo            │
│                                         │
│  Máximo 5MB • PDF, JPEG, JPG, PNG...   │
└─────────────────────────────────────────┘
```

**Después de subir:**
```
┌─────────────────────────────────────────┐
│ ✅ certificado.png                      │
│    1.2 MB                    [Eliminar] │
└─────────────────────────────────────────┘
```

---

## 🔧 Cambios Técnicos

### Nuevos Estados Agregados
```typescript
const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
const [subiendoImagen, setSubiendoImagen] = useState(false);
const [archivoCertificado, setArchivoCertificado] = useState<File | null>(null);
const [subiendoCertificado, setSubiendoCertificado] = useState(false);
```

### Nuevas Funciones

#### 1. `handleImagenUpload()`
- Valida formato de imagen (JPEG, JPG, PNG, GIF, WEBP)
- Valida tamaño máximo (5MB)
- Convierte a base64 con FileReader
- Guarda en `formData.imagen`

#### 2. `handleCertificadoUpload()`
- Acepta PDF e imágenes
- Valida formato y tamaño
- Convierte a base64
- Guarda en `formData.certificadoTemplate`

#### 3. `eliminarImagen()` y `eliminarCertificado()`
- Limpian el archivo seleccionado
- Resetean el campo en formData

---

## 📦 Generación de Certificados

### Función Mejorada: `generarCertificado()`

**Lógica de decisión:**
```typescript
if (plantillaUrl) {
  const esPDF = plantillaUrl.startsWith('data:application/pdf') || 
                plantillaUrl.endsWith('.pdf');
  
  if (esPDF) {
    // Usar plantilla PDF
    generarCertificadoDesdePDF(...);
  } else {
    // Convertir imagen a PDF y agregar texto
    generarCertificadoDesdeImagen(...);
  }
}
```

### Nueva Función: `generarCertificadoDesdeImagen()`

**Proceso:**
1. Detecta tipo de imagen (JPEG o PNG)
2. Decodifica base64 a bytes
3. Crea nuevo PDF con pdf-lib
4. Embede la imagen como fondo (A4 landscape)
5. Agrega texto dinámico encima:
   - Nombre del estudiante (centro, 55% altura)
   - Nombre del curso (centro, 40% altura)
   - Fecha (centro, 30% altura)
   - Instructor (centro, 25% altura)
6. Genera y descarga el PDF final

**Posiciones de texto (ajustables):**
```typescript
// Nombre estudiante
y: height * 0.55  // 55% desde abajo

// Nombre curso
y: height * 0.40  // 40% desde abajo

// Fecha
y: height * 0.30  // 30% desde abajo

// Instructor
y: height * 0.25  // 25% desde abajo
```

---

## 🎯 Recomendaciones de Diseño

### Para Imágenes de Curso
- **Dimensiones recomendadas:** 1200x800px o similar (aspect ratio 3:2)
- **Formato preferido:** JPEG o WEBP (mejor compresión)
- **Contenido:** Logo del curso, tema visual representativo

### Para Plantillas de Certificado

#### Opción 1: Imagen (JPEG/PNG)
- **Dimensiones:** 1754 x 1240 px (A4 landscape a 300 DPI)
- **Orientación:** Horizontal (landscape)
- **Diseño:** 
  - Deja el **centro vacío** (40-60% del alto)
  - Coloca bordes, logos, decoraciones en los márgenes
  - Fondo con colores claros para mejor legibilidad del texto

#### Opción 2: PDF
- **Tamaño:** A4 horizontal (297mm x 210mm)
- **Software:** Canva, Photoshop, Illustrator
- **Diseño:** Igual que la imagen, espacio central libre

---

## 📊 Almacenamiento en Supabase

### Tabla: `cursos`
```sql
-- Campo para imagen del curso
imagen: TEXT  -- base64 string "data:image/jpeg;base64,/9j/4AAQ..."

-- Campo para certificado
certificadoTemplate: TEXT  -- base64 (PDF o imagen)
```

**Tamaño aproximado en base64:**
- 1MB imagen → ~1.37MB en base64 (aumento del 37%)
- 5MB límite → ~6.85MB en base64

**Ventajas:**
- ✅ No requiere servidor de archivos externo
- ✅ Backup automático con Supabase
- ✅ Portabilidad total de datos

**Desventajas:**
- ⚠️ Mayor tamaño en DB
- ⚠️ Límite de 5MB por archivo

---

## 🧪 Pruebas Recomendadas

### Checklist de Pruebas

#### Imagen del Curso
- [ ] Subir JPEG válido
- [ ] Subir PNG válido
- [ ] Subir archivo > 5MB (debe rechazar)
- [ ] Subir archivo no-imagen (debe rechazar)
- [ ] Vista previa se muestra correctamente
- [ ] Botón "Eliminar" funciona
- [ ] Imagen se guarda al crear curso
- [ ] Imagen se muestra en la página del curso

#### Certificado
- [ ] Subir PDF válido
- [ ] Subir JPEG válido como certificado
- [ ] Subir PNG válido como certificado
- [ ] Archivo > 5MB rechazado
- [ ] Formato inválido rechazado
- [ ] Completar curso y descargar certificado con PDF
- [ ] Completar curso y descargar certificado con imagen
- [ ] Texto aparece correctamente centrado
- [ ] Nombre, curso, fecha e instructor visibles

---

## 🐛 Solución de Problemas

### Error: "Por favor selecciona una imagen válida"
**Causa:** Formato no soportado
**Solución:** Usar JPEG, JPG, PNG, GIF o WEBP

### Error: "El archivo es demasiado grande"
**Causa:** Archivo > 5MB
**Solución:** 
- Comprimir imagen (TinyPNG, Squoosh)
- Reducir resolución
- Cambiar de PNG a JPEG

### Certificado sin texto visible
**Causa:** Imagen de fondo muy oscura o colores similares
**Solución:** 
- Usar fondo claro en la plantilla
- Ajustar el color del texto en `generarCertificado.ts`:
  ```typescript
  color: rgb(1, 1, 1),  // Blanco para fondos oscuros
  ```

### Vista previa no se muestra
**Causa:** Error al convertir a base64
**Solución:** 
- Verificar que el archivo sea válido
- Revisar consola del navegador
- Recargar la página

---

## 🚀 Próximos Pasos

1. **Ejecuta el servidor:**
   ```bash
   npm run dev
   ```

2. **Ve al Admin de Cursos:**
   - http://localhost:3000/AdminCursos

3. **Prueba subir:**
   - Una imagen para el curso
   - Una imagen o PDF para certificado

4. **Crea un curso completo** y verifica que:
   - La imagen se muestra en la lista de cursos
   - El certificado se genera correctamente al completar

---

## 📝 Notas Adicionales

- Los archivos antiguos con URLs siguen funcionando
- Compatible con datos existentes en Supabase
- Sin cambios en la base de datos requeridos
- Totalmente retrocompatible

---

¡Todo listo para usar! 🎉
