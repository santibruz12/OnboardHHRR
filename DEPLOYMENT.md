# Guía de Deployment - OnBoard HRRR

Esta guía explica cómo desplegar el sistema OnBoard HRRR en diferentes plataformas.

## Preparación para Producción

### 1. Variables de Entorno
Asegúrate de configurar estas variables en tu plataforma de hosting:

```env
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/database
NODE_ENV=production
SESSION_SECRET=clave_secreta_muy_segura_para_sesiones
PORT=5000
```

### 2. Base de Datos
- Configurar PostgreSQL en producción (Supabase recomendado)
- Ejecutar `npm run db:push` para aplicar esquema
- **NO usar datos de desarrollo en producción**

### 3. Seguridad
- Generar `SESSION_SECRET` fuerte y único
- Configurar HTTPS en el servidor
- Configurar CORS apropiadamente
- Implementar rate limiting

## Opciones de Deployment

### 🚀 Replit (Más Simple)

1. **Fork/Import proyecto a Replit**
2. **Configurar secretos:**
   - Ir a "Secrets" en panel lateral
   - Agregar `DATABASE_URL` con tu URL de Supabase
   - Agregar `SESSION_SECRET` con clave segura

3. **Deploy automático:**
   - Click en "Deploy" en Replit
   - Replit manejará automáticamente el build y hosting

### 🌐 Vercel (Frontend + Serverless)

**Preparación:**
```bash
npm install -g vercel
```

**Configuración (vercel.json):**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/**",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

**Deploy:**
```bash
vercel --prod
```

### 🐳 Docker (Containerizado)

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build del frontend
RUN npm run build

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SESSION_SECRET=${SESSION_SECRET}
      - NODE_ENV=production
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=onboard_hrrr
      - POSTGRES_USER=usuario
      - POSTGRES_PASSWORD=contraseña
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### ☁️ Heroku

**Preparación:**
1. Instalar Heroku CLI
2. Crear archivo `Procfile`:
```
web: npm start
```

**Deploy:**
```bash
heroku create tu-app-name
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=tu_clave_secreta
git push heroku main
heroku run npm run db:push
```

### 🌊 DigitalOcean App Platform

1. **Conectar repositorio GitHub**
2. **Configurar build:**
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. **Variables de entorno:**
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NODE_ENV=production`

### 🔧 VPS/Servidor Propio

**Prerrequisitos:**
- Node.js 20+
- PostgreSQL
- Nginx (recomendado)
- PM2 para proceso

**Configuración:**
```bash
# Instalar dependencias del sistema
sudo apt update
sudo apt install nodejs npm postgresql nginx

# Clonar y configurar proyecto
git clone tu-repositorio
cd onboard-hrrr
npm install
npm run build

# Instalar PM2
npm install -g pm2

# Configurar PM2
pm2 start npm --name "onboard-hrrr" -- start
pm2 startup
pm2 save
```

**Configuración Nginx:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Configuración de Base de Datos

### Supabase (Recomendado)
1. Crear proyecto en supabase.com
2. Obtener connection string desde "Connect"
3. Usar "Transaction pooler" para mejor rendimiento
4. Ejecutar `npm run db:push` para aplicar schema

### PostgreSQL Tradicional
```bash
# Crear base de datos
createdb onboard_hrrr

# Configurar usuario
sudo -u postgres createuser --superuser tu_usuario
sudo -u postgres psql -c "ALTER USER tu_usuario PASSWORD 'tu_contraseña';"

# URL de conexión
DATABASE_URL=postgresql://tu_usuario:tu_contraseña@localhost:5432/onboard_hrrr
```

## Checklist Pre-Deploy

### Seguridad
- [ ] Variables de entorno configuradas
- [ ] SESSION_SECRET único y seguro
- [ ] DATABASE_URL sin credenciales hardcodeadas
- [ ] HTTPS configurado
- [ ] Headers de seguridad configurados

### Performance
- [ ] Build de producción ejecutado
- [ ] Assets minificados
- [ ] Caché configurado
- [ ] Gzip habilitado

### Monitoreo
- [ ] Logs configurados
- [ ] Monitoreo de uptime
- [ ] Alertas de errores
- [ ] Backup de base de datos

### Testing
- [ ] Tests pasando
- [ ] Funcionalidad crítica probada
- [ ] Performance aceptable
- [ ] Compatibilidad de browsers

## Post-Deploy

### 1. Verificación
- Acceder a la URL de producción
- Probar login con credenciales
- Verificar funcionalidades principales
- Revisar logs por errores

### 2. Configuración Inicial
- Crear usuario administrador
- Configurar estructura organizacional básica
- Importar datos iniciales (si aplica)

### 3. Monitoreo
- Configurar alertas de downtime
- Monitorear métricas de performance
- Configurar backup automático de DB

## Solución de Problemas Comunes

### Error: "Cannot connect to database"
- Verificar DATABASE_URL
- Confirmar que base de datos esté accesible
- Revisar configuración de red/firewall

### Error: "Session store cannot connect"
- Verificar que MemoryStore esté configurado
- Para producción, considerar Redis

### Build fails
- Verificar versión de Node.js (20+)
- Limpiar node_modules y reinstalar
- Revisar errores de TypeScript

### 500 Internal Server Error
- Revisar logs del servidor
- Verificar variables de entorno
- Confirmar que base de datos esté inicializada

## Mantenimiento

### Actualizaciones
```bash
# Backup de base de datos
pg_dump $DATABASE_URL > backup.sql

# Actualizar código
git pull origin main
npm install
npm run build
npm run db:push

# Reiniciar aplicación
pm2 restart onboard-hrrr
```

### Backup
- Configurar backup automático de PostgreSQL
- Respaldar archivos de configuración
- Mantener copias en ubicación segura

### Escalabilidad
- Monitorear uso de recursos
- Considerar load balancer para múltiples instancias
- Optimizar consultas de base de datos
- Implementar caché (Redis) si es necesario

---

Para soporte específico de deployment, crear issue en el repositorio con detalles del error y plataforma utilizada.