import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found");
}

const sql = neon(process.env.DATABASE_URL);

// Datos de prueba para la estructura organizacional
const gerenciasData = [
  { name: "Gerencia de Tecnología", description: "Responsable del desarrollo tecnológico y sistemas" },
  { name: "Gerencia de Recursos Humanos", description: "Gestión del talento humano y desarrollo organizacional" },
  { name: "Gerencia Comercial", description: "Ventas, marketing y desarrollo de negocio" },
  { name: "Gerencia de Operaciones", description: "Operaciones y producción de la empresa" },
  { name: "Gerencia Administrativa", description: "Administración, finanzas y contabilidad" },
  { name: "Gerencia de Calidad", description: "Gestión de calidad y mejora continua" }
];

const departamentosData = [
  // Tecnología
  { name: "Desarrollo de Software", gerencia: "Gerencia de Tecnología" },
  { name: "Infraestructura IT", gerencia: "Gerencia de Tecnología" },
  { name: "Soporte Técnico", gerencia: "Gerencia de Tecnología" },
  { name: "Ciberseguridad", gerencia: "Gerencia de Tecnología" },
  
  // RRHH
  { name: "Reclutamiento", gerencia: "Gerencia de Recursos Humanos" },
  { name: "Desarrollo Organizacional", gerencia: "Gerencia de Recursos Humanos" },
  { name: "Compensaciones", gerencia: "Gerencia de Recursos Humanos" },
  
  // Comercial
  { name: "Ventas Corporativas", gerencia: "Gerencia Comercial" },
  { name: "Marketing Digital", gerencia: "Gerencia Comercial" },
  { name: "Atención al Cliente", gerencia: "Gerencia Comercial" },
  
  // Operaciones
  { name: "Producción", gerencia: "Gerencia de Operaciones" },
  { name: "Logística", gerencia: "Gerencia de Operaciones" },
  { name: "Mantenimiento", gerencia: "Gerencia de Operaciones" },
  
  // Administrativa
  { name: "Contabilidad", gerencia: "Gerencia Administrativa" },
  { name: "Finanzas", gerencia: "Gerencia Administrativa" },
  { name: "Compras", gerencia: "Gerencia Administrativa" },
  
  // Calidad
  { name: "Control de Calidad", gerencia: "Gerencia de Calidad" },
  { name: "Mejora Continua", gerencia: "Gerencia de Calidad" }
];

const cargosData = [
  // Tecnología
  { name: "Desarrollador Senior", departamento: "Desarrollo de Software" },
  { name: "Desarrollador Junior", departamento: "Desarrollo de Software" },
  { name: "Tech Lead", departamento: "Desarrollo de Software" },
  { name: "Administrador de Sistemas", departamento: "Infraestructura IT" },
  { name: "Especialista en Redes", departamento: "Infraestructura IT" },
  { name: "Técnico de Soporte", departamento: "Soporte Técnico" },
  { name: "Analista de Seguridad", departamento: "Ciberseguridad" },
  
  // RRHH
  { name: "Especialista en Reclutamiento", departamento: "Reclutamiento" },
  { name: "Analista de RRHH", departamento: "Desarrollo Organizacional" },
  { name: "Coordinador de Compensaciones", departamento: "Compensaciones" },
  
  // Comercial
  { name: "Ejecutivo de Ventas", departamento: "Ventas Corporativas" },
  { name: "Gerente de Cuentas", departamento: "Ventas Corporativas" },
  { name: "Especialista en Marketing", departamento: "Marketing Digital" },
  { name: "Representante de Atención", departamento: "Atención al Cliente" },
  
  // Operaciones
  { name: "Supervisor de Producción", departamento: "Producción" },
  { name: "Operario de Producción", departamento: "Producción" },
  { name: "Coordinador Logístico", departamento: "Logística" },
  { name: "Técnico de Mantenimiento", departamento: "Mantenimiento" },
  
  // Administrativa
  { name: "Contador", departamento: "Contabilidad" },
  { name: "Analista Financiero", departamento: "Finanzas" },
  { name: "Asistente de Compras", departamento: "Compras" },
  
  // Calidad
  { name: "Inspector de Calidad", departamento: "Control de Calidad" },
  { name: "Analista de Procesos", departamento: "Mejora Continua" }
];

