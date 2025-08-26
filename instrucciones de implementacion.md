# Instrucciones de Implementación - OnBoard HHRR

## 📋 Índice
1. [Implementación Local](#implementación-local)
2. [Implementación con Supabase](#implementación-con-supabase)
3. [Configuración Post-Instalación](#configuración-post-instalación)
4. [Solución de Problemas](#solución-de-problemas)

---

## 🏠 Implementación Local

### Requisitos Previos
- **Node.js 18+** (recomendado: versión LTS más reciente)
- **PostgreSQL 14+** instalado y ejecutándose
- **Git** para clonar el repositorio
- Editor de código (VS Code recomendado)

### Paso 1: Preparar el Entorno Local

#### 1.1 Instalar PostgreSQL

**En Windows:**
```bash
# Descargar desde https://www.postgresql.org/download/windows/
# O usar Chocolatey:
choco install postgresql

# O usar winget:
winget install PostgreSQL.PostgreSQL
```

**En macOS:**
```bash
# Con Homebrew:
brew install postgresql
brew services start postgresql

# O descargar desde https://postgresapp.com/
```

**En Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 1.2 Configurar PostgreSQL
```bash
# Acceder a PostgreSQL como superusuario
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE onboard_hhrr;
CREATE USER onboard_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE onboard_hhrr TO onboard_user;
\q
```

### Paso 2: Obtener el Código

#### 2.1 Clonar o Descargar el Proyecto
```bash
# Si tienes el código en un repositorio Git:
git clone [URL_DEL_REPOSITORIO] onboard-hhrr
cd onboard-hhrr

# O crear directorio y copiar archivos manualmente:
mkdir onboard-hhrr
cd onboard-hhrr
# Copiar todos los archivos del proyecto aquí
```

### Paso 3: Configurar Variables de Entorno

#### 3.1 Crear archivo `.env`
```bash
# En la raíz del proyecto, crear archivo .env
touch .env
```

#### 3.2 Configurar `.env`
```env
# Base de datos PostgreSQL local
DATABASE_URL="postgresql://onboard_user:tu_password_seguro@localhost:5432/onboard_hhrr"

# Variables de PostgreSQL individuales
PGHOST="localhost"
PGPORT="5432"
PGDATABASE="onboard_hhrr"
PGUSER="onboard_user"
PGPASSWORD="tu_password_seguro"

# Configuración del servidor
NODE_ENV="development"
PORT="5000"

# Seguridad (generar claves aleatorias para producción)
SESSION_SECRET="tu_clave_secreta_muy_larga_y_aleatoria"
```

### Paso 4: Instalar Dependencias

#### 4.1 Instalar paquetes de Node.js
```bash
# Verificar versión de Node.js
node --version  # Debe ser 18+

# Instalar dependencias
npm install

# Si hay problemas con versiones, limpiar caché:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Paso 5: Configurar Base de Datos

#### 5.1 Generar y aplicar esquema
```bash
# Aplicar esquema a la base de datos
npm run db:push

# Si hay problemas, forzar aplicación:
npm run db:push --force
```

#### 5.2 Sembrar datos de prueba
```bash
# Ejecutar script de sembrado
npx tsx seed-data.ts

# Verificar que los datos se crearon correctamente
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### Paso 6: Ejecutar la Aplicación

#### 6.1 Iniciar en modo desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en:
# http://localhost:5000
```

#### 6.2 Verificar funcionamiento
- Abrir navegador en `http://localhost:5000`
- Probar login con credenciales de administrador:
  - **Cédula:** `V-87654321`
  - **Contraseña:** `admin123`

### Paso 7: Configuración para Producción

#### 7.1 Construir aplicación
```bash
# Generar build de producción
npm run build
```

#### 7.2 Ejecutar en producción
```bash
# Iniciar en modo producción
npm start
```

---

## ☁️ Implementación con Supabase

### Paso 1: Configurar Supabase

#### 1.1 Crear cuenta y proyecto
1. Ir a [https://supabase.com](https://supabase.com)
2. Crear cuenta o iniciar sesión
3. Clic en "New Project"
4. Configurar:
   - **Nombre:** `onboard-hhrr`
   - **Región:** Elegir la más cercana
   - **Database Password:** Generar contraseña segura

#### 1.2 Obtener credenciales
1. En el dashboard de Supabase, ir a **Settings > Database**
2. Copiar la **Connection String**
3. Ir a **Settings > API** y copiar:
   - **Project URL**
   - **API Key (anon public)**
   - **API Key (service_role)** (solo para desarrollo)

### Paso 2: Configurar Proyecto Local

#### 2.1 Obtener el código
```bash
# Mismo proceso que implementación local
git clone [URL_DEL_REPOSITORIO] onboard-hhrr-supabase
cd onboard-hhrr-supabase
```

#### 2.2 Instalar dependencias
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno

#### 3.1 Crear archivo `.env`
```env
# Base de datos Supabase
DATABASE_URL="postgresql://postgres.XXXXXXXXX:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Variables específicas de Supabase
SUPABASE_URL="https://XXXXXXXXX.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Configuración del servidor
NODE_ENV="production"
PORT="5000"

# Seguridad
SESSION_SECRET="clave_secreta_muy_larga_y_aleatoria_para_produccion"
```

#### 3.2 Reemplazar valores
- Reemplazar `XXXXXXXXX` con tu Project ID
- Reemplazar `[PASSWORD]` con tu database password
- Reemplazar `[REGION]` con tu región
- Copiar las claves API reales de Supabase

### Paso 4: Configurar Base de Datos

#### 4.1 Aplicar esquema
```bash
# Aplicar esquema a Supabase
npm run db:push

# Si hay conflictos, forzar:
npm run db:push --force
```

#### 4.2 Sembrar datos (opcional)
```bash
# Ejecutar sembrado de datos de prueba
npx tsx seed-data.ts
```

#### 4.3 Verificar en Supabase
1. Ir al **Table Editor** en Supabase
2. Verificar que las tablas se crearon:
   - `users`
   - `employees`
   - `gerencias`
   - `departamentos`
   - `cargos`
   - `contracts`
   - `candidates`
   - etc.

### Paso 5: Configurar RLS (Row Level Security)

#### 5.1 Habilitar RLS en Supabase
En el **SQL Editor** de Supabase, ejecutar:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE gerencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE probation_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE egresos ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas (ajustar según necesidades)
CREATE POLICY "Permitir lectura autenticada" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir lectura autenticada" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

-- Repetir para otras tablas según necesidades de seguridad
```

### Paso 6: Desplegar Aplicación

#### 6.1 Opciones de despliegue

**Opción A: Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno en Vercel dashboard
```

**Opción B: Railway**
```bash
# Conectar repositorio en railway.app
# Configurar variables de entorno
# Despliegue automático
```

**Opción C: Render**
```bash
# Conectar repositorio en render.com
# Configurar variables de entorno
# Despliegue automático
```

#### 6.2 Configurar variables de entorno en plataforma
Añadir todas las variables del archivo `.env` en el dashboard de tu plataforma de despliegue.

---

## ⚙️ Configuración Post-Instalación

### Credenciales por Defecto

**Administrador del Sistema:**
- **Cédula:** `V-87654321`
- **Contraseña:** `admin123`

**Empleados de Prueba:**
- **Contraseña:** `123456`
- Usar cualquier cédula de los empleados sembrados

### Configuración Recomendada

#### 1. Cambiar contraseñas por defecto
```sql
-- En PostgreSQL o Supabase SQL Editor
UPDATE users SET password = '[NUEVO_HASH_BCRYPT]' WHERE cedula = 'V-87654321';
```

#### 2. Configurar backup automático
**Para PostgreSQL local:**
```bash
# Crear script de backup
#!/bin/bash
pg_dump onboard_hhrr > backup_$(date +%Y%m%d).sql
```

**Para Supabase:**
- Los backups son automáticos
- Configurar Point-in-Time Recovery si es necesario

#### 3. Configurar logs
```bash
# Crear directorio de logs
mkdir logs

# Configurar rotación de logs (opcional)
npm install winston winston-daily-rotate-file
```

---

## 🔧 Solución de Problemas

### Problemas Comunes

#### Error: "Column does not exist"
```bash
# Regenerar y aplicar esquema
npm run db:push --force
```

#### Error: "Connection refused" 
**PostgreSQL local:**
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Reiniciar PostgreSQL
sudo systemctl restart postgresql  # Linux
brew services restart postgresql  # macOS
```

**Supabase:**
- Verificar CONNECTION_STRING en variables de entorno
- Revisar IP allowlist en Supabase (si está configurado)

#### Error: "Permission denied for database"
```sql
-- Verificar permisos de usuario
GRANT ALL PRIVILEGES ON DATABASE onboard_hhrr TO onboard_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO onboard_user;
```

#### Error en compilación TypeScript
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Verificar versión de TypeScript
npx tsc --version
```

#### Puerto ya en uso
```bash
# Cambiar puerto en .env
PORT="3000"

# O detener proceso en puerto 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000  # Windows
```

### Logs y Debugging

#### Habilitar logs detallados
```env
# En .env
DEBUG="*"
LOG_LEVEL="debug"
```

#### Verificar conexión a base de datos
```bash
# Probar conexión directa
psql $DATABASE_URL -c "SELECT NOW();"
```

#### Verificar estructura de tablas
```sql
-- Listar todas las tablas
\dt

-- Describir estructura de tabla
\d users
\d employees
```

### Recursos Adicionales

- **Documentación PostgreSQL:** https://www.postgresql.org/docs/
- **Documentación Supabase:** https://supabase.com/docs
- **Node.js Best Practices:** https://github.com/goldbergyoni/nodebestpractices
- **Drizzle ORM Docs:** https://orm.drizzle.team/

### Soporte

Para problemas específicos del proyecto:
1. Revisar logs de la aplicación
2. Verificar configuración de variables de entorno
3. Comprobar estado de la base de datos
4. Consultar documentación de dependencias

---

## 📝 Notas Importantes

- **Seguridad:** Cambiar todas las contraseñas por defecto en producción
- **Backup:** Configurar backups regulares de la base de datos
- **Monitoring:** Implementar monitoreo de la aplicación en producción
- **SSL:** Usar HTTPS en producción
- **Variables de Entorno:** Nunca commitear archivos `.env` al repositorio