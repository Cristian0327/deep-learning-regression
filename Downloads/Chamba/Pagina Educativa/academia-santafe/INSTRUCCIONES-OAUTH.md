# 🔐 Configuración de OAuth para Academia Santafé

## ✅ Opción 1: Google OAuth (Gmail)

### Paso 1: Ir a Google Cloud Console
1. Abre https://console.cloud.google.com
2. Inicia sesión con tu cuenta de Google

### Paso 2: Crear un Proyecto
1. Haz clic en el selector de proyectos (arriba a la izquierda)
2. Haz clic en "Nuevo Proyecto"
3. Nombre: `Academia Santafe`
4. Haz clic en "Crear"

### Paso 3: Configurar Pantalla de Consentimiento
1. En el menú lateral, ve a: **APIs y servicios > Pantalla de consentimiento de OAuth**
2. Selecciona **Externo** (para permitir cualquier cuenta de Gmail)
3. Haz clic en "Crear"
4. Completa el formulario:
   - **Nombre de la aplicación**: Academia Santafé
   - **Correo de asistencia**: tu-correo@gmail.com
   - **Logo**: (opcional, puedes subir el logo de la empresa)
   - **Dominio de la aplicación**: http://localhost:3000
   - **Correo de contacto del desarrollador**: tu-correo@gmail.com
5. Haz clic en "Guardar y continuar"
6. En "Scopes", haz clic en "Añadir o quitar scopes"
7. Selecciona:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
8. Haz clic en "Actualizar" y luego "Guardar y continuar"
9. En "Usuarios de prueba", añade los correos que podrán probar (opcional)
10. Haz clic en "Guardar y continuar"

### Paso 4: Crear Credenciales
1. En el menú lateral, ve a: **APIs y servicios > Credenciales**
2. Haz clic en "**+ CREAR CREDENCIALES**"
3. Selecciona "**ID de cliente de OAuth 2.0**"
4. Tipo de aplicación: **Aplicación web**
5. Nombre: `Academia Santafe Web`
6. **URIs de redirección autorizados**, añade:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Haz clic en "Crear"
8. **¡IMPORTANTE!** Aparecerá una ventana con:
   - **ID de cliente**: Copia este valor
   - **Secreto de cliente**: Copia este valor

### Paso 5: Configurar .env.local
1. Abre el archivo `.env.local` en tu proyecto
2. Reemplaza las líneas de Google:
   ```env
   GOOGLE_CLIENT_ID=pega-aqui-tu-client-id
   GOOGLE_CLIENT_SECRET=pega-aqui-tu-client-secret
   ```

---

## ✅ Opción 2: Microsoft OAuth (Outlook)

### Paso 1: Ir a Azure Portal
1. Abre https://portal.azure.com
2. Inicia sesión con tu cuenta de Microsoft

### Paso 2: Registrar Aplicación
1. En el buscador superior, escribe "**Azure Active Directory**" o "**Microsoft Entra ID**"
2. En el menú lateral, haz clic en "**Registros de aplicaciones**"
3. Haz clic en "**+ Nuevo registro**"
4. Completa el formulario:
   - **Nombre**: Academia Santafé
   - **Tipos de cuenta compatibles**: Selecciona "**Cuentas en cualquier directorio organizativo y cuentas Microsoft personales**"
   - **URI de redireccionamiento**: 
     - Tipo: **Web**
     - URI: `http://localhost:3000/api/auth/callback/azure-ad`
5. Haz clic en "**Registrar**"

### Paso 3: Copiar IDs
1. En la página "Información general" de tu aplicación, copia:
   - **Id. de aplicación (cliente)**: Este es tu `MICROSOFT_CLIENT_ID`
   - **Id. de directorio (inquilino)**: Este es tu `MICROSOFT_TENANT_ID` (o usa `common`)

### Paso 4: Crear Secreto de Cliente
1. En el menú lateral, haz clic en "**Certificados y secretos**"
2. Haz clic en "**+ Nuevo secreto de cliente**"
3. Descripción: `Academia Santafe Secret`
4. Expiración: **24 meses** (o el tiempo que prefieras)
5. Haz clic en "**Agregar**"
6. **¡IMPORTANTE!** Copia el **Valor** del secreto INMEDIATAMENTE (solo se muestra una vez)

### Paso 5: Configurar Permisos
1. En el menú lateral, haz clic en "**Permisos de API**"
2. Haz clic en "**+ Agregar un permiso**"
3. Selecciona "**Microsoft Graph**"
4. Selecciona "**Permisos delegados**"
5. Busca y selecciona:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
6. Haz clic en "**Agregar permisos**"
7. (Opcional) Haz clic en "**Conceder consentimiento de administrador**" si tienes permisos

### Paso 6: Configurar .env.local
1. Abre el archivo `.env.local` en tu proyecto
2. Reemplaza las líneas de Microsoft:
   ```env
   MICROSOFT_CLIENT_ID=pega-aqui-tu-application-id
   MICROSOFT_CLIENT_SECRET=pega-aqui-tu-secret-value
   MICROSOFT_TENANT_ID=common
   ```

---

## 🚀 Reiniciar el Servidor

Después de configurar las credenciales:

```bash
# Detener el servidor actual (Ctrl+C en la terminal)
# Luego ejecutar:
npm run dev
```

---

## ✅ Probar el Login

1. Abre http://localhost:3000
2. Haz clic en "Iniciar Sesión"
3. Verás los botones de Google y Microsoft
4. Haz clic en el que configuraste
5. Inicia sesión con tu cuenta
6. Serás redirigido al dashboard

---

## 🔒 Seguridad en Producción

Cuando subas a producción (ejemplo: https://academia.ladrillera-santafe.com):

### Para Google:
1. Ve a Google Cloud Console > Credenciales
2. Edita tu OAuth Client ID
3. Añade en "URIs de redirección autorizados":
   ```
   https://academia.ladrillera-santafe.com/api/auth/callback/google
   ```

### Para Microsoft:
1. Ve a Azure Portal > Registros de aplicaciones
2. Ve a "Autenticación"
3. Añade en "URIs de redireccionamiento":
   ```
   https://academia.ladrillera-santafe.com/api/auth/callback/azure-ad
   ```

### Actualizar .env en producción:
```env
NEXTAUTH_URL=https://academia.ladrillera-santafe.com
```

---

## ❓ Solución de Problemas

### Error: "invalid_client"
- Verifica que copiaste correctamente el Client ID y Secret
- Asegúrate de que no haya espacios extras al pegar
- Reinicia el servidor después de cambiar .env.local

### Error: "redirect_uri_mismatch"
- Verifica que la URL de callback sea exactamente:
  - Google: `http://localhost:3000/api/auth/callback/google`
  - Microsoft: `http://localhost:3000/api/auth/callback/azure-ad`

### El botón no hace nada
- Abre la consola del navegador (F12) para ver errores
- Verifica que el archivo .env.local tenga las credenciales
- Reinicia el servidor

---

## 📧 Soporte

Si tienes problemas, revisa:
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- Microsoft OAuth: https://learn.microsoft.com/en-us/azure/active-directory/develop/

---

**¡Listo!** Ahora tu plataforma tiene autenticación profesional con Google y Microsoft 🎉
