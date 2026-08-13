import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Configuration de la doc Swagger
  const config = new DocumentBuilder()
  .setTitle('API Ferme')
  .setDescription('Documentation des endpoints backend')
  .setVersion('1.0')
  .addBearerAuth() // permet de tester les routes protégées par JWT directement dans Swagger
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document) //accessible sur api/docs

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
  
  await app.listen(3000);

}
bootstrap();
