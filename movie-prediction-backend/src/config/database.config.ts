import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

// Versión corregida del archivo
export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'movie_prediction',
    // Usa búsqueda de entidades en lugar de importaciones directas
    entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
    synchronize: process.env.NODE_ENV !== 'production',
  }),
);
