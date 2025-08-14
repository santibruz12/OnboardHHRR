# 📋 DEFINICIÓN COMPLETA DE MÓDULOS - OnBoard HHRR

## ARQUITECTURA GENERAL DEL SISTEMA

El sistema OnBoard HHRR está estructurado en **6 módulos principales** con **flujos de procesos interconectados** que garantizan la integridad y trazabilidad de todas las operaciones de Recursos Humanos.

---

## 🔐 MÓDULO 1: AUTENTICACIÓN Y GESTIÓN DE ROLES

### Propósito
Controlar el acceso al sistema mediante autenticación segura y un sistema de roles jerárquicos con permisos granulares adaptado a la estructura organizacional venezolana.

### Componentes Principales
1. **Sistema de Login/Logout**
2. **Gestión de Sesiones** 
3. **Administración de Roles**
4. **Permisos Granulares**
5. **Auditoría de Accesos**

### Flujo de Procesos

#### 🔄 FLUJO 1.1: AUTENTICACIÓN DE USUARIO
```mermaid
graph TD
    A[Usuario ingresa credenciales] --> B{Credenciales válidas?}
    B -->|NO| C[Registrar intento fallido] --> D[Mostrar error]
    B -->|SÍ| E[Verificar estado del empleado]
    E --> F{Empleado activo?}
    F -->|NO| G[Bloquear acceso] --> H[Notificar Admin RRHH]
    F -->|SÍ| I[Generar token de sesión]
    I --> J[Cargar roles y permisos]
    J --> K[Registrar login exitoso]
    K --> L[Redirigir a dashboard]
```

#### 🔄 FLUJO 1.2: ASIGNACIÓN DE ROLES
```mermaid
graph TD
    A[Admin IT solicita asignación de rol] --> B{Es rol crítico?}
    B -->|NO| C[Asignar directamente] --> D[Notificar al usuario]
    B -->|SÍ| E[Enviar solicitud a Gerente RRHH]
    E --> F{Gerente aprueba?}
    F -->|NO| G[Rechazar solicitud] --> H[Notificar Admin IT]
    F -->|SÍ| I[Asignar rol] --> J[Auditar asignación]
    J --> K[Notificar usuario y Admin IT]
```

### Roles y Permisos Definidos

| Nivel | Rol | Permisos Principales |
|-------|-----|---------------------|
| **1** | **Gerente RRHH** | Acceso total, aprobación de roles críticos, informes ejecutivos |
| **2** | **Admin RRHH** | Gestión empleados, contratos, períodos prueba, reclutamiento |
| **3** | **Admin IT** | Asignación roles, tablas maestras, configuración sistema |
| **4** | **Supervisor** | Gestión equipo directo, egresos, feedback períodos prueba |
| **5** | **Empleado Captación** | Carga candidatos, gestión reclutamiento inicial |
| **6** | **Empleado RRHH** | Permisos específicos según función asignada |

### Estados de Sesión
- **Activa**: Usuario logueado con token válido
- **Expirada**: Token vencido, requiere re-autenticación
- **Revocada**: Sesión terminada por administrador
- **Bloqueada**: Usuario temporalmente bloqueado

---

## 👥 MÓDULO 2: GESTIÓN DE EMPLEADOS Y EXPEDIENTES

### Propósito
Administrar el ciclo de vida completo de los empleados desde el reclutamiento hasta el egreso, manteniendo expedientes digitales actualizados y trazables.

### Componentes Principales
1. **Gestión de Candidatos (Reclutamiento)**
2. **Registro de Nuevos Empleados**
3. **Expedientes Digitales**
4. **Gestión de Jerarquías**
5. **Actualización de Datos**

### Flujo de Procesos

