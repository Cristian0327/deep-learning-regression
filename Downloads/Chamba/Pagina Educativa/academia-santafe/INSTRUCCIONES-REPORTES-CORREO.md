# 📧 Sistema de Reportes Automáticos por Correo

## ✅ Características Implementadas

1. **Campos de Cargo y Empresa**: Los estudiantes ingresan cargo y empresa al inscribirse
2. **Panel de Administración**: Acceso exclusivo para revisar inscripciones y progreso
3. **Envío Automático de Reportes**: Sistema de correo electrónico para reportes diarios
4. **Porcentaje Mínimo Configurable**: Define el % necesario para aprobar cada evaluación
5. **Email por Curso**: Cada curso tiene un correo configurado para recibir reportes automáticamente

---

## 🎯 Configuración del Correo por Curso

### Al crear o editar un curso:

1. Ve a **AdminCursos**
2. Al crear/editar un curso, encontrarás el campo:
   ```
   📧 Correo para Reportes Diarios
   ```
3. Ingresa el correo del responsable (ej: `supervisor.operaciones@empresa.com`)
4. Guarda el curso

**Ahora cuando selecciones ese curso en el panel de reportes, el correo se cargará automáticamente.**

---

## 🔧 Configuración del Sistema de Correo

### 1. Variables de Entorno

Edita el archivo `.env.local` y configura las credenciales SMTP:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
```

### 2. Opciones de Configuración SMTP

#### **Opción A: Gmail (Recomendado para desarrollo)**

1. Ve a [Cuenta de Google](https://myaccount.google.com/)
2. Seguridad → Verificación en 2 pasos (actívala si no está activada)
3. Busca "Contraseñas de aplicaciones"
4. Genera una contraseña para "Correo" → "Otro: Academia Santafé"
5. Copia la contraseña de 16 caracteres

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tuCorreo@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

#### **Opción B: Outlook/Hotmail**

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tuCorreo@outlook.com
SMTP_PASS=tu-contraseña
```

#### **Opción C: Mailtrap (Para pruebas - NO ENVÍA correos reales)**

