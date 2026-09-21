import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Toutes les routes seront désormais préfixées par /api/v1 — par
  // exemple /auth/login devient /api/v1/auth/login. Posé tôt, avant
  // la config Swagger, pour que la doc générée reflète les vraies URLs.
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('API Ferme')
    .setDescription('Documentation des endpoints backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Swagger reste accessible à /api/docs, hors du préfixe applicatif

  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:5173'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000, '0.0.0.0');
}
bootstrap();