// Datos de empleados con roles jerárquicos y estados variados
const empleadosData = [
  // Gerentes y supervisores (roles altos)
  { cedula: "V-12345678", fullName: "María González", email: "maria.gonzalez@empresa.com", phone: "0414-1234567", cargo: "Tech Lead", role: "supervisor", status: "activo" },
  { cedula: "V-23456789", fullName: "Carlos Rodríguez", email: "carlos.rodriguez@empresa.com", phone: "0424-2345678", cargo: "Gerente de Cuentas", role: "gerente_rrhh", status: "activo" },
  { cedula: "V-34567890", fullName: "Ana Martínez", email: "ana.martinez@empresa.com", phone: "0416-3456789", cargo: "Especialista en Reclutamiento", role: "admin_rrhh", status: "activo" },
  { cedula: "V-45678901", fullName: "Luis Pérez", email: "luis.perez@empresa.com", phone: "0426-4567890", cargo: "Supervisor de Producción", role: "supervisor", status: "activo" },
  
  // Desarrolladores y técnicos
  { cedula: "V-56789012", fullName: "Sandra López", email: "sandra.lopez@empresa.com", phone: "0414-5678901", cargo: "Desarrollador Senior", role: "empleado", status: "activo" },
  { cedula: "V-67890123", fullName: "Roberto Silva", email: "roberto.silva@empresa.com", phone: "0424-6789012", cargo: "Desarrollador Junior", role: "empleado", status: "periodo_prueba" },
  { cedula: "V-78901234", fullName: "Carmen Díaz", email: "carmen.diaz@empresa.com", phone: "0416-7890123", cargo: "Administrador de Sistemas", role: "empleado", status: "activo" },
  { cedula: "V-89012345", fullName: "Fernando Castro", email: "fernando.castro@empresa.com", phone: "0426-8901234", cargo: "Analista de Seguridad", role: "empleado", status: "periodo_prueba" },
  
  // Área comercial
  { cedula: "V-90123456", fullName: "Gabriela Morales", email: "gabriela.morales@empresa.com", phone: "0414-9012345", cargo: "Ejecutivo de Ventas", role: "empleado", status: "activo" },
  { cedula: "V-01234567", fullName: "Diego Herrera", email: "diego.herrera@empresa.com", phone: "0424-0123456", cargo: "Especialista en Marketing", role: "empleado", status: "activo" },
  { cedula: "V-12340987", fullName: "Patricia Ruiz", email: "patricia.ruiz@empresa.com", phone: "0416-1234098", cargo: "Representante de Atención", role: "empleado", status: "periodo_prueba" },
  
  // Área operaciones
  { cedula: "V-23451098", fullName: "Miguel Torres", email: "miguel.torres@empresa.com", phone: "0426-2345109", cargo: "Operario de Producción", role: "empleado", status: "activo" },
  { cedula: "V-34562109", fullName: "Elena Vargas", email: "elena.vargas@empresa.com", phone: "0414-3456210", cargo: "Coordinador Logístico", role: "empleado", status: "activo" },
  { cedula: "V-45673210", fullName: "Andrés Mendoza", email: "andres.mendoza@empresa.com", phone: "0424-4567321", cargo: "Técnico de Mantenimiento", role: "empleado", status: "activo" },
  
  // Área administrativa
  { cedula: "V-56784321", fullName: "Lucía Jiménez", email: "lucia.jimenez@empresa.com", phone: "0416-5678432", cargo: "Contador", role: "empleado", status: "activo" },
  { cedula: "V-67895432", fullName: "Ricardo Flores", email: "ricardo.flores@empresa.com", phone: "0426-6789543", cargo: "Analista Financiero", role: "empleado", status: "periodo_prueba" },
  { cedula: "V-78906543", fullName: "Isabel Ramírez", email: "isabel.ramirez@empresa.com", phone: "0414-7890654", cargo: "Asistente de Compras", role: "empleado", status: "activo" },
  
  // Área calidad
  { cedula: "V-89017654", fullName: "Javier Ortega", email: "javier.ortega@empresa.com", phone: "0424-8901765", cargo: "Inspector de Calidad", role: "empleado", status: "activo" },
  { cedula: "V-90128765", fullName: "Mónica Guerrero", email: "monica.guerrero@empresa.com", phone: "0416-9012876", cargo: "Analista de Procesos", role: "empleado", status: "activo" },
  
  // Más empleados con estados variados
  { cedula: "V-01239876", fullName: "Alejandro Ramos", email: "alejandro.ramos@empresa.com", phone: "0426-0123987", cargo: "Técnico de Soporte", role: "empleado", status: "activo" },
  { cedula: "V-12349087", fullName: "Beatriz Sánchez", email: "beatriz.sanchez@empresa.com", phone: "0414-1234908", cargo: "Especialista en Redes", role: "empleado", status: "activo" },
  { cedula: "V-23450198", fullName: "Daniel Vega", email: "daniel.vega@empresa.com", phone: "0424-2345019", cargo: "Analista de RRHH", role: "empleado_captacion", status: "periodo_prueba" },
  { cedula: "V-34561209", fullName: "Valentina Cruz", email: "valentina.cruz@empresa.com", phone: "0416-3456120", cargo: "Coordinador de Compensaciones", role: "empleado", status: "activo" },
  
  // Empleados que tendrán egresos
  { cedula: "V-45672310", fullName: "Raúl Moreno", email: "raul.moreno@empresa.com", phone: "0426-4567231", cargo: "Desarrollador Senior", role: "empleado", status: "activo" },
  { cedula: "V-56783421", fullName: "Claudia Peña", email: "claudia.pena@empresa.com", phone: "0414-5678342", cargo: "Ejecutivo de Ventas", role: "empleado", status: "activo" },
  { cedula: "V-67894532", fullName: "Héctor Salinas", email: "hector.salinas@empresa.com", phone: "0424-6789453", cargo: "Operario de Producción", role: "empleado", status: "activo" },
  
  // Empleados adicionales
  { cedula: "V-78905643", fullName: "Natalia Romero", email: "natalia.romero@empresa.com", phone: "0416-7890564", cargo: "Desarrollador Junior", role: "empleado", status: "periodo_prueba" },
  { cedula: "V-89016754", fullName: "Sebastián Aguilar", email: "sebastian.aguilar@empresa.com", phone: "0426-8901675", cargo: "Especialista en Marketing", role: "empleado", status: "activo" },
  { cedula: "V-90127865", fullName: "Paola Méndez", email: "paola.mendez@empresa.com", phone: "0414-9012786", cargo: "Representante de Atención", role: "empleado", status: "activo" },
  { cedula: "V-01238976", fullName: "Gustavo Reyes", email: "gustavo.reyes@empresa.com", phone: "0424-0123897", cargo: "Inspector de Calidad", role: "empleado", status: "activo" },
  { cedula: "V-12340087", fullName: "Laura Campos", email: "laura.campos@empresa.com", phone: "0416-1234008", cargo: "Contador", role: "empleado", status: "activo" },
  { cedula: "V-23451198", fullName: "Óscar Delgado", email: "oscar.delgado@empresa.com", phone: "0426-2345119", cargo: "Técnico de Mantenimiento", role: "empleado", status: "activo" }
];

