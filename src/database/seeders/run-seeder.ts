import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../config/data-source';
import { seedInitialData } from './initial-data.seeder';

async function runSeeder() {
  console.log('🚀 Conectando a la base de datos...');
  
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('✅ Conexión establecida\n');

    await seedInitialData(dataSource);

    await dataSource.destroy();
    console.log('👋 Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runSeeder();

