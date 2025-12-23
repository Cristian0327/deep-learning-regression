# Academia Santafé - Portable Edition

## 🚀 Instalación y Deploy

### Desarrollo Local

```bash
# 1. Instalar dependencias del frontend
npm install

# 2. Instalar dependencias de la API
cd api
npm install
cd ..

# 3. Iniciar API (Terminal 1)
cd api
npm start

# 4. Iniciar Frontend (Terminal 2)
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- API: http://localhost:3001

---

## 📦 Deploy en Diferentes Hostings

### **1. NETLIFY (Actual)**

```bash
# 1. Crear netlify.toml (ya incluido)
# 2. Deploy:
netlify deploy --prod

# O conectar repo GitHub en Netlify Dashboard
```

**Variables de entorno:**
```
NEXT_PUBLIC_API_URL=https://tu-sitio.netlify.app
```

---

### **2. VERCEL**

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod
```

**Variables de entorno en Vercel Dashboard:**
```
NEXT_PUBLIC_API_URL=https://tu-sitio.vercel.app
```

---

### **3. HOSTINGER BUSINESS/VPS**

```bash
# 1. Conectar por SSH
ssh usuario@tu-servidor.com

# 2. Subir proyecto (SFTP o Git)
git clone https://github.com/tu-usuario/academia-santafe.git

# 3. Instalar dependencias
cd academia-santafe
npm install
cd api && npm install && cd ..

# 4. Build producción
npm run build

# 5. Iniciar API
cd api
pm2 start server.js --name academia-api

# 6. Iniciar Frontend
cd ..
pm2 start npm --name academia-frontend -- start

# 7. Configurar dominio en Hostinger Panel
# Apuntar DNS a IP del servidor
```

---

### **4. RAILWAY**

```bash
# 1. Instalar Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up
```

---

### **5. RENDER**

1. Conectar repo GitHub
2. Crear dos servicios:
   - Web Service (Frontend): `npm run build && npm start`
   - Web Service (API): `cd api && npm start`

---

## 🔧 Configuración por Entorno

### Archivo `.env.local` (Frontend)

```env
# Desarrollo
NEXT_PUBLIC_API_URL=http://localhost:3001

# Producción (cambiar según hosting)
# NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
```

---

## 💾 Backup y Migración

### Hacer Backup

```bash
# Copiar carpeta de cursos
cp -r api/data/cursos ./backup-cursos-$(date +%Y%m%d)

# O comprimir
zip -r backup-cursos.zip api/data/cursos
```

### Restaurar Backup

```bash
# Descomprimir
unzip backup-cursos.zip

# Copiar a nuevo servidor
cp -r cursos /ruta/api/data/
```

### Migrar a Nuevo Hosting

1. Copiar TODO el proyecto al nuevo servidor
2. Instalar dependencias: `npm install` y `cd api && npm install`
3. Configurar variable `NEXT_PUBLIC_API_URL`
4. Build: `npm run build`
5. Iniciar: API primero, luego Frontend

---

## 📝 Estructura del Proyecto

```
academia-santafe/
├── app/                  # Frontend Next.js
├── api/                  # Backend Express
│   ├── server.js         # Servidor API
│   ├── package.json
│   └── data/
│       └── cursos/       # ← AQUÍ SE GUARDAN LOS CURSOS (JSONs)
├── lib/
│   ├── api-client.ts     # Cliente HTTP
│   └── api-config.ts     # Configuración
├── .env.local            # Variables de entorno
└── package.json
```

---

## ⚙️ Variables de Entorno

### Producción

Configurar en el hosting:

```env
NEXT_PUBLIC_API_URL=https://tu-dominio.com
PORT=3001  # Puerto para la API (opcional)
NODE_ENV=production
```

---

## 🆘 Troubleshooting

### Error "Cannot connect to API"

Verificar:
1. API está corriendo: `curl http://localhost:3001/api/health`
2. Variable `NEXT_PUBLIC_API_URL` está configurada
3. CORS está habilitado (ya incluido)

### Cursos no se guardan

Verificar:
1. Carpeta `api/data/cursos` existe y tiene permisos
2. API tiene permisos de escritura

---

## 📞 Soporte

Si hay problemas al migrar:
1. Revisar logs del servidor
2. Verificar variables de entorno
3. Comprobar que Node.js v18+ esté instalado

---

## 🔐 Seguridad

Para producción, considerar:
- Agregar autenticación a endpoints de API
- Rate limiting
- HTTPS obligatorio
- Backup automático diario