// Candidatos para el módulo de reclutamiento
const candidatosData = [
  { cedula: "V-11111111", fullName: "Andrea Molina", email: "andrea.molina@email.com", phone: "0414-1111111", cargo: "Desarrollador Junior", status: "en_evaluacion" },
  { cedula: "V-22222222", fullName: "Francisco León", email: "francisco.leon@email.com", phone: "0424-2222222", cargo: "Ejecutivo de Ventas", status: "aprobado" },
  { cedula: "V-33333333", fullName: "María José Silva", email: "mariajose.silva@email.com", phone: "0416-3333333", cargo: "Analista Financiero", status: "en_evaluacion" },
  { cedula: "V-44444444", fullName: "José Antonio Medina", email: "joseantonio.medina@email.com", phone: "0426-4444444", cargo: "Técnico de Soporte", status: "rechazado" },
  { cedula: "V-55555555", fullName: "Karla Suárez", email: "karla.suarez@email.com", phone: "0414-5555555", cargo: "Especialista en Marketing", status: "contratado" },
  { cedula: "V-66666666", fullName: "Roberto Villalobos", email: "roberto.villalobos@email.com", phone: "0424-6666666", cargo: "Inspector de Calidad", status: "en_evaluacion" },
  { cedula: "V-77777777", fullName: "Stephanie González", email: "stephanie.gonzalez@email.com", phone: "0416-7777777", cargo: "Coordinador Logístico", status: "aprobado" }
];

