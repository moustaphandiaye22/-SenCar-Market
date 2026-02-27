import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { buildCorsOptions } from './common/security/cors.config';
import { createInMemoryRateLimiter } from './common/security/rate-limit.util';
import { securityHeadersMiddleware } from './common/security/security-headers.middleware';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  app.setGlobalPrefix('api');
  app.enableCors(buildCorsOptions());
  expressApp.disable('x-powered-by');
  app.use(securityHeadersMiddleware);

  const authLimiter = createInMemoryRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: "Trop de tentatives d'authentification. Reessayez plus tard.",
  });
  app.use(
    [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/verify-otp',
      '/api/auth/resend-otp',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/refresh',
    ],
    authLimiter,
  );

  const webhookLimiter = createInMemoryRateLimiter({
    windowMs: 60 * 1000,
    max: 120,
    message: "Trop d'appels webhook en peu de temps.",
  });
  app.use(['/api/paiements/webhook/wave', '/api/paiements/webhook/orange-money'], webhookLimiter);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sen-Car Market API (NestJS)')
    .setDescription('API Sen-Car Market  NestJS')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  const port = Number(process.env.PORT ?? '8082');
  await app.listen(port);
}

void bootstrap();