#### 🔄 FLUJO 2.1: PROCESO DE RECLUTAMIENTO
```mermaid
graph TD
    A[Empleado Captación registra candidato] --> B[Validar datos básicos]
    B --> C{Datos válidos?}
    C -->|NO| D[Mostrar errores de validación]
    C -->|SÍ| E[Guardar en tabla Reclutamiento]
    E --> F[Asignar estado: 'En Evaluación']
    F --> G[Notificar Admin RRHH]
    G --> H[Admin RRHH evalúa candidato]
    H --> I{Candidato aprobado?}
    I -->|NO| J[Cambiar estado: 'Rechazado'] --> K[Archivar candidato]
    I -->|SÍ| L[Iniciar proceso de ingreso]
    L --> M[Transferir a tabla Empleados]
    M --> N[Generar período de prueba]
    N --> O[Notificar Supervisor asignado]
```

#### 🔄 FLUJO 2.2: GESTIÓN DE EXPEDIENTES
```mermaid
graph TD
    A[Usuario accede a expediente] --> B[Verificar permisos]
    B --> C{Tiene permisos?}
    C -->|NO| D[Mostrar error 403]
    C -->|SÍ| E[Cargar datos del empleado]
    E --> F[Mostrar información según rol]
    F --> G[Usuario modifica datos]
    G --> H[Validar cambios]
    H --> I{Cambios válidos?}
    I -->|NO| J[Mostrar errores]
    I -->|SÍ| K[Guardar cambios]
    K --> L[Auditar modificación]
    L --> M[Notificar cambios relevantes]
```

### Estados de Empleado
- **Activo**: Empleado trabajando normalmente
- **En Período de Prueba**: Nuevo ingreso o movimiento interno
- **Licencia**: Ausencia temporal autorizada
- **Suspendido**: Suspensión temporal por proceso disciplinario
- **Inactivo**: Empleado egresado del sistema

---

## 📄 MÓDULO 3: GESTIÓN DE CONTRATOS Y MOVIMIENTOS

### Propósito
Administrar todos los tipos de contratos laborales y movimientos internos (ascensos, traslados, renovaciones) con validaciones automáticas y flujos de aprobación.

### Componentes Principales
1. **Tipos de Contrato**
2. **Movimientos Internos**
3. **Renovaciones Automáticas**
4. **Validación de Fechas**
5. **Workflow de Aprobaciones**

### Flujo de Procesos

#### 🔄 FLUJO 3.1: CREACIÓN DE CONTRATO
```mermaid
graph TD
    A[Admin RRHH crea contrato] --> B[Validar datos del contrato]
    B --> C{Datos válidos?}
    C -->|NO| D[Mostrar errores]
    C -->|SÍ| E[Verificar solapamiento fechas]
    E --> F{Hay conflicto de fechas?}
    F -->|SÍ| G[Mostrar alerta de conflicto]
    F -->|NO| H[Guardar contrato]
    H --> I[Generar registro de movimiento]
    I --> J[Auditar creación]
    J --> K[Notificar empleado y supervisor]
```

#### 🔄 FLUJO 3.2: MOVIMIENTO INTERNO (ASCENSO/TRASLADO)
```mermaid
graph TD
    A[Supervisor solicita movimiento] --> B[Validar datos del movimiento]
    B --> C{Datos válidos?}
    C -->|NO| D[Mostrar errores]
    C -->|SÍ| E[Enviar a Admin RRHH]
    E --> F[Admin RRHH evalúa]
    F --> G{Movimiento aprobado?}
    G -->|NO| H[Rechazar con observaciones] --> I[Notificar supervisor]
    G -->|SÍ| J[Aprobar movimiento]
    J --> K[Actualizar datos empleado]
    K --> L[Generar período de prueba si aplica]
    L --> M[Auditar cambios]
    M --> N[Notificar todas las partes]
```

#### 🔄 FLUJO 3.3: RENOVACIÓN DE CONTRATO
```mermaid
graph TD
    A[Sistema detecta contrato próximo a vencer] --> B[Generar alerta automática]
    B --> C[Notificar Admin RRHH]
    C --> D[Admin RRHH evalúa renovación]
    D --> E{Renovar contrato?}
    E -->|NO| F[Iniciar proceso de egreso]
    E -->|SÍ| G[Crear nuevo contrato]
    G --> H[Validar continuidad de fechas]
    H --> I[Aprobar renovación]
    I --> J[Auditar proceso]
    J --> K[Notificar empleado]
```

