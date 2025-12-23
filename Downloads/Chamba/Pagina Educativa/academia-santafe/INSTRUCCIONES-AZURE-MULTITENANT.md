# 🔧 Configurar Azure AD para Aceptar Cualquier Cuenta Microsoft

## ❌ Problema

Actualmente tu aplicación solo acepta cuentas de **@santafe.com.co** porque está configurada en modo "Single tenant" en Azure AD.

Error que aparece:
```
AADSTS50020: User account 'test.cristian.gonz2@unimilitar.edu.co' from identity provider 
'https://sts.windows.net/...' does not exist in tenant 'Ladrillera Santafe S.A'
```

---

## ✅ Solución: Cambiar a Multitenant

### **Paso 1: Ir al Portal de Azure**

1. Ve a: https://portal.azure.com
2. Inicia sesión con tu cuenta de administrador de Santafé
3. Busca "Azure Active Directory" en el buscador superior
4. Click en "Azure Active Directory"

---

### **Paso 2: Encontrar tu Aplicación**

1. En el menú izquierdo, click en **"App registrations"** (Registros de aplicaciones)
2. Busca tu aplicación: **"Academia Santafé Local"** o el nombre que le pusiste
3. Click en el nombre de la aplicación

---

### **Paso 3: Cambiar a Multitenant**

1. En el menú izquierdo, click en **"Authentication"** (Autenticación)
2. Busca la sección **"Supported account types"** (Tipos de cuenta compatibles)
3. Deberías ver 4 opciones:
   - ❌ **Single tenant** - Solo cuentas de tu organización (actual)
   - ✅ **Multitenant** - Cuentas de cualquier Azure AD
   - ✅ **Multitenant + Personal** - Cuentas de Azure AD + cuentas personales de Microsoft
   - ⚠️ **Personal only** - Solo cuentas personales

4. **Selecciona:** 
   - **"Accounts in any organizational directory (Any Azure AD directory - Multitenant)"**
   
   O si también quieres aceptar cuentas personales de Microsoft (hotmail.com, outlook.com, etc.):
   - **"Accounts in any organizational directory and personal Microsoft accounts"**

5. Click en **"Save"** (Guardar) en la parte superior

---

### **Paso 4: Actualizar Redirect URIs (Si es necesario)**

1. En la misma página de "Authentication"
2. Verifica que tengas estas URIs configuradas:
   ```
   http://localhost:3000/api/auth/callback/azure-ad
   https://tu-dominio.com/api/auth/callback/azure-ad (para producción)
   ```

3. Si no están, agrégalas:
   - Click en **"Add URI"**
   - Pega la URI
   - Click en **"Save"**

---

### **Paso 5: Verificar .env.local**

Ya lo cambié en tu archivo `.env.local`:

```env
MICROSOFT_TENANT_ID=common  # ✅ Esto acepta cualquier cuenta
```

**Valores posibles:**
- `common` - Acepta cuentas de trabajo/escuela de cualquier organización + cuentas personales
- `organizations` - Solo cuentas de trabajo/escuela de cualquier organización
- `consumers` - Solo cuentas personales de Microsoft
- `8f879db1-...` - Solo tu organización (Santafé)

---

### **Paso 6: Reiniciar Servidor**

```bash
# Detener servidor (Ctrl+C)
# Iniciar de nuevo
npm run dev
```

---

## 🧪 Probar que Funciona

### **Test 1: Cuenta Personal de Microsoft**
1. Ve a http://localhost:3000
2. Click en "Iniciar Sesión"
3. Selecciona "Continuar con Microsoft"
4. Usa una cuenta personal: `ejemplo@hotmail.com` o `ejemplo@outlook.com`
5. ✅ Debe funcionar sin error

### **Test 2: Cuenta de Otra Organización**
1. Usa una cuenta de trabajo/escuela de otra organización
2. Por ejemplo: `test.cristian.gonz2@unimilitar.edu.co`
3. ✅ Debe funcionar sin error

### **Test 3: Cuenta de Santafé**
1. Usa tu cuenta de Santafé: `aprendizcomunicaciones@santafe.com.co`
2. ✅ Debe seguir funcionando
3. ✅ Debe tener rol de admin (por ADMIN_EMAILS)

