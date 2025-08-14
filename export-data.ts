
import { neon } from '@neondatabase/serverless';
import fs from 'fs';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found");
}

const sql = neon(process.env.DATABASE_URL);

async function exportDatabase() {
  try {
    console.log("🔄 Iniciando exportación de base de datos...");

    // Exportar todas las tablas
    const tables = [
      'users', 'employees', 'gerencias', 'departamentos', 'cargos',
      'contracts', 'candidates', 'probation_periods', 'egresos',
      'job_offers', 'job_applications', 'audit_logs'
    ];

    const exportData: any = {};

    for (const table of tables) {
      try {
        const data = await sql`SELECT * FROM ${sql.unsafe(table)}`;
        exportData[table] = data;
        console.log(`✅ Exportada tabla: ${table} (${data.length} registros)`);
      } catch (error) {
        console.log(`⚠️  Tabla ${table} no existe o está vacía`);
        exportData[table] = [];
      }
    }

    // Guardar como JSON
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database-export-${timestamp}.json`;
    
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    
    console.log(`🎉 Exportación completada: ${filename}`);
    console.log(`📊 Resumen:`);
    
    for (const [table, data] of Object.entries(exportData)) {
      console.log(`- ${table}: ${(data as any[]).length} registros`);
    }

  } catch (error) {
    console.error("❌ Error durante la exportación:", error);
    throw error;
  }
}

exportDatabase().catch(console.error);
