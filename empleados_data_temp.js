// 4. EMPLEADOS (50 total) - Distribución específica según área
// Cronología: Últimos 18 meses (feb 2024 - ago 2025)

const empleadosData = [
  // === RECURSOS HUMANOS (10 empleados) - ADMINISTRATIVA ===
  // Administración de Personal (5)
  {
    cedula: "V-12345678",
    fullName: "María González Herrera",
    email: "maria.gonzalez@empresa.com",
    phone: "+58 414-1234567",
    birthDate: "1980-03-15",
    cargo: cargoGerenteRRHH,
    role: "gerente_rrhh",
    status: "activo",
    startDate: "2024-02-15",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-23456789",
    fullName: "Carlos Rodríguez Silva",
    email: "carlos.rodriguez@empresa.com",
    phone: "+58 424-2345678",
    birthDate: "1985-07-22",
    cargo: cargoAnalistaRRHH,
    role: "admin_rrhh",
    status: "activo",
    startDate: "2024-03-10",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-34567890",
    fullName: "Elena Martínez Campos",
    email: "elena.martinez@empresa.com",
    phone: "+58 416-3456789",
    birthDate: "1988-11-08",
    cargo: cargoCoordinadorNomina,
    role: "empleado",
    status: "activo",
    startDate: "2024-05-20",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-45678901",
    fullName: "Andrea López Vásquez",
    email: "andrea.lopez@empresa.com",
    phone: "+58 426-4567890",
    birthDate: "1992-04-18",
    cargo: cargoAsistenteRRHH,
    role: "empleado",
    status: "activo",
    startDate: "2024-07-08",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-56789012",
    fullName: "Roberto Pérez Morales",
    email: "roberto.perez@empresa.com",
    phone: "+58 414-5678901",
    birthDate: "1986-12-03",
    cargo: cargoEspecialistaBienestar,
    role: "empleado",
    status: "activo",
    startDate: "2025-01-12",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },

  // Reclutamiento y Selección (5)
  {
    cedula: "V-67890123",
    fullName: "Ana Fernández Torres",
    email: "ana.fernandez@empresa.com",
    phone: "+58 424-6789012",
    birthDate: "1983-09-25",
    cargo: cargoJefeReclutamiento,
    role: "empleado_captacion",
    status: "activo",
    startDate: "2024-04-14",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-78901234",
    fullName: "Miguel Herrera Castro",
    email: "miguel.herrera@empresa.com",
    phone: "+58 416-7890123",
    birthDate: "1987-06-12",
    cargo: cargoReclutadorSenior,
    role: "empleado_captacion",
    status: "activo",
    startDate: "2024-08-25",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-89012345",
    fullName: "Carmen Díaz Ruiz",
    email: "carmen.diaz@empresa.com",
    phone: "+58 426-8901234",
    birthDate: "1991-01-30",
    cargo: cargoReclutadorJunior,
    role: "empleado_captacion",
    status: "periodo_prueba",
    startDate: "2025-07-29",
    probation: true,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-90123456",
    fullName: "Patricia Silva Mendoza",
    email: "patricia.silva@empresa.com",
    phone: "+58 414-9012345",
    birthDate: "1989-08-07",
    cargo: cargoPsicologoOrg,
    role: "empleado",
    status: "activo",
    startDate: "2024-10-03",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-01234567",
    fullName: "Fernando Jiménez Ávila",
    email: "fernando.jimenez@empresa.com",
    phone: "+58 424-0123456",
    birthDate: "1993-05-14",
    cargo: cargoCoordinadorSeleccion,
    role: "empleado",
    status: "periodo_prueba",
    startDate: "2025-07-01",
    probation: true,
    tipoContrato: "indefinido",
    area: "administrativa"
  },

  // === FINANZAS Y CONTABILIDAD (10 empleados) - ADMINISTRATIVA ===
  // Contabilidad General (5)
  {
    cedula: "V-11234567",
    fullName: "Isabel Ramírez González",
    email: "isabel.ramirez@empresa.com",
    phone: "+58 412-1123456",
    birthDate: "1979-02-28",
    cargo: cargoContadorGeneral,
    role: "supervisor",
    status: "activo",
    startDate: "2024-03-05",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-22345678",
    fullName: "José Antonio Vargas",
    email: "jose.vargas@empresa.com",
    phone: "+58 414-2234567",
    birthDate: "1984-11-15",
    cargo: cargoContadorSenior,
    role: "empleado",
    status: "activo",
    startDate: "2024-06-18",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-33456789",
    fullName: "Mariana Castro López",
    email: "mariana.castro@empresa.com",
    phone: "+58 416-3345678",
    birthDate: "1990-09-12",
    cargo: cargoContadorJunior,
    role: "empleado",
    status: "activo",
    startDate: "2025-02-22",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-44567890",
    fullName: "Alexis Moreno Rivas",
    email: "alexis.moreno@empresa.com",
    phone: "+58 426-4456789",
    birthDate: "1987-07-08",
    cargo: cargoAnalistaCostos,
    role: "empleado",
    status: "activo",
    startDate: "2024-09-14",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-55678901",
    fullName: "Gabriela Torres Medina",
    email: "gabriela.torres@empresa.com",
    phone: "+58 412-5567890",
    birthDate: "1994-04-25",
    cargo: cargoAsistenteContable,
    role: "empleado",
    status: "periodo_prueba",
    startDate: "2025-08-10",
    probation: true,
    tipoContrato: "indefinido",
    area: "administrativa"
  },

  // Tesorería y Cobranzas (5)
  {
    cedula: "V-66789012",
    fullName: "Ricardo Delgado Cruz",
    email: "ricardo.delgado@empresa.com",
    phone: "+58 414-6678901",
    birthDate: "1981-12-30",
    cargo: cargoTesorero,
    role: "supervisor",
    status: "activo",
    startDate: "2024-04-08",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-77890123",
    fullName: "Verónica Salazar Reyes",
    email: "veronica.salazar@empresa.com",
    phone: "+58 416-7789012",
    birthDate: "1986-10-17",
    cargo: cargoAnalistaFinanciero,
    role: "empleado",
    status: "activo",
    startDate: "2024-11-25",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-88901234",
    fullName: "Daniel Gutiérrez Paredes",
    email: "daniel.gutierrez@empresa.com",
    phone: "+58 426-8890123",
    birthDate: "1988-03-22",
    cargo: cargoGestorCobranzas,
    role: "empleado",
    status: "activo",
    startDate: "2025-03-18",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-99012345",
    fullName: "Luisa Rojas Hernández",
    email: "luisa.rojas@empresa.com",
    phone: "+58 412-9901234",
    birthDate: "1992-01-09",
    cargo: cargoCajero,
    role: "empleado",
    status: "activo",
    startDate: "2025-05-05",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-10012345",
    fullName: "Andrés Navarro Soto",
    email: "andres.navarro@empresa.com",
    phone: "+58 414-1001234",
    birthDate: "1995-06-13",
    cargo: cargoAsistenteTesoreria,
    role: "empleado",
    status: "periodo_prueba",
    startDate: "2025-07-22",
    probation: true,
    tipoContrato: "indefinido",
    area: "administrativa"
  },

  // === TECNOLOGÍA E INFORMÁTICA (10 empleados) - ADMINISTRATIVA ===
  // Desarrollo de Sistemas (5)
  {
    cedula: "V-20012345",
    fullName: "Diego Mendoza Flores",
    email: "diego.mendoza@empresa.com",
    phone: "+58 416-2001234",
    birthDate: "1982-08-19",
    cargo: cargoGerenteTI,
    role: "supervisor",
    status: "activo",
    startDate: "2024-02-26",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-30012345",
    fullName: "Sandra Aguilar Peña",
    email: "sandra.aguilar@empresa.com",
    phone: "+58 426-3001234",
    birthDate: "1985-05-07",
    cargo: cargoDevSenior,
    role: "empleado",
    status: "activo",
    startDate: "2024-07-12",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-40012345",
    fullName: "Javier Morales Pacheco",
    email: "javier.morales@empresa.com",
    phone: "+58 412-4001234",
    birthDate: "1990-12-16",
    cargo: cargoDevJunior,
    role: "empleado",
    status: "activo",
    startDate: "2025-01-28",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-50012345",
    fullName: "Mónica Vega Ortega",
    email: "monica.vega@empresa.com",
    phone: "+58 414-5001234",
    birthDate: "1989-04-03",
    cargo: cargoAnalistaSistemas,
    role: "empleado",
    status: "activo",
    startDate: "2024-12-09",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-60012345",
    fullName: "Esteban Chávez Luna",
    email: "esteban.chavez@empresa.com",
    phone: "+58 416-6001234",
    birthDate: "1987-09-28",
    cargo: cargoTechLead,
    role: "empleado",
    status: "periodo_prueba",
    startDate: "2025-08-05",
    probation: true,
    tipoContrato: "indefinido",
    area: "administrativa"
  },

  // Soporte Técnico (5)
  {
    cedula: "V-70012345",
    fullName: "Liliana Campos Rivero",
    email: "liliana.campos@empresa.com",
    phone: "+58 426-7001234",
    birthDate: "1983-11-21",
    cargo: cargoJefeSoporte,
    role: "supervisor",
    status: "activo",
    startDate: "2024-05-15",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-80012345",
    fullName: "Oscar Blanco Guerrero",
    email: "oscar.blanco@empresa.com",
    phone: "+58 412-8001234",
    birthDate: "1986-01-14",
    cargo: cargoTecnicoSenior,
    role: "empleado",
    status: "activo",
    startDate: "2024-09-30",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-90012345",
    fullName: "Cristina Fuentes Valdez",
    email: "cristina.fuentes@empresa.com",
    phone: "+58 414-9001234",
    birthDate: "1993-03-11",
    cargo: cargoTecnicoJunior,
    role: "empleado",
    status: "activo",
    startDate: "2025-04-07",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-11012345",
    fullName: "Raúl Serrano Ibáñez",
    email: "raul.serrano@empresa.com",
    phone: "+58 416-1101234",
    birthDate: "1988-07-26",
    cargo: cargoAdminRedes,
    role: "empleado",
    status: "activo",
    startDate: "2024-10-21",
    probation: false,
    tipoContrato: "indefinido",
    area: "administrativa"
  },
  {
    cedula: "V-22012345",
    fullName: "Valeria Suárez García",
    email: "valeria.suarez@empresa.com",
    phone: "+58 426-2201234",
    birthDate: "1991-08-04",
    cargo: cargoEspecialistaSoporte,
    role: "empleado",
    status: "periodo_prueba",
    startDate: "2025-07-15",
    probation: true,
    tipoContrato: "indefinido",
    area: "administrativa"
  },

  // === OPERACIONES (10 empleados) - OPERATIVA ===
  // Producción (5)
  {
    cedula: "V-33012345",
    fullName: "Luis Bermúdez Acosta",
    email: "luis.bermudez@empresa.com",
    phone: "+58 412-3301234",
    birthDate: "1980-02-12",
    cargo: cargoSupervisorProduccion,
    role: "supervisor",
    status: "activo",
    startDate: "2024-02-08", // CONTRATO VENCIDO - Requiere renovación
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 2 // 3 contratos total (inicial + 2 renovaciones)
  },
  {
    cedula: "V-44012345",
    fullName: "Teresa Orozco Villareal",
    email: "teresa.orozco@empresa.com",
    phone: "+58 414-4401234",
    birthDate: "1985-06-29",
    cargo: cargoOperarioSenior,
    role: "empleado",
    status: "activo",
    startDate: "2024-04-15", // PRÓXIMO A VENCER - 30 días
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 1 // 2 contratos total (inicial + 1 renovación)
  },
  {
    cedula: "V-55012345",
    fullName: "Alejandro Ramos Quintero",
    email: "alejandro.ramos@empresa.com",
    phone: "+58 416-5501234",
    birthDate: "1988-10-05",
    cargo: cargoOperarioJunior,
    role: "empleado",
    status: "activo",
    startDate: "2024-08-20", // PRÓXIMO A VENCER - 20 días
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 1 // 2 contratos total
  },
  {
    cedula: "V-66012345",
    fullName: "Gloria Medrano Torres",
    email: "gloria.medrano@empresa.com",
    phone: "+58 426-6601234",
    birthDate: "1992-01-18",
    cargo: cargoTecnicoProduccion,
    role: "empleado",
    status: "activo",
    startDate: "2024-11-12", // VIGENTE
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 0 // 1er contrato
  },
  {
    cedula: "V-77012345",
    fullName: "Héctor Palacios Núñez",
    email: "hector.palacios@empresa.com",
    phone: "+58 412-7701234",
    birthDate: "1990-05-23",
    cargo: cargoAsistenteProduccion,
    role: "empleado",
    status: "activo",
    startDate: "2025-03-10", // VIGENTE
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 0 // 1er contrato
  },

  // Control de Calidad (5)
  {
    cedula: "V-88012345",
    fullName: "Nora Velasco Mejía",
    email: "nora.velasco@empresa.com",
    phone: "+58 414-8801234",
    birthDate: "1984-12-07",
    cargo: cargoJefeCalidad,
    role: "supervisor",
    status: "activo",
    startDate: "2024-03-25", // CONTRATO VENCIDO - Requiere renovación
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 2 // 3 contratos total
  },
  {
    cedula: "V-99012346",
    fullName: "Rubén Castillo Herrera",
    email: "ruben.castillo@empresa.com",
    phone: "+58 416-9901234",
    birthDate: "1987-09-14",
    cargo: cargoInspectorCalidad,
    role: "empleado",
    status: "activo",
    startDate: "2024-06-30", // PRÓXIMO A VENCER - 25 días
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 1 // 2 contratos total
  },
  {
    cedula: "V-10012346",
    fullName: "Silvia Cordero Aguilar",
    email: "silvia.cordero@empresa.com",
    phone: "+58 426-1001234",
    birthDate: "1991-04-16",
    cargo: cargoAnalistaProcesos,
    role: "empleado",
    status: "activo",
    startDate: "2024-10-08", // PRÓXIMO A VENCER - 15 días
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 1 // 2 contratos total
  },
  {
    cedula: "V-20012346",
    fullName: "Eduardo Maldonado Pérez",
    email: "eduardo.maldonado@empresa.com",
    phone: "+58 412-2001234",
    birthDate: "1986-11-02",
    cargo: cargoTecnicoLaboratorio,
    role: "empleado",
    status: "activo",
    startDate: "2025-01-20", // VIGENTE
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 0 // 1er contrato
  },
  {
    cedula: "V-30012346",
    fullName: "Beatriz Santander Rojas",
    email: "beatriz.santander@empresa.com",
    phone: "+58 414-3001234",
    birthDate: "1989-07-19",
    cargo: cargoAuditorCalidad,
    role: "empleado",
    status: "activo",
    startDate: "2025-05-14", // VIGENTE
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 0 // 1er contrato
  },

  // === LOGÍSTICA Y DISTRIBUCIÓN (10 empleados) - OPERATIVA ===
  // Almacén y Inventario (5)
  {
    cedula: "V-40012346",
    fullName: "Francisco Montes Rivera",
    email: "francisco.montes@empresa.com",
    phone: "+58 416-4001234",
    birthDate: "1983-03-27",
    cargo: cargoJefeAlmacen,
    role: "supervisor",
    status: "activo",
    startDate: "2024-01-15", // CONTRATO VENCIDO - Requiere renovación
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 2 // 3 contratos total
  },
  {
    cedula: "V-50012346",
    fullName: "Claudia Espinoza Vargas",
    email: "claudia.espinoza@empresa.com",
    phone: "+58 426-5001234",
    birthDate: "1988-08-11",
    cargo: cargoCoordinadorInventario,
    role: "empleado",
    status: "activo",
    startDate: "2024-05-03", // PRÓXIMO A VENCER - 10 días
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 1 // 2 contratos total
  },
  {
    cedula: "V-60012346",
    fullName: "Iván Torres Jiménez",
    email: "ivan.torres@empresa.com",
    phone: "+58 412-6001234",
    birthDate: "1990-12-24",
    cargo: cargoAlmacenista,
    role: "empleado",
    status: "activo",
    startDate: "2024-09-17", // PRÓXIMO A VENCER - 5 días
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 1 // 2 contratos total
  },
  {
    cedula: "V-70012346",
    fullName: "Paola Guerrero Sánchez",
    email: "paola.guerrero@empresa.com",
    phone: "+58 414-7001234",
    birthDate: "1993-02-06",
    cargo: cargoDespachador,
    role: "empleado",
    status: "activo",
    startDate: "2025-02-28", // VIGENTE
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 0 // 1er contrato
  },
  {
    cedula: "V-80012346",
    fullName: "Samuel Cortés Ramírez",
    email: "samuel.cortes@empresa.com",
    phone: "+58 416-8001234",
    birthDate: "1991-06-15",
    cargo: cargoAuxiliarAlmacen,
    role: "empleado",
    status: "activo",
    startDate: "2025-06-22", // VIGENTE
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 0 // 1er contrato
  },

  // Transporte y Distribución (5)  
  {
    cedula: "V-90012346",
    fullName: "Martín Vílchez Moreno",
    email: "martin.vilchez@empresa.com",
    phone: "+58 426-9001234",
    birthDate: "1982-10-31",
    cargo: cargoJefeTransporte,
    role: "supervisor",
    status: "activo",
    startDate: "2024-04-22", // CONTRATO VENCIDO - Requiere renovación
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 2 // 3 contratos total
  },
  {
    cedula: "V-11012346",
    fullName: "Yolanda Paredes Cruz",
    email: "yolanda.paredes@empresa.com",
    phone: "+58 412-1101234",
    birthDate: "1986-01-08",
    cargo: cargoCoordinadorLogistico,
    role: "empleado",
    status: "activo",
    startDate: "2024-07-05", // PRÓXIMO A VENCER - 12 días
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 1 // 2 contratos total
  },
  {
    cedula: "V-22012346", 
    fullName: "Gustavo Restrepo Díaz",
    email: "gustavo.restrepo@empresa.com",
    phone: "+58 414-2201234",
    birthDate: "1989-05-20",
    cargo: cargoConductor,
    role: "empleado",
    status: "activo",
    startDate: "2024-12-01", // VIGENTE
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 0 // 1er contrato
  },
  {
    cedula: "V-33012346",
    fullName: "Lorena Cabrera Méndez", 
    email: "lorena.cabrera@empresa.com",
    phone: "+58 416-3301234",
    birthDate: "1994-09-03",
    cargo: cargoAuxiliarDespacho,
    role: "empleado",
    status: "activo",
    startDate: "2025-04-18", // VIGENTE
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 0 // 1er contrato
  },
  {
    cedula: "V-44012346",
    fullName: "Armando León Figueroa",
    email: "armando.leon@empresa.com", 
    phone: "+58 426-4401234",
    birthDate: "1987-11-27",
    cargo: cargoControladorFlota,
    role: "empleado",
    status: "activo",
    startDate: "2025-01-09", // VIGENTE
    probation: false,
    tipoContrato: "determinado",
    area: "operativa",
    renovaciones: 0 // 1er contrato
  },

  // === EMPLEADOS CON ASCENSOS/CAMBIOS DE ÁREA (3 empleados) ===
  // Estos empleados tienen historiales de cambio de área operativa → administrativa
  
  // Empleado ascendido de Operaciones → RRHH (determinado → indefinido)
  {
    cedula: "V-55012346",
    fullName: "Rodrigo Medina Salinas",
    email: "rodrigo.medina@empresa.com",
    phone: "+58 412-5501234",
    birthDate: "1986-04-12",
    cargo: cargoAsistenteRRHH, // Cargo actual después del ascenso
    role: "empleado",
    status: "periodo_prueba", // Por ascenso reciente
    startDate: "2024-03-10", // Fecha de ingreso original en Operaciones
    probation: true, // Período de prueba por ascenso
    tipoContrato: "indefinido", // Cambió a indefinido por el ascenso
    area: "administrativa", // Área actual
    ascenso: {
      fechaAscenso: "2025-07-20",
      cargoAnterior: cargoOperarioSenior, // Cargo anterior en Operaciones
      areaAnterior: "operativa"
    },
    renovaciones: 1 // En área operativa tuvo 1 renovación antes del ascenso
  },
  
  // Empleado ascendido de Logística → Tecnología (determinado → indefinido)
  {
    cedula: "V-66012346",
    fullName: "Sofía Herrera Campos",
    email: "sofia.herrera@empresa.com",
    phone: "+58 414-6601234",
    birthDate: "1990-08-25",
    cargo: cargoTecnicoJunior, // Cargo actual después del ascenso
    role: "empleado",
    status: "periodo_prueba", // Por ascenso reciente
    startDate: "2024-06-15", // Fecha de ingreso original en Logística
    probation: true, // Período de prueba por ascenso
    tipoContrato: "indefinido", // Cambió a indefinido por el ascenso
    area: "administrativa", // Área actual
    ascenso: {
      fechaAscenso: "2025-08-01",
      cargoAnterior: cargoAlmacenista, // Cargo anterior en Logística
      areaAnterior: "operativa"
    },
    renovaciones: 1 // En área operativa tuvo 1 renovación antes del ascenso
  },
  
  // Empleado ascendido de Logística → Finanzas (determinado → indefinido)  
  {
    cedula: "V-77012346",
    fullName: "Gabriel Núñez Vásquez",
    email: "gabriel.nunez@empresa.com",
    phone: "+58 416-7701234",
    birthDate: "1988-12-09", 
    cargo: cargoAsistenteContable, // Cargo actual después del ascenso
    role: "empleado",
    status: "activo", // Ya completó período de prueba del ascenso
    startDate: "2024-08-05", // Fecha de ingreso original en Logística
    probation: false, // Ya completó período de prueba
    tipoContrato: "indefinido", // Cambió a indefinido por el ascenso
    area: "administrativa", // Área actual
    ascenso: {
      fechaAscenso: "2025-06-15", // Ascenso hace 2 meses
      cargoAnterior: cargoDespachador, // Cargo anterior en Logística
      areaAnterior: "operativa"
    },
    renovaciones: 2 // En área operativa tuvo 2 renovaciones antes del ascenso
  }
];