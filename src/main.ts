import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { corsConfig } from './config/cors.config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { pipesConfig } from './utils/pipes-config';

async function bootstrap() {
  const { PORT } = process.env;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe(pipesConfig));
  app.enableCors(corsConfig);
  app.use(cookieParser());
  await app.listen(PORT);
}
bootstrap();
