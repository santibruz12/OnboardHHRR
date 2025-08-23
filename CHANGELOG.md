# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Sin liberar]

### Por agregar
- Sistema de alertas para candidatos aprobados (crear empleado desde candidato)
- Ordenamiento por columnas en otras tablas del sistema (contratos, candidatos, etc.)
- Sistema de notificaciones en tiempo real
- Exportación de datos (Excel/PDF)
- Gestión de vacaciones
- Testing automatizado
- Logs de auditoría detallados

## [1.6.0] - 2025-08-23

### Agregado
- ✅ **Migración exitosa a Replit Environment** - Proyecto migrado desde Replit Agent sin pérdida de funcionalidad
- ✅ **Información del reclutador en módulo de candidatos** - Nueva columna muestra nombre completo del reclutador
- ✅ **JOIN con tabla de empleados para nombres** - Consulta SQL optimizada para obtener nombres completos
- ✅ **Fallback inteligente de nombres** - Muestra cédula si no se encuentra nombre del reclutador
- ✅ **Planificación de alertas de candidatos aprobados** - Diseño conceptual para flujo candidato → empleado

### Corregido
- ✅ **Error de propiedades incorrectas en candidatos** - Cambiado `name` por `nombre` según esquema de BD
- ✅ **Error de orden de parámetros en apiRequest** - Función ahora recibe (method, url, data) correctamente
- ✅ **CRUD de candidatos completamente funcional** - Crear, actualizar y eliminar candidatos sin errores
- ✅ **Visualización correcta de cargo y departamento** - Nombres se muestran apropiadamente en tabla

### Mejorado
- **Experiencia de usuario en candidatos** - Información más completa y clara del reclutador responsable
- **Consulta de base de datos optimizada** - JOIN eficiente para obtener datos relacionados
- **Trazabilidad del proceso de reclutamiento** - Ahora se puede identificar quién registró cada candidato
- **Preparación para flujos futuros** - Base sólida para implementar alertas automáticas

### Técnico
- Query SQL mejorada con LEFT JOIN a tabla employees para obtener nombres
- Lógica de concatenación de nombres con fallback a cédula
- Corrección de todas las llamadas a apiRequest en el proyecto
- Documentación completa de cambios en `attached_assets/10 Documentacion del sistema maryoris.md`

## [1.5.0] - 2025-01-16

### Agregado
- ✅ **Validadores avanzados de fechas de contrato** - Prevención de fechas de fin anteriores a fechas de inicio/ingreso
- ✅ **Auto-cálculo de fechas de fin de contrato** - Cálculo automático de 90 días mínimos para contratos determinados y por obra
- ✅ **Validación de fecha de inicio de contrato** - Prevención de fechas de inicio anteriores a fecha de ingreso del empleado
- ✅ **Función addDays mejorada** - Cálculo preciso de fechas considerando meses con diferentes días

### Mejorado
- **Experiencia en formularios de empleados** - Auto-población inteligente de fechas con opción de edición manual
- **Validación en tiempo real** - Retroalimentación inmediata durante entrada de datos
- **Consistencia entre módulos** - Mismas validaciones aplicadas en empleados y contratos
- **Manejo de contratos por obra** - Auto-cálculo específico para proyectos con duración definida

### Técnico
- Validaciones robustas con Zod que permiten campos vacíos durante edición
- Lógica de auto-cálculo que respeta valores editados manualmente por el usuario
- Mensajes de error específicos y útiles para guiar al usuario
- Integración completa entre validaciones frontend y lógica de formularios

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