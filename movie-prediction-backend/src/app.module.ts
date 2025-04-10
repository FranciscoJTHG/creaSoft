import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
        // Prioridad a variables de entorno directas
        const host = process.env.PGHOST || configService.get('PGHOST') || 'localhost';
        const port = parseInt(process.env.PGPORT || configService.get('PGPORT') || '5432');
        const username = process.env.PGUSER || configService.get('PGUSER') || 'postgres';
        const password = process.env.PGPASSWORD || configService.get('PGPASSWORD') || 'postgres';
        const database = process.env.PGDATABASE || configService.get('PGDATABASE') || 'postgres';

        console.log(`Configuración de base de datos:
          - Host: ${host}
          - Puerto: ${port}
          - Usuario: ${username}
          - Base de datos: ${database}
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
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    // Otros módulos
  ],
})
export class AppModule {}
