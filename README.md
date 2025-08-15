# OnBoard HHRR - Sistema de Gestión de Recursos Humanos

Sistema integral de gestión de recursos humanos diseñado específicamente para empresas venezolanas, con características como validación de cédulas venezolanas, estructura organizacional jerárquica y control de acceso basado en roles.

## Características Principales

- ✅ **Autenticación segura** con validación de cédulas venezolanas (V-/E-)
- ✅ **6 niveles de roles jerárquicos** (Admin, Gerente RRHH, Admin RRHH, Supervisor, Empleado Captación, Empleado)
- ✅ **Sidebar colapsible** con navegación intuitiva
- ✅ **Dropdowns en cascada** para estructura organizacional (Gerencia → Departamento → Cargo)
- ✅ **Dashboard con estadísticas** en tiempo real
- ✅ **Gestión completa de empleados** con búsqueda avanzada, filtros de estado y fecha múltiples
- ✅ **Interfaz responsive** compatible con móviles y tablets
- ✅ **TypeScript** para mayor seguridad de tipos

## Tecnologías Utilizadas

### Frontend
- React 18 con TypeScript
- Vite para desarrollo rápido
- Tailwind CSS + shadcn/ui para styling
- Wouter para routing
- TanStack Query para manejo de estado
- React Hook Form + Zod para formularios
- Zustand para estado global

### Backend
- Node.js con Express y TypeScript
- Drizzle ORM para base de datos
- bcryptjs para seguridad de contraseñas
- express-session para sesiones

### Base de Datos
- PostgreSQL (compatible con Supabase)
- Migraciones con Drizzle Kit

## Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/onboard-hhrr.git
cd onboard-hhrr
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

4. **Editar el archivo `.env`** con tus datos de base de datos:
```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/onboard_hhrr
```

## Configuración de Base de Datos

### Opción 1: Supabase (Recomendado)

1. Crear una cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto
3. Ir a "Connect" y copiar la "Connection string" del "Transaction pooler"
4. Reemplazar `[YOUR-PASSWORD]` con tu contraseña
5. Pegar la URL en `.env` como `DATABASE_URL`

### Opción 2: PostgreSQL Local

1. Instalar PostgreSQL
2. Crear base de datos: `createdb onboard_hhrr`
3. Configurar `DATABASE_URL` en `.env`

### Aplicar esquema a la base de datos:
```bash
npm run db:push
```

## Uso

### Desarrollo
```bash
npm run dev
```
El servidor se iniciará en `http://localhost:5000`

> **Nota**: El sistema ya está configurado y operativo en Replit. La migración de Replit Agent a Replit fue completada exitosamente el 14 de enero de 2025.

### Construcción para producción
```bash
npm run build
npm run preview
```

## Credenciales de Prueba

El sistema incluye datos de ejemplo. Puedes usar estas credenciales para probar:

- **Cédula:** `V-87654321`
- **Contraseña:** `admin123`
- **Rol:** Administrador

> **Nota adicional:** También hay 32 empleados de prueba disponibles con contraseña `123456`

## Estructura del Proyecto

```
onboard-hhrr/
├── client/                 # Frontend React
│   └── src/
│       ├── components/     # Componentes UI
│       ├── pages/          # Páginas de la aplicación
│       ├── hooks/          # Hooks personalizados
│       └── lib/           # Utilidades y configuración
├── server/                # Backend Express
│   ├── index.ts          # Servidor principal
│   ├── routes.ts         # Rutas de API
│   └── storage.ts        # Capa de datos
├── shared/               # Código compartido
│   └── schema.ts         # Esquemas de base de datos
└── DOCUMENTACION_SISTEMA.txt  # Documentación completa
```

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza build de producción
- `npm run db:push` - Aplica cambios al esquema de base de datos

## Funcionalidades

### Implementadas ✅
- **Sistema de autenticación completo** con roles jerárquicos (6 niveles)
- **Dashboard con estadísticas** en tiempo real
- **CRUD completo de empleados** con validaciones y edición
- **Sistema avanzado de filtros de fecha** con 4 modalidades de filtrado
- **Fecha de ingreso integrada** en visualización de empleados
- **Gestión de contratos** (tipos: indefinido, determinado, obra, pasantía)
- **Estructura organizacional** jerárquica completa
- **Dropdowns en cascada** Gerencia → Departamento → Cargo
- **Interfaz responsive** con sidebar colapsible
- **Módulo de reclutamiento** con gestión de candidatos
- **Módulo de períodos de prueba** con seguimiento
- **Módulo de egresos** con workflow de aprobaciones
- **Sistema de reportes** con múltiples análisis

### Por Implementar 📋
- Completar formularios del módulo de candidatos
- Optimizar sistema de filtros en reportes
- Sistema de notificaciones en tiempo real
- Exportación de datos (Excel/PDF)
- Gestión de vacaciones
- Testing automatizado
- Logs de auditoría detallados
- Dashboard personalizable por rol

## Estructura de Roles

1. **Admin** - Acceso completo al sistema
2. **Gerente RRHH** - Gestión completa de recursos humanos
3. **Admin RRHH** - Administración operativa de RRHH
4. **Supervisor** - Supervisión de equipos asignados
5. **Empleado Captación** - Gestión de reclutamiento
6. **Empleado** - Acceso básico limitado

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual
- `POST /api/auth/logout` - Cerrar sesión

### Empleados
- `GET /api/employees` - Listar empleados
- `POST /api/employees` - Crear empleado

### Estructura Organizacional
- `GET /api/gerencias` - Listar gerencias
- `GET /api/departamentos/:gerenciaId` - Departamentos por gerencia
- `GET /api/cargos/:departamentoId` - Cargos por departamento

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas del dashboard

## Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o reportar problemas, crear un issue en el repositorio de GitHub.

## Contexto Venezolano

Este sistema está específicamente diseñado para el contexto laboral venezolano:

- **Validación de cédulas** con formato V-/E-
- **Tipos de contrato** según legislación venezolana
- **Estructura organizacional** típica de empresas venezolanas
- **Terminología** en español venezolano

---

Desarrollado con ❤️ para empresas venezolanas