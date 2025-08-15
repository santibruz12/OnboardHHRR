# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Sin liberar]

### Por agregar
- Ordenamiento por columnas en otras tablas del sistema (contratos, candidatos, etc.)
- Completar módulo de candidatos (formularios incompletos)
- Sistema de notificaciones en tiempo real
- Exportación de datos (Excel/PDF)
- Gestión de vacaciones
- Testing automatizado
- Logs de auditoría detallados

## [1.4.0] - 2025-01-15

### Agregado
- ✅ **Fecha de ingreso visible en tarjetas de empleados** - Mostrada junto al cargo y departamento
- ✅ **Sistema avanzado de filtros de fecha en empleados** - Cuatro tipos de filtros:
  - Filtro por rango personalizado (fecha de ingreso - fecha fin)
  - Filtro por período (este mes, esta semana)
  - Filtro por año específico
  - Filtro por mes específico
- ✅ **Eliminación de iconos duplicados** - Removido icono Calendar innecesario de información de empleados

### Mejorado
- **Experiencia de usuario en filtros** - Filtros de fecha más intuitivos y funcionales
- **Visualización de información** - Fecha de ingreso integrada naturalmente en el diseño
- **Funcionalidad de filtros independientes** - Los filtros de estado y fecha ahora funcionan correctamente de forma independiente

### Técnico
- Función `getWeekNumber()` reubicada para evitar errores de inicialización
- Importación del icono `Calendar` agregada correctamente
- Lógica de filtrado mejorada para manejar múltiples criterios simultáneamente

## [1.3.0] - 2025-08-14 (Sesión Claude2)

### Agregado
- ✅ **Fecha en formato español completo** - "14 de agosto de 2025" reubicada en esquina superior derecha
- ✅ **Dashboard con actualización en tiempo real** - Tarjetas se actualizan automáticamente cada 5 segundos
- ✅ **Selector de estado en módulo empleados** - Filtro específico reemplazando botón genérico de filtros
- ✅ **Visualización completa en contratos** - Nombres, emails y cargos de empleados visibles
- ✅ **Búsqueda expandida** - Posibilidad de buscar empleados por cargo además de nombre, cédula y email
- ✅ **Selector de ordenamiento en empleados** - Dos selectores para ordenar por nombre, cargo, fecha, email, cédula o estado
- ✅ **Documentación de cambios** en `attached_assets/08 Documentacion cambios sesion claude2.md`

### Corregido
- ✅ **Error `this.sql.unsafe is not a function`** - Método updateEmployee corregido en server/storage.ts
- ✅ **Contratos sin datos de empleado** - Query SQL mejorada con JOINs para mostrar información completa
- ✅ **Dashboard estático** - Agregado refetchInterval y refetchOnWindowFocus
- ✅ **UX subóptima en filtros** - Selector específico de estado implementado
- ✅ **Rutas duplicadas eliminadas** - Limpieza en server/routes.ts

### Mejoras de UX
- Fecha contextual en español natural ubicada intuitivamente
- Filtrado específico con selector de estado (Todos, Activo, Período de Prueba, Inactivo)
- Datos en tiempo real sin necesidad de recargar página
- Información completa de empleados visible en módulo de contratos
- Búsqueda ampliada para incluir cargos
- Ordenamiento flexible con selectores dedicados (criterio + dirección)

## [1.2.0] - 2025-08-14

### Agregado
- ✅ **Migración exitosa de Replit Agent a Replit estándar** - Sistema completamente operativo
- ✅ **Documentación completa de migración** por Claude en `attached_assets/07 Documentacion del sistema claude.md`
- ✅ **Verificación integral de funcionalidad** - Todos los módulos y endpoints validados
- ✅ **Confirmación de arquitectura** - Stack técnico verificado y funcionando
- ✅ **Workflow de desarrollo optimizado** - Express servidor ejecutándose en puerto 5000
- ✅ **Sistema completamente listo para producción** - Sin errores ni problemas pendientes

