import { randomInt, randomUUID } from 'crypto';

import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { APP_MESSAGES } from '../../../common/constants/app-messages';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { addMinutes } from '../../../common/utils/date.util';
import { AUTH_CONFIG } from '../../../config/auth.config';
import { AuthUserWithTypeRecord } from '../auth.models';
import { AUTH_REPOSITORY_PORT, AuthRepositoryPort } from '../auth.repository.port';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { JwtTokenService } from '../jwt.service';
import { OtpType } from '../types/otp-type';
import { AuthInputValidator } from '../validation/auth-input.validator';

import { AuthMapper } from './auth.mapper';

/**
 * Auth Registration Service - Single Responsibility for user registration
 * Handles new user creation and initial setup
 */
@Injectable()
export class AuthRegistrationService {
  private readonly logger = new Logger(AuthRegistrationService.name);

  constructor(
    @Inject(AUTH_REPOSITORY_PORT) private readonly repository: AuthRepositoryPort,
    private readonly jwtService: JwtTokenService,
    private readonly configService: ConfigService,
    private readonly inputValidator: AuthInputValidator,
    private readonly mapper: AuthMapper,
  ) {}

  /**
   * Register a new user
   */
  async register(request: RegisterRequestDto): Promise<AuthResponseDto> {
    await this.validateUniqueCredentials(request.email, request.telephone);
    const typeUtilisateur = await this.resolveRegistrationType(request.typeUtilisateur);

    const hashedPassword = await bcrypt.hash(request.motDePasse, AUTH_CONFIG.BCRYPT_ROUNDS);

    const user = await this.repository.createUser({
      id: randomUUID(),
      email: this.inputValidator.normalizeEmail(request.email),
      telephone: this.inputValidator.normalizeTelephone(request.telephone),
      motDePasseHash: hashedPassword,
      prenom: this.inputValidator.normalizePrenom(request.prenom),
      nom: this.inputValidator.normalizeNom(request.nom),
      emailVerifie: false,
      telephoneVerifie: false,
      doubleAuthActive: false,
      typeUtilisateur: {
        connect: { id: typeUtilisateur.id },
      },
    });

    await this.generateOtp(user.id, user.email, 'VERIFICATION_EMAIL');

    const tokens = this.jwtService.generateTokens({
      userId: user.id,
      email: user.email,
      typeUtilisateur: typeUtilisateur.nom,
    });

    return {
      ...tokens,
      utilisateur: await this.toUtilisateurResponse(user.id),
    };
  }

  // Private helpers

  private async validateUniqueCredentials(email: string, telephone: string): Promise<void> {
    const normalizedEmail = this.inputValidator.normalizeEmail(email);
    const normalizedTelephone = this.inputValidator.normalizeTelephone(telephone);
    const [emailExists, phoneExists] = await Promise.all([
      this.repository.findUserByEmail(normalizedEmail),
      this.repository.findUserByTelephone(normalizedTelephone),
    ]);

    if (emailExists) {
      throw new DomainException(APP_MESSAGES.emailAlreadyExists, 409, 'REGISTRATION_EMAIL_EXISTS');
    }

    if (phoneExists) {
      throw new DomainException(APP_MESSAGES.phoneAlreadyExists, 409, 'REGISTRATION_PHONE_EXISTS');
    }
  }

  private async resolveRegistrationType(userType: string) {
    const normalizedType = this.inputValidator.normalizeRegistrationType(userType);

    const typeUtilisateur = await this.repository.findTypeUtilisateurByNom(normalizedType);
    if (!typeUtilisateur) {
      throw new DomainException(APP_MESSAGES.invalidSystemUserType, 500, 'REGISTRATION_SYSTEM_INVALID_TYPE');
    }

    return typeUtilisateur;
  }

  private async generateOtp(
    utilisateurId: string,
    email: string,
    type: OtpType,
  ): Promise<void> {
    await this.repository.deleteUnusedOtpByType(utilisateurId, type);

    const code = this.generateRandomOtp();

    await this.repository.createOtp({
      id: randomUUID(),
      utilisateur: { connect: { id: utilisateurId } },
      code,
      type,
      expiration: addMinutes(new Date(), AUTH_CONFIG.OTP.EXPIRATION_MINUTES),
      utilise: false,
      tentatives: 0,
    });

    const emailEnabled = AUTH_CONFIG.OTP.EMAIL_ENABLED;
    if (emailEnabled) {
      this.logger.log(`OTP generated for ${email}`);
    }
  }

  private generateRandomOtp(): string {
    return Array.from({ length: AUTH_CONFIG.OTP.CODE_LENGTH }, () => randomInt(0, 10).toString()).join('');
  }

  private async mustFindUserWithTypeById(userId: string): Promise<AuthUserWithTypeRecord> {
    const user = await this.repository.findUserWithTypeById(userId);
    if (!user) {
      throw new DomainException(APP_MESSAGES.userNotFound, 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  private async toUtilisateurResponse(userId: string) {
    const user = await this.mustFindUserWithTypeById(userId);
    return this.mapper.toUtilisateurResponse(user);
  }
}