1. Regístrate en [mailtrap.io](https://mailtrap.io)
2. Ve a "Email Testing" → "Inboxes"
3. Copia las credenciales SMTP

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu-usuario-mailtrap
SMTP_PASS=tu-contraseña-mailtrap
```

---

## 📊 Cómo Funciona el Sistema

### Flujo de Trabajo

1. **La empresa programa un curso** para un grupo de empleados en una fecha específica
2. **Los empleados se inscriben** ingresando: nombre, documento, cargo, empresa
3. **Durante el día** los empleados completan el curso y las evaluaciones
4. **Al finalizar el día** el administrador:
   - Accede a `/admin/reportes`
   - Selecciona el curso
   - Selecciona la fecha (por defecto hoy)
   - Ingresa el correo destino
   - Click en "Enviar Reporte por Correo"

### El Reporte Incluye

- **Estadísticas generales**: Total participantes, aprobados, reprobados, en progreso
- **Tabla detallada** con:
  - Nombre completo
  - Documento
  - Cargo
  - Empresa
  - Progreso (%)
  - Estado (✓ APROBADO, ✗ REPROBADO, ⏳ En Progreso)

---

## 🎯 Uso del Sistema

### Acceso al Panel de Reportes

**URL**: `http://localhost:3000/admin/reportes`

O desde AdminCursos → Click en "Ver Reportes"

### Enviar Reporte Manual

1. **Selecciona el curso** del dropdown (ahora muestra el nombre completo)
2. **El correo se carga automáticamente** si está configurado en el curso
3. **Selecciona la fecha** (por defecto: hoy)
4. **Verifica o modifica el correo** si es necesario
5. Click en **"Enviar Reporte por Correo"**

El sistema:
- ✅ Filtra solo las inscripciones de ese curso en esa fecha
- ✅ Genera un reporte HTML profesional con el nombre del curso
- ✅ Envía el correo automáticamente al email configurado
- ✅ Muestra confirmación con número de participantes incluidos

**Indicadores visuales:**
- Si el curso tiene email configurado: `✅ Email configurado en el curso`
- Si no tiene email: `Ingresa manualmente el correo`

### Exportar a CSV (Opcional)

Si necesitas los datos en Excel:
1. Selecciona el curso (o "Todos")
2. Click en "Exportar a CSV"
3. Abre el archivo en Excel

---

## 🔄 Automatización (Futuro)

Para enviar reportes automáticamente al final de cada día, puedes:

### Opción 1: Tarea Programada (Windows)

Crear un script que llame al endpoint a las 11:59 PM:

```powershell
# reporte-diario.ps1
$body = @{
    cursoId = "ID-DEL-CURSO"
    cursoTitulo = "Nombre del Curso"
    fechaInicio = (Get-Date -Format "yyyy-MM-dd")
    emailDestino = "admin@empresa.com"
    participantes = @() # Se llena automáticamente
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/reportes-diarios" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

Programa en el Programador de Tareas de Windows:
- Hora: 23:59
- Frecuencia: Diaria
- Acción: Ejecutar `powershell.exe -File "ruta\reporte-diario.ps1"`

### Opción 2: Cron Job (Linux/Mac)

```bash
# Editar crontab
crontab -e

# Agregar línea (ejecuta a las 23:59 diariamente)
59 23 * * * curl -X POST http://localhost:3000/api/reportes-diarios \
  -H "Content-Type: application/json" \
  -d '{"cursoId":"ID","fechaInicio":"'$(date +\%Y-\%m-\%d)'","emailDestino":"admin@empresa.com"}'
```

### Opción 3: Netlify Functions (Producción)

Si despliegas en Netlify, puedes usar Netlify Scheduled Functions para ejecutar el reporte automáticamente.

---

## 🛡️ Seguridad

**⚠️ IMPORTANTE**: El panel `/admin/reportes` debe estar protegido.

Opciones de protección:

1. **Solo accesible desde red interna** (configurar en hosting)
2. **Agregar autenticación** (NextAuth ya está configurado)
3. **Validar email del administrador** en el código

### Proteger con NextAuth (Recomendado)

Edita `app/admin/reportes/page.tsx`:

```typescript
import { useSession } from 'next-auth/react';

export default function ReportesPage() {
  const { data: session } = useSession();
  
  if (!session || session.user?.email !== 'admin@santafe.com.co') {
    return <div>Acceso denegado</div>;
  }
  
  // ... resto del código
}
```

---

## 📝 Ejemplo de Reporte Enviado

El correo incluye:

```
┌─────────────────────────────────────────────┐
│ 📊 Reporte Diario de Curso                  │
│ Academia Santafé                             │
└─────────────────────────────────────────────┘

Curso: Seguridad Industrial Básica
Período: 23 de diciembre de 2025
Total de Participantes: 15

┌─────────────┬───────────┬───────────┐
│  Aprobados  │ Reprobados│ En Progreso│
│      12     │     2     │      1     │
└─────────────┴───────────┴───────────┘

╔═══════════════════╦══════════╦═══════════╗
║ Nombre           ║ Documento║ Estado    ║
╠═══════════════════╬══════════╬═══════════╣
║ Juan Pérez       ║ 12345678 ║ ✓ APROBADO║
║ María García     ║ 87654321 ║ ✓ APROBADO║
║ ...              ║ ...      ║ ...       ║
╚═══════════════════╩══════════╩═══════════╝
```

---

## 🚀 Próximos Pasos

1. **Configurar SMTP** en `.env.local`
2. **Reiniciar el servidor** (`npm run dev`)
3. **Probar envío manual** desde `/admin/reportes`
4. **Configurar automatización** (opcional)
5. **Proteger el panel** con autenticación

---

## ❓ Preguntas Frecuentes

**Q: ¿El reporte se envía solo?**  
A: No, por ahora es manual. Debes ir al panel y hacer click en "Enviar". Para automatizar, sigue las instrucciones de Automatización.

**Q: ¿Puedo enviar reportes de días anteriores?**  
A: Sí, solo cambia la fecha en el selector.

**Q: ¿Se pueden enviar a múltiples correos?**  
A: Actualmente solo a uno. Para múltiples, sepáralos con coma en el código:

```typescript
to: emailDestino.split(','),
```

**Q: ¿Funciona en producción (Netlify)?**  
A: Sí, pero necesitas configurar las variables de entorno en Netlify Settings → Environment Variables.

---

## 📞 Soporte

Para dudas sobre configuración SMTP, consulta:
- Gmail: https://support.google.com/accounts/answer/185833
- Outlook: https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings
- Nodemailer: https://nodemailer.com/smtp/
