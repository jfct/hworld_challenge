import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // Import Swagger
import { AppConfig } from './app.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // Added to allow partial type DTOs
      skipMissingProperties: true,
    }),
  );
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Record API')
    .setDescription('The record management API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(AppConfig.port);
}
bootstrap();
