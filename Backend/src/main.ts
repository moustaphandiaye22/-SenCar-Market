import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import { buildCorsOptions } from './common/security/cors.config';
import { securityHeadersMiddleware, httpsRedirectMiddleware } from './common/security/security-headers.middleware';
import { applySwaggerDbExamples, loadSwaggerDbExamples } from './common/swagger/swagger-db-examples';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // CORS configuration
  app.enableCors(buildCorsOptions());

  // Disable X-Powered-By header
  expressApp.disable('x-powered-by');

  // Security headers (Helmet + custom)
  app.use(securityHeadersMiddleware);

  // HTTPS redirect in production
  if (process.env.NODE_ENV === 'production') {
    app.use(httpsRedirectMiddleware);
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sen-Car Market API')
    .setDescription(`
Bienvenue sur l'API Sen-Car Market - La plateforme de référence pour l'achat, la vente et la location de véhicules au Sénégal.




    `)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrer le token JWT',
        in: 'header',
      },
    )
    .addTag(
      'Authentication',
      'Gestion des utilisateurs - inscription, connexion, mot de passe',
    )
    .addTag('Administration', 'Tableau de bord et gestion admin')
    .addTag('Véhicules', 'Annonces de véhicules - vente et location')
    .addTag('Garages', 'Services garages et mécaniques')
    .addTag('Assurances', 'Produits et souscriptions d\'assurance')
    .addTag('Locations', 'Gestion des locations de véhicules')
    .addTag('Paiements', 'Wave, Orange Money, Escrow')
    .addTag('Abonnements', 'Plans premium et boosts')
    .addTag('Notifications', 'Notifications push et email')
    .addTag('Signalements', 'Signalements de contenu')
    .addTag('Messagerie', 'Conversations et messages')
    .addTag('Trade-In', 'Échange de véhicules')
    .addTag('Avis et Notes', 'Avis et évaluations')
    .addTag('Certifications', 'Certifications véhicules')
    .addServer('http://localhost:3000', 'Serveur local')
    .addServer('http://localhost:8082', 'Serveur local Docker')
    .addServer('https://sencar-market.onrender.com', 'Serveur production')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  try {
    const prisma = app.get(PrismaService);
    const examples = await loadSwaggerDbExamples(prisma);
    applySwaggerDbExamples(document, examples);
  } catch {
    // Keep Swagger available even when database-derived examples are not available.
  }
  
  // Swagger documentation - schemas are kept for proper API documentation
  
  SwaggerModule.setup('swagger', app, document);

  const port = Number(process.env.PORT ?? '3000');
  await app.listen(port);
}

void bootstrap();
