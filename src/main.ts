import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');


  app.enableCors({
    origin: '*',
    methods: '*',
  });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  const PORT = parseInt(process.env.PORT || '5156', 10);
  console.log('port: ', PORT);
  await app.listen(PORT);
}
bootstrap();