### Tipos de Movimiento
- **Ingreso**: Nuevo empleado al sistema
- **Ascenso**: Promoción a cargo superior
- **Traslado**: Cambio de departamento/gerencia
- **Renovación**: Extensión de contrato existente
- **Cambio Contractual**: Modificación de términos
- **Egreso**: Salida del empleado

---

## ⏱️ MÓDULO 4: GESTIÓN DE PERÍODOS DE PRUEBA

### Propósito
Administrar de manera unificada los períodos de prueba tanto para nuevos ingresos como para movimientos internos, con sistema de alertas y feedback automático.

### Componentes Principales
1. **Registro de Períodos de Prueba**
2. **Sistema de Alertas Automáticas**
3. **Gestión de Feedback**
4. **Evaluación y Confirmación**
5. **Reportes de Seguimiento**

### Flujo de Procesos

#### 🔄 FLUJO 4.1: INICIO DE PERÍODO DE PRUEBA
```mermaid
graph TD
    A[Evento dispara período de prueba] --> B{Tipo de evento?}
    B -->|Nuevo Ingreso| C[Crear período tipo 'ingreso']
    B -->|Movimiento Interno| D[Crear período tipo 'movimiento']
    C --> E[Calcular fecha de finalización]
    D --> E
    E --> F[Asignar supervisor responsable]
    F --> G[Programar alertas automáticas]
    G --> H[Notificar supervisor y empleado]
    H --> I[Auditar creación]
```

#### 🔄 FLUJO 4.2: SISTEMA DE ALERTAS
```mermaid
graph TD
    A[Cron job ejecuta diariamente] --> B[Buscar períodos próximos a vencer]
    B --> C{Hay períodos en 5 días?}
    C -->|NO| D[Finalizar proceso]
    C -->|SÍ| E[Generar alertas]
    E --> F[Notificar supervisor responsable]
    F --> G[Notificar Admin RRHH]
    G --> H[Registrar alerta enviada]
    H --> I[Programar recordatorios]
```

#### 🔄 FLUJO 4.3: EVALUACIÓN Y CONFIRMACIÓN
```mermaid
graph TD
    A[Supervisor recibe alerta] --> B[Acceder a evaluación]
    B --> C[Completar feedback]
    C --> D{Empleado aprobado?}
    D -->|NO| E[Recomendar terminación] --> F[Enviar a Admin RRHH]
    D -->|SÍ| G[Confirmar empleado]
    G --> H[Actualizar estado a 'Activo']
    F --> I[Admin RRHH evalúa recomendación]
    I --> J{Proceder con terminación?}
    J -->|SÍ| K[Iniciar proceso de egreso]
    J -->|NO| L[Extender período de prueba]
    H --> M[Auditar confirmación]
    M --> N[Notificar empleado]
```

### Estados de Período de Prueba
- **Activo**: Período en curso
- **Próximo a Vencer**: 5 días o menos para finalizar
- **Vencido**: Período terminado sin evaluación
- **Aprobado**: Empleado confirmado exitosamente
- **Rechazado**: Empleado no confirmado
- **Extendido**: Período prolongado por decisión administrativa

---

## 🚪 MÓDULO 5: GESTIÓN DE EGRESOS

### Propósito
Administrar el proceso completo de salida de empleados con workflow de aprobaciones, validaciones automáticas y cierre de expedientes.

### Componentes Principales
1. **Solicitud de Egreso**
2. **Workflow de Aprobaciones**
3. **Validaciones Automáticas**
4. **Cierre de Expediente**
5. **Reportes de Egresos**

### Flujo de Procesos

#### 🔄 FLUJO 5.1: SOLICITUD DE EGRESO
```mermaid
graph TD
    A[Supervisor solicita egreso] --> B[Validar datos básicos]
    B --> C{Datos válidos?}
    C -->|NO| D[Mostrar errores]
    C -->|SÍ| E[Verificar empleado activo]
    E --> F{Empleado activo?}
    F -->|NO| G[Error: empleado ya inactivo]
    F -->|SÍ| H[Crear solicitud de egreso]
    H --> I[Asignar estado: 'Solicitado']
    I --> J[Notificar Admin RRHH]
    J --> K[Auditar solicitud]
```

