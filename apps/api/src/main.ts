import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.factory.js';
import { loadEnv } from './config/env.js';
import { loadEnvFile } from './config/load-env-file.js';

async function bootstrap(): Promise<void> {
  loadEnvFile();
  const env = loadEnv();

  const app = await NestFactory.create(AppModule);
  configureApp(app, env);
  await app.listen(env.API_PORT);
  new Logger('Bootstrap').log(`API lista en http://localhost:${env.API_PORT}/api/v1`);
}

void bootstrap();
