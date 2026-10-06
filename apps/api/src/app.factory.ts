import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/http-exception.filter.js';
import type { Env } from './config/env.js';

// Configuración común a main.ts y a las pruebas e2e, para que prueben lo mismo que corre en producción.
export function configureApp(app: INestApplication, env: Env): void {
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: env.WEB_ORIGIN });
  app.useGlobalFilters(new HttpExceptionFilter());

  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Usability Test Dashboard API')
      .setDescription('API del Usability Test Dashboard (Proyecto IHC, Grupo 6)')
      .setVersion('0.0.0')
      .build(),
  );
  SwaggerModule.setup('api/docs', app, documento);
}