// Ofertas de trabajo
const ofertasData = [
  {
    titulo: "Desarrollador Full Stack Senior",
    descripcion: "Buscamos desarrollador con experiencia en React, Node.js y PostgreSQL para liderar proyectos tecnológicos.",
    cargo: "Desarrollador Senior",
    experienciaRequerida: "3+ años en desarrollo web full stack",
    educacionRequerida: "Ingeniería en Sistemas o afín",
    habilidadesRequeridas: "React, Node.js, PostgreSQL, Git, metodologías ágiles",
    salarioMinimo: 45000,
    salarioMaximo: 65000,
    tipoContrato: "indefinido",
    modalidadTrabajo: "hibrido",
    ubicacion: "Caracas, Venezuela",
    vacantesDisponibles: 2,
    status: "publicada",
    prioridad: "alta"
  },
  {
    titulo: "Especialista en Marketing Digital",
    descripcion: "Profesional para gestionar campañas digitales, redes sociales y estrategias de marketing online.",
    cargo: "Especialista en Marketing",
    experienciaRequerida: "2+ años en marketing digital",
    educacionRequerida: "Comunicación Social, Marketing o afín",
    habilidadesRequeridas: "Google Ads, Facebook Ads, Analytics, SEO, redes sociales",
    salarioMinimo: 25000,
    salarioMaximo: 35000,
    tipoContrato: "indefinido",
    modalidadTrabajo: "presencial",
    ubicacion: "Valencia, Venezuela",
    vacantesDisponibles: 1,
    status: "publicada",
    prioridad: "media"
  }
];

