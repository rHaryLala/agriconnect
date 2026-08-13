import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  //Instanciation du module racine
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

  app.useGlobalPipes(
      // applique ce pipe à TOUTES les routes de l'application, sans le répéter partout
    new ValidationPipe({
       // supprime automatiquement les champs du body qui ne sont pas déclarés dans le DTO
      whitelist: true,
       
      // renvoie une erreur 400 si un champ non déclaré est envoyé (au lieu de le supprimer silencieusement)
      forbidNonWhitelisted: true,
      
      // convertit automatiquement les types (ex: un "123" dans l'URL devient le number 123)
      transform: true,
    }),
  )
}
bootstrap();
