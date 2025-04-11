/* eslint-disable */
// Añade esta sección al INICIO de tu archivo main.ts (antes de cualquier otro import)
import * as crypto from 'crypto';

// Agregar crypto al objeto global
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Movie Prediction API')
    .setDescription('API para predicción de películas basada en datos de TMDB')
    .setVersion('1.0')
    .addServer('https://creasoft-production.up.railway.app/api', 'Production') // Añadir /api aquí
    .addServer('http://localhost:8000/api', 'Local') // También para desarrollo local
    .addTag('movies')
    .addBearerAuth() // Si usas autenticación JWT
    .build();
    

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Accesible en /api/docs

  // Configurar validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configurar CORS para permitir solicitudes desde tu frontend
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Puerto desde configuración
  const port = process.env.PORT || 8080;

  await app.listen(port, '0.0.0.0'); // '0.0.0.0' para permitir conexiones desde fuera del contenedor
  console.log(`Application running on port ${port}`);
  
}
bootstrap();
