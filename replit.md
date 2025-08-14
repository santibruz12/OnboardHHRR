# OnBoard HHRR - HR Management System

## Overview

OnBoard HHRR is a comprehensive Human Resources management application designed specifically for the Venezuelan business context. The system provides complete employee lifecycle management from recruitment through contract administration, with features including authentication, organizational structure management, employee data management, dashboard analytics, and document workflows. Built as a full-stack web application, it serves HR departments with tools for managing employees, contracts, organizational hierarchies, and generating insights through comprehensive dashboards.

## User Preferences

Preferred communication style: Simple, everyday language. Always in Spanish

## PENDIENTES DE IMPLEMENTAR PRIORITARIOS

### 1. ✅ Módulo de Egresos - Problema de Scroll en Modal [RESUELTO]
**Descripción**: La ventana emergente (modal) para registrar un nuevo egreso no permite hacer scroll correctamente, lo que impide acceder a todos los campos del formulario cuando el contenido excede la altura visible de la ventana.

**Solución implementada**: 
- Agregado `max-h-[90vh] overflow-y-auto` al DialogContent
- Envuelto el formulario en un contenedor con scroll: `overflow-y-auto max-h-[calc(90vh-120px)]`
- Agregado borde superior a los botones de acción para mejor separación visual
- Los usuarios ahora pueden hacer scroll en formularios largos sin perder acceso a los campos

**Ubicación**: `client/src/pages/egresos.tsx` - Dialog component para crear nuevo egreso

### 2. ✅ Verificación de Funcionalidad de Edición en Todos los Módulos [COMPLETADO]
**Descripción**: Verificar que la funcionalidad de edición funcione correctamente en todos los módulos del sistema, asegurando que:
- Al seleccionar un registro para editar, se carguen automáticamente todos los datos existentes
- El usuario solo necesite modificar los campos deseados sin reescribir toda la información
- Las actualizaciones se procesen correctamente sin errores

**Módulos verificados y corregidos**:
- ✅ Empleados: Funcionando correctamente con método PATCH
- ✅ Candidatos: Corregido método HTTP PUT
- ✅ Períodos de Prueba: Corregido método HTTP PUT y validaciones
- ✅ Egresos: Corregido método HTTP PUT con validaciones específicas
- ✅ Ofertas de Trabajo: Corregido método HTTP PUT
- ✅ Aplicaciones de Trabajo: Corregido método HTTP PUT
- ✅ Contratos: Funcionando correctamente

**Ubicación**: Todos los módulos - formularios de edición y endpoints PUT implementados

### 3. Implementación de Ordenamiento por Columnas [PRIORITARIO]
**Descripción**: Agregar funcionalidad de ordenamiento ascendente/descendente en todas las tablas del sistema mediante flechas clickeables en los headers de las columnas.

**Beneficios**:
- Mejorar experiencia de usuario permitiendo ordenar por cualquier criterio
- Facilitar búsqueda y análisis de información
- Estándar de UX esperado en sistemas de gestión

**Módulos a implementar**:
- Empleados
- Candidatos  
- Períodos de Prueba
- Egresos
- Ofertas de Trabajo
- Contratos
- Reportes

**Ubicación**: Todos los componentes de tabla en `client/src/pages/`

### 4. ✅ Sincronización Automática Empleados-Contratos-Períodos [COMPLETADO]
**Descripción**: Implementar sincronización automática entre módulos de empleados, contratos y períodos de prueba para que:
- Al registrar un empleado, se cree automáticamente su contrato correspondiente
- El contrato tenga estado "activo" por defecto
- La fecha de inicio del contrato sea igual a la fecha de ingreso del empleado
- Se genere automáticamente período de prueba de 30 días para nuevos ingresos
- El tipo de contrato se tome del formulario de empleado
- Las modificaciones se reflejen en tiempo real entre módulos

**Características implementadas**:
- ✅ Creación automática de contratos al registrar empleados
- ✅ Generación automática de períodos de prueba de 30 días para nuevos ingresos
- ✅ Sincronización de fechas entre empleado, contrato y período de prueba
- ✅ Tipo de período distingue entre "nuevo_ingreso" y "movimiento_interno"

**Ubicación**: 
- ✅ `server/routes.ts` - endpoint POST /api/employees (líneas 179-203)
- ✅ Lógica de sincronización implementada en storage

### 5. Módulo de Candidatos - Formularios Incompletos
**Descripción**: El módulo de candidatos carece de implementación completa de formularios. Aunque la estructura básica existe, faltan formularios funcionales para la gestión completa de candidatos.

**Impacto**: Funcionalidad limitada para la gestión de candidatos, impidiendo un flujo completo de reclutamiento.

**Ubicación**: `client/src/pages/candidates.tsx` - Requiere implementación de formularios de creación/edición

### 6. Sistema de Filtros en Reportes - Justificación de Funcionalidad
**Descripción**: Se implementaron filtros en el módulo de reportes (por departamento y estado) pero se cuestiona la necesidad y utilidad de esta funcionalidad.

**Justificación técnica**: Los filtros permiten:
- Generar reportes específicos por departamento para análisis segmentado
- Filtrar empleados por estado (activo, inactivo, período de prueba) para reportes focalizados
- Mejorar el rendimiento al reducir el conjunto de datos procesados
- Facilitar análisis de RRHH por áreas específicas de la organización

