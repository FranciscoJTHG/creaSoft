// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import { DataCollectionModule } from './data-collection/data-collection.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Detectar si estamos en Railway (si existe DATABASE_URL)
        const isRailway = !!process.env.DATABASE_URL;

        if (isRailway) {
          // Configuración para Railway usando variables de entorno de Railway
          console.log('Usando configuración de Railway');
          return {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // Considerar cambiarlo a false en producción
          };
        } else {
          // Configuración local usando variables de appConfig
          console.log('Usando configuración local');
          return {
            type: 'postgres',
            host: configService.get('database.host'),
            port: configService.get('database.port'),
            username: configService.get('database.username'),
            password: configService.get('database.password'),
            database: configService.get('database.database'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true, // Solo para desarrollo
          };
        }
      },
    }),
    DataCollectionModule,
    // Otros módulos
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
