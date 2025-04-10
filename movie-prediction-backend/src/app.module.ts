import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataCollectionModule } from './data-collection/data-collection.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Detectar entorno
        const isDocker = process.env.DOCKER_ENV === 'true';
        const isProduction = process.env.NODE_ENV === 'production';

        // En Docker local, usa el nombre del servicio; en Railway, usa variables de entorno
        const host =
          isDocker && !isProduction
            ? 'postgres' // Nombre del servicio en docker-compose
            : process.env.PGHOST || configService.get('PGHOST') || 'localhost';

        const port = parseInt(process.env.PGPORT || configService.get('PGPORT') || '5432');
        const username = process.env.PGUSER || configService.get('PGUSER') || 'postgres';
        const password = process.env.PGPASSWORD || configService.get('PGPASSWORD') || 'postgres';
        const database = process.env.PGDATABASE || configService.get('PGDATABASE') || 'postgres';

        console.log(`Configuración de base de datos:
          - Host: ${host}
          - Puerto: ${port}
          - Usuario: ${username}
          - Base de datos: ${database}
          - Docker: ${isDocker}
          - Producción: ${isProduction}
        `);

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    // Otros módulos
    DataCollectionModule,
  ],
})
export class AppModule {}
