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
        // Debug: Mostrar las variables de entorno disponibles
        console.log('Verificando variables de entorno:');
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Disponible' : 'No disponible');
        console.log('PGHOST:', process.env.PGHOST ? 'Disponible' : 'No disponible');
        console.log('PGUSER:', process.env.PGUSER ? 'Disponible' : 'No disponible');

        // Mejor detección del entorno Railway
        const isRailway = !!(
          process.env.DATABASE_URL ||
          (process.env.PGHOST && process.env.PGUSER)
        );

        if (isRailway) {
          console.log('╔══════════════════════════════════════╗');
          console.log('║         RAILWAY ENVIRONMENT          ║');
          console.log('╚══════════════════════════════════════╝');

          // Si tenemos DATABASE_URL, usarlo directamente
          if (process.env.DATABASE_URL) {
            return {
              type: 'postgres',
              url: process.env.DATABASE_URL,
              entities: [__dirname + '/**/*.entity{.ts,.js}'],
              synchronize: true,
              ssl: { rejectUnauthorized: false },
            };
          }
          // Si tenemos variables individuales
          else {
            return {
              type: 'postgres',
              host: process.env.PGHOST,
              port: parseInt(process.env.PGPORT || '5432'),
              username: process.env.PGUSER,
              password: process.env.PGPASSWORD,
              database: process.env.PGDATABASE,
              entities: [__dirname + '/**/*.entity{.ts,.js}'],
              synchronize: true,
              ssl: { rejectUnauthorized: false },
            };
          }
        } else {
          console.log('╔══════════════════════════════════════╗');
          console.log('║          LOCAL ENVIRONMENT           ║');
          console.log('╚══════════════════════════════════════╝');

          return {
            type: 'postgres',
            host: configService.get('database.host'),
            port: configService.get('database.port'),
            username: configService.get('database.username'),
            password: configService.get('database.password'),
            database: configService.get('database.database'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
          };
        }
      },
    }),
    DataCollectionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