**Ubicación**: `client/src/pages/reports.tsx` - Componentes Select para departmentFilter y statusFilter

## Recent Changes

- ✅ **Migración completa de Replit Agent a Replit (14 Enero 2025)**
  - Sistema completamente operativo en nuevo entorno
  - Todas las dependencias instaladas y funcionando
  - Workflow de desarrollo configurado (puerto 5000)
  - Verificación completa de funcionalidad realizada
  - Documentación actualizada por Claude en `documentacion_sistema_por_claude.md`
- ✅ Corregido CRUD de empleados: pre-carga de datos en edición y error 400 al crear
- ✅ Agregado campo `status` al employeeFormSchema para soporte completo de estados
- ✅ Mejorado manejo de validaciones frontend/backend para empleados
- ✅ Creada documentación completa del sistema en DOCUMENTACION_SISTEMA_RODSAL.md
- ✅ Sistema completamente funcional con gestión de empleados y contratos
- ✅ Workflow de desarrollo configurado y operativo en Replit
- ✅ Implementado Módulo de Reclutamiento completo con gestión de candidatos (Enero 2025)
- ✅ Implementado Módulo de Períodos de Prueba completo con seguimiento y evaluaciones (Enero 2025)
- ✅ Implementado Módulo de Egresos completo con aprobaciones y seguimiento de salidas (Enero 2025)
- ✅ Implementado Módulo de Ofertas de Trabajo con seguimiento de aplicaciones (Enero 2025)
- ✅ Implementado Módulo de Gestión de Roles y Permisos jerarquizado (Enero 2025)
- ✅ Implementado Sistema de Reportes con múltiples tipos de análisis (Enero 2025)
- ✅ Corregido error de actualización en períodos de prueba (método HTTP PUT implementado correctamente)
- ✅ Agregadas mejoras prioritarias a lista de pendientes en documentación (Enero 2025)
- ✅ Corregido problema de pre-carga de datos en formulario de empleados (useEffect implementado)
- ✅ Corregido error de eliminación en períodos de prueba (método HTTP DELETE corregido)
- ✅ Corregido problema de creación en egresos (validaciones y credentials agregadas)

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite for fast development and hot module replacement
- **Routing**: Wouter for lightweight client-side routing with protected routes
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: Zustand for lightweight global state management
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **Data Fetching**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with custom styling through shadcn/ui

### Backend Architecture
- **Server**: Express.js with TypeScript for type safety
- **API Design**: RESTful API endpoints with proper HTTP status codes
- **Session Management**: Express-session with in-memory store for user sessions
- **Authentication**: Custom implementation with bcrypt for password hashing
- **File Serving**: Vite middleware for development static file serving

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon Database serverless hosting
- **Schema Management**: Drizzle migrations for version-controlled schema changes
- **Connection**: @neondatabase/serverless for optimized serverless connections

### Security Implementation
- **Password Security**: bcryptjs for secure password hashing and validation
- **Session Security**: HTTP-only cookies with configurable expiration
- **Role-Based Access**: Hierarchical role system (admin, gerente_rrhh, admin_rrhh, supervisor, empleado_captacion, empleado)
- **Input Validation**: Zod schemas for comprehensive request validation
- **Venezuelan Context**: Cedula validation with V-/E- prefix format support

### Data Architecture
- **Employee Management**: Complete employee profiles with organizational hierarchy relationships
- **Organizational Structure**: Three-tier hierarchy (Gerencias → Departamentos → Cargos)
- **Contract System**: Multiple contract types (indefinido, determinado, obra, pasantia) with status tracking
- **User System**: Separate user accounts linked to employee records for authentication
- **Recruitment Module**: Complete candidate lifecycle management with evaluation tracking
- **Probation Periods**: Comprehensive probation period management with status tracking and evaluations
- **Departures Module**: Complete employee departure management with approvals and documentation tracking
- **Job Offers Module**: Job posting system with application tracking and candidate management
- **Role Management**: Hierarchical role system with permission management and user administration
- **Reports System**: Comprehensive reporting system with multiple analysis types and data export capabilities
- **Dashboard Analytics**: Aggregated statistics for HR insights and reporting across all modules

## External Dependencies

### Core Runtime Dependencies
- **React Ecosystem**: React 18 with modern hooks, React DOM, React Hook Form for forms
- **State & Data**: Zustand for state management, TanStack Query for server state
- **UI Framework**: Radix UI primitives, class-variance-authority for component variants
- **Styling**: Tailwind CSS, clsx for conditional classes, Tailwind merge utilities
- **Validation**: Zod for schema validation, hookform/resolvers for form integration
- **Authentication**: bcryptjs for password hashing
- **Utilities**: date-fns for date manipulation, lucide-react for icons

### Database & ORM
- **Database**: Neon Database (PostgreSQL) for serverless database hosting
- **ORM**: Drizzle ORM with Drizzle-Kit for migrations and schema management
- **Session Storage**: Express-session with MemoryStore for development

### Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Language**: TypeScript for type safety across frontend and backend
- **Bundling**: ESBuild for server-side bundling in production
- **Development**: TSX for TypeScript execution in development

### Replit Integration
- **Platform**: Optimized for Replit hosting environment
- **Error Handling**: @replit/vite-plugin-runtime-error-modal for development debugging
- **Cartographer**: @replit/vite-plugin-cartographer for enhanced Replit development experience
- **Configuration**: Custom Vite configuration for Replit deployment compatibility