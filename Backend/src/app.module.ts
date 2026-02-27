import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

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
})
export class AppModule {}