#### 🔄 FLUJO 5.2: PROCESO DE APROBACIÓN
```mermaid
graph TD
    A[Admin RRHH recibe solicitud] --> B[Revisar motivos y documentación]
    B --> C{Aprobar egreso?}
    C -->|NO| D[Rechazar con observaciones] --> E[Notificar supervisor]
    C -->|SÍ| F[Cambiar estado: 'Aprobado']
    F --> G[Verificar entrega de activos]
    G --> H[Ejecutar egreso]
    H --> I[Actualizar estado empleado: 'Inactivo']
    I --> J[Reasignar subordinados]
    J --> K[Desactivar accesos al sistema]
    K --> L[Generar reporte de egreso]
    L --> M[Auditar proceso completo]
    M --> N[Notificar finalización]
```

#### 🔄 FLUJO 5.3: VALIDACIONES AUTOMÁTICAS
```mermaid
graph TD
    A[Sistema valida egreso] --> B[Verificar períodos de prueba activos]
    B --> C{Tiene subordinados en prueba?}
    C -->|SÍ| D[Reasignar supervisión] --> E[Notificar nuevo supervisor]
    C -->|NO| F[Verificar proyectos pendientes]
    F --> G{Proyectos activos?}
    G -->|SÍ| H[Alertar sobre transferencia]
    G -->|NO| I[Proceder con egreso]
    E --> I
    H --> I
```

### Estados de Egreso
- **Solicitado**: Solicitud inicial pendiente de revisión
- **En Revisión**: Admin RRHH evaluando la solicitud
- **Aprobado**: Egreso autorizado, pendiente de ejecución
- **Rechazado**: Solicitud denegada con observaciones
- **Procesado**: Egreso completado exitosamente
- **Cancelado**: Proceso cancelado por solicitud

---

## 📊 MÓDULO 6: DASHBOARD Y REPORTES

### Propósito
Proporcionar visualización de datos en tiempo real, indicadores clave de gestión y reportes personalizados según el rol del usuario.

### Componentes Principales
1. **Dashboard Personalizable**
2. **Indicadores en Tiempo Real**
3. **Sistema de Alertas**
4. **Generador de Reportes**
5. **Exportación de Datos**

### Flujo de Procesos

#### 🔄 FLUJO 6.1: CARGA DE DASHBOARD
```mermaid
graph TD
    A[Usuario accede al dashboard] --> B[Identificar rol del usuario]
    B --> C[Cargar widgets permitidos]
    C --> D[Consultar indicadores en tiempo real]
    D --> E[Verificar alertas pendientes]
    E --> F[Aplicar filtros por departamento/gerencia]
    F --> G[Renderizar dashboard personalizado]
    G --> H[Programar actualización automática]
```

#### 🔄 FLUJO 6.2: GENERACIÓN DE REPORTES
```mermaid
graph TD
    A[Usuario solicita reporte] --> B[Validar permisos de acceso]
    B --> C{Tiene permisos?}
    C -->|NO| D[Error 403: Sin permisos]
    C -->|SÍ| E[Configurar parámetros del reporte]
    E --> F[Validar filtros y fechas]
    F --> G[Ejecutar consulta de datos]
    G --> H[Aplicar formato solicitado]
    H --> I[Generar archivo de exportación]
    I --> J[Auditar generación de reporte]
    J --> K[Entregar reporte al usuario]
```

#### 🔄 FLUJO 6.3: SISTEMA DE ALERTAS
```mermaid
graph TD
    A[Sistema evalúa condiciones] --> B{Hay alertas nuevas?}
    B -->|NO| C[Continuar monitoreo]
    B -->|SÍ| D[Clasificar por prioridad]
    D --> E[Determinar destinatarios]
    E --> F[Enviar notificaciones]
    F --> G[Registrar alertas enviadas]
    G --> H[Actualizar dashboard]
    H --> I[Programar seguimiento]
```

