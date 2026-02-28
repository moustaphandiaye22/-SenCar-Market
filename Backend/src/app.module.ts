import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { SharedUserService } from './common/services/shared-user.service';
import { AbonnementModule } from './modules/abonnement/abonnement.module';
import { AdminModule } from './modules/admin/admin.module';
import { AssuranceModule } from './modules/assurance/assurance.module';
import { AuthModule } from './modules/auth/auth.module';
import { AvisModule } from './modules/avis/avis.module';
import { CertificationModule } from './modules/certification/certification.module';
import { GarageModule } from './modules/garage/garage.module';
import { HealthModule } from './modules/health/health.module';
import { LocationModule } from './modules/location/location.module';
import { MessagerieModule } from './modules/messagerie/messagerie.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PaiementModule } from './modules/paiement/paiement.module';
import { TradeInModule } from './modules/tradein/tradein.module';
import { VehiculeModule } from './modules/vehicule/vehicule.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 50,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 200,
      },
      {
        // Strict rate limiting for auth endpoints (login, register, OTP)
        name: 'auth',
        ttl: 900000, // 15 minutes
        limit: 30,   // 30 attempts per 15 minutes
      },
      {
        // Rate limiting for payment webhooks
        name: 'webhook',
        ttl: 60000, // 1 minute
        limit: 120, // 120 requests per minute
      },
    ]),
    PrismaModule,
    HealthModule,
    AdminModule,
    AssuranceModule,
    AuthModule,
    AvisModule,
    CertificationModule,
    GarageModule,
    VehiculeModule,
    LocationModule,
    PaiementModule,
    AbonnementModule,
    NotificationModule,
    MessagerieModule,
    TradeInModule,
  ],
  providers: [SharedUserService],
})
export class AppModule {}
