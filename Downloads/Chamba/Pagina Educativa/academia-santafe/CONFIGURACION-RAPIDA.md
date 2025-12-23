# 🚀 Configuración Rápida de OAuth

## ⚡ Guía Express (15 minutos)

### 🔵 GOOGLE (Gmail)

1. **Ir a:** https://console.cloud.google.com
2. **Crear Proyecto Nuevo**
3. **APIs y servicios > Pantalla de consentimiento de OAuth**
   - Tipo: **Externo**
   - Nombre: `Academia Santafé`
   - Correos: tu correo
4. **APIs y servicios > Credenciales > + CREAR CREDENCIALES > ID de cliente OAuth 2.0**
   - Tipo: **Aplicación web**
   - URI de redirección: `http://localhost:3000/api/auth/callback/google`
5. **Copiar** Client ID y Client Secret

### 🟦 MICROSOFT (Outlook)

1. **Ir a:** https://portal.azure.com
2. **Buscar:** "Azure Active Directory" o "Microsoft Entra ID"
3. **Registros de aplicaciones > + Nuevo registro**
   - Nombre: `Academia Santafé`
   - Cuentas: **Cualquier directorio y cuentas personales**
   - URI: `http://localhost:3000/api/auth/callback/azure-ad`
4. **Certificados y secretos > + Nuevo secreto de cliente**
   - Copiar el valor INMEDIATAMENTE
5. **Copiar** Application ID de la página "Información general"

### 📝 PEGAR EN .env.local

Abre `.env.local` y reemplaza:

```env
GOOGLE_CLIENT_ID=pega-aqui-tu-google-client-id
GOOGLE_CLIENT_SECRET=pega-aqui-tu-google-secret

MICROSOFT_CLIENT_ID=pega-aqui-tu-microsoft-app-id
MICROSOFT_CLIENT_SECRET=pega-aqui-tu-microsoft-secret
```

### 🔄 REINICIAR

```bash
# Presiona Ctrl+C y luego:
npm run dev
```

### ✅ LISTO

- Abre http://localhost:3000
- Clic en "Iniciar Sesión"
- Verás los botones de Google y Microsoft funcionando

---

## 📖 Guía Detallada

Para instrucciones paso a paso con capturas, consulta: **INSTRUCCIONES-OAUTH.md**

---

## ❓ Problemas Comunes

**❌ "invalid_client"** → Revisa que copiaste bien las credenciales

**❌ "redirect_uri_mismatch"** → Verifica las URIs de callback exactas

**❌ Botón no funciona** → Abre F12 y revisa la consola del navegador

---

## 🔐 URLs de Callback

- **Google:** `http://localhost:3000/api/auth/callback/google`
- **Microsoft:** `http://localhost:3000/api/auth/callback/azure-ad`

---

**💡 Tip:** Solo necesitas configurar UNO de los dos (Google o Microsoft) para empezar.