### Widgets por Rol

#### **Gerente RRHH**
- Indicadores ejecutivos generales
- Distribución de empleados por gerencia
- Contratos próximos a vencer (toda la empresa)
- Rotación de personal y tendencias
- Presupuesto de nómina vs. real
- Alertas críticas del sistema

#### **Admin RRHH**
- Empleados en período de prueba
- Solicitudes de egreso pendientes
- Movimientos internos en proceso
- Candidatos en reclutamiento
- Alertas de renovación de contratos
- Reportes de auditoría

#### **Supervisor**
- Equipo directo y estados
- Períodos de prueba de subordinados
- Solicitudes pendientes de aprobación
- Indicadores de productividad del equipo
- Alertas de feedback requerido

#### **Admin IT**
- Usuarios activos y sesiones
- Logs de acceso y errores
- Asignaciones de roles pendientes
- Métricas de sistema
- Reportes de seguridad

### Tipos de Reportes Disponibles
- **Nómina de Empleados**: Lista completa con filtros
- **Movimientos por Período**: Ascensos, traslados, ingresos
- **Egresos Detallados**: Motivos y análisis de rotación
- **Períodos de Prueba**: Estados y resultados
- **Auditoría de Cambios**: Trazabilidad completa
- **Indicadores de Gestión**: KPIs ejecutivos

---

## 🔄 FLUJOS TRANSVERSALES DEL SISTEMA

### FLUJO MAESTRO: CICLO DE VIDA DEL EMPLEADO
```mermaid
graph TD
    A[Candidato registrado] --> B[Evaluación y aprobación]
    B --> C[Ingreso como empleado]
    C --> D[Período de prueba inicial]
    D --> E[Confirmación o terminación]
    E -->|Confirmado| F[Empleado activo]
    E -->|Terminado| G[Egreso del sistema]
    F --> H[Posibles movimientos internos]
    H --> I[Nuevos períodos de prueba]
    I --> J[Continuidad laboral]
    J --> K[Renovaciones de contrato]
    K --> L[Eventual egreso]
    L --> G
```

### FLUJO DE VALIDACIONES AUTOMÁTICAS
```mermaid
graph TD
    A[Cualquier operación en el sistema] --> B[Validar autenticación]
    B --> C[Verificar permisos específicos]
    C --> D[Validar integridad de datos]
    D --> E[Ejecutar reglas de negocio]
    E --> F[Registrar auditoría]
    F --> G[Notificar cambios relevantes]
    G --> H[Actualizar indicadores]
```

### FLUJO DE NOTIFICACIONES
```mermaid
graph TD
    A[Evento del sistema] --> B[Determinar tipo de notificación]
    B --> C[Identificar destinatarios]
    C --> D[Generar mensaje personalizado]
    D --> E[Enviar notificación]
    E --> F[Registrar envío]
    F --> G[Programar seguimiento si es necesario]
```

---

## 🎯 INTEGRACIÓN ENTRE MÓDULOS

### Dependencias Principales
- **Autenticación** → Base para todos los módulos
- **Empleados** → Requerido por Contratos, Períodos de Prueba, Egresos
- **Contratos** → Genera Períodos de Prueba automáticamente
- **Períodos de Prueba** → Puede generar Egresos si no se aprueba
- **Egresos** → Afecta estados en Empleados y reasigna subordinados
- **Dashboard** → Consume datos de todos los módulos

### Eventos de Sistema que Disparan Flujos
1. **Nuevo empleado** → Crea período de prueba automático
2. **Movimiento interno** → Puede crear período de prueba
3. **Período de prueba próximo a vencer** → Genera alertas
4. **Contrato próximo a vencer** → Genera alerta de renovación
5. **Egreso de supervisor** → Reasigna subordinados automáticamente
6. **Cambio de rol** → Actualiza permisos y accesos

Esta definición completa asegura que cada módulo esté perfectamente integrado con flujos de procesos claros, validaciones automáticas y trazabilidad completa de todas las operaciones del sistema.