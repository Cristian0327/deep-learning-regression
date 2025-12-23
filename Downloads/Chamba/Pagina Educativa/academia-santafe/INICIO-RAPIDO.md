# ⚡ Inicio Rápido - 2 Comandos

## 🚀 Para Iniciar TODO el Sistema

### Terminal 1 (API Backend):
```powershell
cd "C:\Users\CRISTIAN\Downloads\Chamba\Pagina Educativa\academia-santafe\api"; npm start
```

### Terminal 2 (Frontend Next.js):
```powershell
cd "C:\Users\CRISTIAN\Downloads\Chamba\Pagina Educativa\academia-santafe"; npm run dev
```

### Abrir navegador:
- **Admin (crear cursos)**: http://localhost:3000/AdminCursos
- **Ver catálogo**: http://localhost:3000/cursos
- **Inicio**: http://localhost:3000

---

## 📋 Primera vez (Instalar dependencias):

### Instalar backend:
```powershell
cd "C:\Users\CRISTIAN\Downloads\Chamba\Pagina Educativa\academia-santafe\api"
npm install
```

### Instalar frontend:
```powershell
cd "C:\Users\CRISTIAN\Downloads\Chamba\Pagina Educativa\academia-santafe"
npm install
```

---

## 🛑 Detener todo:
En ambas terminales: **Ctrl + C**

---

## 🔍 Verificar estado:

### ¿API corriendo?
```powershell
curl http://localhost:3001/api/health
```

### ¿Frontend corriendo?
Abrir: http://localhost:3000

---

## 📂 Ubicación de los cursos:
```
C:\Users\CRISTIAN\Downloads\Chamba\Pagina Educativa\academia-santafe\api\data\cursos\
```

Cada curso = 1 archivo JSON con ID único.

---

## 💾 Backup Rápido:
```powershell
Copy-Item -Path "C:\Users\CRISTIAN\Downloads\Chamba\Pagina Educativa\academia-santafe\api\data\cursos" -Destination "C:\Users\CRISTIAN\OneDrive\Backup-Cursos-$(Get-Date -Format 'yyyy-MM-dd')" -Recurse
```

---

## 📚 Más información:
- **Inicio detallado**: Ver [INICIAR-SISTEMA.md](./INICIAR-SISTEMA.md)
- **Deploy a producción**: Ver [DEPLOY.md](./DEPLOY.md)
- **Cambios técnicos**: Ver [RESUMEN-MIGRACION.md](./RESUMEN-MIGRACION.md)