---

## 📋 Resumen de Cambios

### **En Azure Portal:**
- ✅ Cambiar de "Single tenant" a "Multitenant"
- ✅ Verificar Redirect URIs

### **En .env.local:**
- ✅ Cambiar `MICROSOFT_TENANT_ID` de `8f879db1-35f9-4f0c-9f59-fa889f431372` a `common`

### **En middleware.ts:**
- ✅ Remover `/AdminCursos` de las rutas protegidas
- ✅ Ahora `/AdminCursos` es público - cualquiera puede agregar cursos

---

## 🔒 Seguridad

### **¿Es seguro hacer AdminCursos público?**

⚠️ **Consideraciones:**

**Pros:**
- ✅ Fácil de usar - cualquiera con el link puede agregar cursos
- ✅ No requiere autenticación
- ✅ Ideal para colaboradores externos

**Contras:**
- ⚠️ Cualquiera con el link puede agregar/modificar cursos
- ⚠️ No hay control de quién hace qué cambios
- ⚠️ Riesgo de spam o contenido inapropiado

### **Recomendaciones:**

**Opción 1: URL Secreta (Actual)**
- Mantén la URL secreta: `https://academia-santafe.com/AdminCursos?key=secreto123`
- Solo compartes el link con personas de confianza

**Opción 2: Proteger con Clave Simple**
Agrega un campo de "clave de acceso" en el formulario:
```typescript
const CLAVE_ADMIN = "santafe2025";

if (claveIngresada !== CLAVE_ADMIN) {
  alert("Clave incorrecta");
  return;
}
```

**Opción 3: Volver a Proteger (Recomendado para producción)**
En el futuro, cuando estés en producción:
1. Vuelve a agregar `/AdminCursos` al middleware
2. Crea cuentas para instructores/colaboradores
3. Dales rol de "instructor" para que puedan agregar cursos

---

## 🚀 Resultado Final

Después de estos cambios:

✅ **Login con Microsoft:**
- Funciona con cuentas de Santafé (@santafe.com.co)
- Funciona con cuentas de otras organizaciones (@unimilitar.edu.co, etc.)
- Funciona con cuentas personales (@hotmail.com, @outlook.com)

✅ **Login con Google:**
- Sigue funcionando igual (ya acepta cualquier cuenta de Google)

✅ **AdminCursos:**
- Ahora es público
- No requiere login
- Cualquiera con el link puede agregar cursos
- Se recomienda mantener el link privado

✅ **Otras Rutas:**
- `/dashboard` - Requiere login
- `/perfil` - Requiere login
- `/curso/[id]` - Requiere login
- `/admin` - Requiere login + rol de admin

---

## 📝 Notas Adicionales

### **Si prefieres que AdminCursos siga protegido pero acepte más usuarios:**

En lugar de hacer AdminCursos público, puedes:

1. Mantener la protección de login
2. Permitir que cualquiera se registre
3. Dar permisos de "instructor" a usuarios específicos

En ese caso, modifica `middleware.ts`:
```typescript
// Permitir que usuarios autenticados accedan a AdminCursos
const isAdminRoute = ['/admin'].some(route => 
  req.nextUrl.pathname.startsWith(route)
);

// Solo /admin requiere ser admin, /AdminCursos solo requiere login
```

Y en el matcher:
```typescript
matcher: [
  '/AdminCursos/:path*',  // Requiere login pero no admin
  '/admin/:path*',        // Requiere login + admin
  '/dashboard/:path*',
  '/perfil/:path*',
]
```

---

## ✅ Estado Actual

**Configuración actual aplicada:**

1. ✅ `MICROSOFT_TENANT_ID=common` - Acepta cualquier cuenta Microsoft
2. ✅ `/AdminCursos` removido del middleware - Es público
3. ✅ Google OAuth - Acepta cualquier cuenta Google

**Pendiente en Azure Portal:**
- ⏳ Cambiar tipo de cuenta a "Multitenant" en el portal de Azure

Una vez hagas el cambio en Azure Portal, todo funcionará correctamente! 🎉
