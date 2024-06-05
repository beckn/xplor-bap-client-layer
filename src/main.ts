import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';

async function bootstrap() {
  // Create a Nest application instance
  // const app = await NestFactory.create(AppModule, { cors: true });
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  // Use Helmet to secure the application by setting various HTTP headers
  app.use(helmet());
  // Use the built-in ValidationPipe for class-based validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // Retrieve the ConfigService to access environment variables
  const configService = app.get(ConfigService);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Set a global prefix for all routes, excluding specified routes
  app.setGlobalPrefix('api', { exclude: ['/', '/health', '/e-auth/callback', '/applicationForm'] });

  // Configure Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Implementation API')
    .setDescription('This API is root for all other Implementation APIs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  // Start the application on the port specified in the environment variables
  await app.listen(configService.get<string>('port'));
}

// Bootstrap the application}

bootstrap();