async function seedDatabase() {
  try {
    console.log("🌱 Iniciando sembrado de base de datos...");

    // 1. Crear usuario administrador
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const adminResult = await sql`
      INSERT INTO users (cedula, password, role, is_active)
      VALUES ('V-87654321', ${adminPasswordHash}, 'admin', true)
      ON CONFLICT (cedula) DO NOTHING
      RETURNING id
    `;
    
    let adminId;
    if (adminResult.length > 0) {
      adminId = adminResult[0].id;
    } else {
      const existingAdmin = await sql`SELECT id FROM users WHERE cedula = 'V-87654321'`;
      adminId = existingAdmin[0].id;
    }

    console.log("✅ Usuario administrador creado");

    // 2. Crear gerencias
    const gerenciasMap = new Map();
    for (const gerencia of gerenciasData) {
      const result = await sql`
        INSERT INTO gerencias (name, description)
        VALUES (${gerencia.name}, ${gerencia.description})
        ON CONFLICT DO NOTHING
        RETURNING id, name
      `;
      if (result.length > 0) {
        gerenciasMap.set(gerencia.name, result[0].id);
      } else {
        const existing = await sql`SELECT id FROM gerencias WHERE name = ${gerencia.name}`;
        if (existing.length > 0) {
          gerenciasMap.set(gerencia.name, existing[0].id);
        }
      }
    }
    console.log("✅ Gerencias creadas");

    // 3. Crear departamentos
    const departamentosMap = new Map();
    for (const departamento of departamentosData) {
      const gerenciaId = gerenciasMap.get(departamento.gerencia);
      if (gerenciaId) {
        const result = await sql`
          INSERT INTO departamentos (name, gerencia_id)
          VALUES (${departamento.name}, ${gerenciaId})
          ON CONFLICT DO NOTHING
          RETURNING id, name
        `;
        if (result.length > 0) {
          departamentosMap.set(departamento.name, result[0].id);
        } else {
          const existing = await sql`SELECT id FROM departamentos WHERE name = ${departamento.name}`;
          if (existing.length > 0) {
            departamentosMap.set(departamento.name, existing[0].id);
          }
        }
      }
    }
    console.log("✅ Departamentos creados");

    // 4. Crear cargos
    const cargosMap = new Map();
    for (const cargo of cargosData) {
      const departamentoId = departamentosMap.get(cargo.departamento);
      if (departamentoId) {
        const result = await sql`
          INSERT INTO cargos (name, departamento_id)
          VALUES (${cargo.name}, ${departamentoId})
          ON CONFLICT DO NOTHING
          RETURNING id, name
        `;
        if (result.length > 0) {
          cargosMap.set(cargo.name, result[0].id);
        } else {
          const existing = await sql`SELECT id FROM cargos WHERE name = ${cargo.name}`;
          if (existing.length > 0) {
            cargosMap.set(cargo.name, existing[0].id);
          }
        }
      }
    }
    console.log("✅ Cargos creados");

    // 5. Crear empleados
    let supervisorId = null;
    for (const empleado of empleadosData) {
      const cargoId = cargosMap.get(empleado.cargo);
      if (!cargoId) continue;

      // Crear usuario para el empleado
      const passwordHash = await bcrypt.hash("123456", 10);
      const userResult = await sql`
        INSERT INTO users (cedula, password, role, is_active)
        VALUES (${empleado.cedula}, ${passwordHash}, ${empleado.role}, true)
        ON CONFLICT (cedula) DO NOTHING
        RETURNING id
      `;

      let userId;
      if (userResult.length > 0) {
        userId = userResult[0].id;
      } else {
        const existing = await sql`SELECT id FROM users WHERE cedula = ${empleado.cedula}`;
        if (existing.length > 0) {
          userId = existing[0].id;
        } else {
          continue;
        }
      }

      // Crear empleado
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 24)); // Entre 0 y 24 meses atrás

      const employeeResult = await sql`
        INSERT INTO employees (user_id, full_name, email, phone, birth_date, cargo_id, supervisor_id, start_date, status)
        VALUES (
          ${userId},
          ${empleado.fullName},
          ${empleado.email},
          ${empleado.phone},
          ${new Date(1980 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)},
          ${cargoId},
          ${supervisorId},
          ${startDate.toISOString().split('T')[0]},
          ${empleado.status}
        )
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `;

      // Asignar supervisor para los próximos empleados (rotación básica)
      if (employeeResult.length > 0 && empleado.role === 'supervisor') {
        supervisorId = employeeResult[0].id;
      }

      // Crear contratos para empleados activos
      if (employeeResult.length > 0 && empleado.status === 'activo') {
        await sql`
          INSERT INTO contracts (employee_id, type, start_date, is_active)
          VALUES (
            ${employeeResult[0].id},
            'indefinido',
            ${startDate.toISOString().split('T')[0]},
            true
          )
          ON CONFLICT DO NOTHING
        `;
      }

      // Crear períodos de prueba para empleados en período de prueba
      if (employeeResult.length > 0 && empleado.status === 'periodo_prueba') {
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 3); // 3 meses de período de prueba

        await sql`
          INSERT INTO probation_periods (employee_id, start_date, end_date, status)
          VALUES (
            ${employeeResult[0].id},
            ${startDate.toISOString().split('T')[0]},
            ${endDate.toISOString().split('T')[0]},
            'activo'
          )
          ON CONFLICT DO NOTHING
        `;
      }
    }
    console.log("✅ Empleados creados");

    // 6. Crear algunos egresos pendientes
    const empleadosParaEgreso = ['V-45672310', 'V-56783421', 'V-67894532'];
    for (const cedula of empleadosParaEgreso) {
      const userResult = await sql`SELECT id FROM users WHERE cedula = ${cedula}`;
      if (userResult.length > 0) {
        const employeeResult = await sql`SELECT id FROM employees WHERE user_id = ${userResult[0].id}`;
        if (employeeResult.length > 0) {
          const fechaSolicitud = new Date();
          fechaSolicitud.setDate(fechaSolicitud.getDate() - Math.floor(Math.random() * 30));

          await sql`
            INSERT INTO egresos (
              employee_id, 
              motivo, 
              fecha_solicitud, 
              solicitado_por, 
              observaciones, 
              status
            )
            VALUES (
              ${employeeResult[0].id},
              'renuncia_voluntaria',
              ${fechaSolicitud.toISOString().split('T')[0]},
              ${userResult[0].id},
              'Solicitud de renuncia voluntaria para buscar nuevas oportunidades profesionales',
              'solicitado'
            )
            ON CONFLICT DO NOTHING
          `;
        }
      }
    }
    console.log("✅ Egresos pendientes creados");

    // 7. Crear candidatos
    for (const candidato of candidatosData) {
      const cargoId = cargosMap.get(candidato.cargo);
      if (!cargoId) continue;

      await sql`
        INSERT INTO candidates (
          cedula, 
          full_name, 
          email, 
          phone, 
          birth_date, 
          cargo_id, 
          status, 
          submitted_by,
          notes
        )
        VALUES (
          ${candidato.cedula},
          ${candidato.fullName},
          ${candidato.email},
          ${candidato.phone},
          ${new Date(1985 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)},
          ${cargoId},
          ${candidato.status},
          ${adminId},
          'Candidato registrado durante el proceso de sembrado de datos'
        )
        ON CONFLICT (cedula) DO NOTHING
      `;
    }
    console.log("✅ Candidatos creados");

    // 8. Crear ofertas de trabajo
    for (const oferta of ofertasData) {
      const cargoId = cargosMap.get(oferta.cargo);
      if (!cargoId) continue;

      const fechaInicio = new Date();
      const fechaCierre = new Date();
      fechaCierre.setMonth(fechaCierre.getMonth() + 2);

      await sql`
        INSERT INTO job_offers (
          titulo,
          descripcion,
          cargo_id,
          experiencia_requerida,
          educacion_requerida,
          habilidades_requeridas,
          salario_minimo,
          salario_maximo,
          tipo_contrato,
          modalidad_trabajo,
          ubicacion,
          fecha_inicio_publicacion,
          fecha_cierre_publicacion,
          vacantes_disponibles,
          status,
          prioridad,
          creado_por,
          notas
        )
        VALUES (
          ${oferta.titulo},
          ${oferta.descripcion},
          ${cargoId},
          ${oferta.experienciaRequerida},
          ${oferta.educacionRequerida},
          ${oferta.habilidadesRequeridas},
          ${oferta.salarioMinimo},
          ${oferta.salarioMaximo},
          ${oferta.tipoContrato},
          ${oferta.modalidadTrabajo},
          ${oferta.ubicacion},
          ${fechaInicio.toISOString().split('T')[0]},
          ${fechaCierre.toISOString().split('T')[0]},
          ${oferta.vacantesDisponibles},
          ${oferta.status},
          ${oferta.prioridad},
          ${adminId},
          'Oferta creada durante el proceso de sembrado de datos'
        )
        ON CONFLICT DO NOTHING
      `;
    }
    console.log("✅ Ofertas de trabajo creadas");

    console.log("🎉 ¡Sembrado de base de datos completado exitosamente!");
    console.log(`
📊 Resumen de datos creados:
- ${gerenciasData.length} Gerencias
- ${departamentosData.length} Departamentos  
- ${cargosData.length} Cargos
- ${empleadosData.length} Empleados
- ${candidatosData.length} Candidatos
- ${ofertasData.length} Ofertas de trabajo
- 3 Egresos pendientes
- Contratos y períodos de prueba asociados

🔑 Credenciales de administrador:
- Cédula: V-87654321
- Contraseña: admin123

👥 Empleados de prueba:
- Contraseña para todos: 123456
    `);

  } catch (error) {
    console.error("❌ Error durante el sembrado:", error);
    throw error;
  }
}

// Ejecutar el sembrado
seedDatabase().catch(console.error);