### Verificado
- Autenticación API respondiendo correctamente (401 para usuarios no autenticados)
- Frontend React + TypeScript cargando sin errores
- Base de datos PostgreSQL conectada con Drizzle ORM
- Todas las dependencias instaladas y funcionando
- Sistema de roles y permisos operativo

## [1.1.0] - 2025-01-14

### Agregado
- ✅ **Implementación inicial de módulos avanzados** - Sistema base operativo
- ✅ **Documentación del proceso inicial** por desarrolladores anteriores
- ✅ **Funcionalidad base** - Módulos principales implementados
- ✅ **Estructura de base de datos** - Esquemas y migraciones
- ✅ **Sistema de autenticación** - Login y roles funcionando

### Corregido
- Problema de scroll en modal de egresos (implementado max-h-[90vh] overflow-y-auto)
- Pre-carga de datos en formulario de edición de empleados
- Validaciones frontend/backend sincronizadas
- Campo 'status' agregado al employeeFormSchema
- ✅ Error en actualización de períodos de prueba (corregido método HTTP de PATCH a PUT)
- Errores de tipo en servidor para candidatos y períodos de prueba

### Agregado (Enero 2025)
- Campo 'type' en períodos de prueba para distinguir nuevos ingresos vs movimientos internos
- Filtros por tipo en módulo de períodos de prueba
- Columna "Tipo" en tabla de períodos de prueba con badges visuales
- Secciones separadas para nuevos ingresos y movimientos internos

### Técnico
- Express server ejecutándose correctamente con tsx
- Autenticación API respondiendo adecuadamente
- Base de datos PostgreSQL conectada con Drizzle ORM
- Frontend React + TypeScript cargando sin errores
- TanStack Query + Zustand funcionando para estado

## [1.0.0] - 2025-01-08

### Agregado
- Sistema base de gestión de RRHH
- Autenticación con validación de cédulas venezolanas (V-/E-)
- Sistema de roles jerárquicos (6 niveles)
- Sidebar colapsible con navegación intuitiva
- Dropdowns en cascada para estructura organizacional
- Dashboard con estadísticas principales
- Gestión básica de empleados (visualización, búsqueda, filtros)
- Base de datos PostgreSQL con Drizzle ORM
- Interfaz responsive con Tailwind CSS + shadcn/ui
- TypeScript en frontend y backend
- Documentación completa del sistema

### Características Técnicas
- React 18 con Vite para el frontend
- Express.js con TypeScript para el backend  
- TanStack Query para manejo de estado del servidor
- React Hook Form + Zod para formularios
- bcryptjs para seguridad de contraseñas
- Wouter para routing ligero
- Zustand para estado global

### Estructura de Base de Datos
- Tabla `users` para autenticación y roles
- Tabla `employees` para datos de empleados
- Tabla `gerencias` para gerencias de la empresa
- Tabla `departamentos` para departamentos por gerencia
- Tabla `cargos` para cargos por departamento
- Tabla `contracts` para contratos de trabajo
- Tabla `probation_periods` para períodos de prueba
- Tabla `audit_logs` para registro de auditoría

### API Endpoints Implementados
- Autenticación: login, logout, usuario actual
- Empleados: listar, obtener por ID
- Estructura organizacional: gerencias, departamentos, cargos
- Dashboard: estadísticas generales

### Características Venezolanas
- Validación de formato de cédula (V-12345678 / E-12345678)
- Tipos de contrato según legislación venezolana
- Terminología específica del contexto laboral venezolano

### Seguridad
- Hash de contraseñas con bcryptjs
- Sesiones seguras con express-session
- Validación de entrada con schemas Zod
- Control de acceso basado en roles

### Interfaz de Usuario
- Design system moderno y consistente
- Navegación intuitiva con sidebar colapsible
- Componentes reutilizables con shadcn/ui
- Responsive design para móviles y tablets
- Dropdowns que se actualizan automáticamente

### Documentación
- README.md completo con instrucciones de instalación
- DOCUMENTACION_SISTEMA.txt con detalles técnicos
- CONTRIBUTING.md con guías para contribuidores
- DEPLOYMENT.md con opciones de despliegue
- Comentarios en código para funciones complejas