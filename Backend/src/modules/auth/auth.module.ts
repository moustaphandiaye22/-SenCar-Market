import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AUTH_REPOSITORY_PORT } from './auth.repository.port';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt.service';
import { AuthLoginService } from './services/auth-login.service';
import { AuthOtpService } from './services/auth-otp.service';
import { AuthProfileService } from './services/auth-profile.service';
import { AuthRegistrationService } from './services/auth-registration.service';
import { AuthMapper } from './services/auth.mapper';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthInputValidator } from './validation/auth-input.validator';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('Configuration JWT_SECRET manquante');
        }

        return { secret };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    // Main facade service
    AuthService,
    // Core infrastructure
    AuthRepository,
    JwtTokenService,
    JwtStrategy,
    AuthInputValidator,
    AuthMapper,
    // Specialized services (SRP)
    AuthRegistrationService,
    AuthLoginService,
    AuthOtpService,
    AuthProfileService,
    {
      provide: AUTH_REPOSITORY_PORT,
      useExisting: AuthRepository,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
