import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
