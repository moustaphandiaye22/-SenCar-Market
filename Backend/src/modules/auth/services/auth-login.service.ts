import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { APP_MESSAGES } from '../../../common/constants/app-messages';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { AUTH_CONFIG } from '../../../config/auth.config';
import { AuthUserWithTypeRecord } from '../auth.models';
import { AUTH_REPOSITORY_PORT, AuthRepositoryPort } from '../auth.repository.port';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token-request.dto';
import { JwtTokenService } from '../jwt.service';
import { AuthInputValidator } from '../validation/auth-input.validator';

import { AuthMapper } from './auth.mapper';


/**
 * Auth Login Service - Single Responsibility for authentication
 * Handles login, token refresh, and password change
 */
@Injectable()
export class AuthLoginService {
  constructor(
    @Inject(AUTH_REPOSITORY_PORT) private readonly repository: AuthRepositoryPort,
    private readonly jwtService: JwtTokenService,
    private readonly mapper: AuthMapper,
    private readonly inputValidator: AuthInputValidator,
  ) {}

  /**
   * Authenticate user and generate tokens
   */
  async login(request: LoginRequestDto): Promise<AuthResponseDto> {
    const identifiant = this.inputValidator.normalizeIdentifiant(request.identifiant);
    const user = await this.repository.findUserByEmailOrTelephone(identifiant);

    if (!user) {
      throw new DomainException(APP_MESSAGES.invalidCredentials, 401, 'AUTH_INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(request.motDePasse, user.mot_de_passe_hash);
    if (!isPasswordValid) {
      throw new DomainException(APP_MESSAGES.invalidCredentials, 401, 'AUTH_INVALID_CREDENTIALS');
    }

    const updated = await this.repository.updateUser(user.id, {
      derniere_connexion: new Date(),
    } as any);
    const updatedWithType = await this.mustFindUserWithTypeById(updated.id);

    const tokens = this.jwtService.generateTokens({
      userId: updatedWithType.id,
      email: updatedWithType.email,
      typeUtilisateur: updatedWithType.type_utilisateur?.nom ?? null,
    });

    return {
      ...tokens,
      utilisateur: this.mapToUtilisateurResponse(updatedWithType),
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(request: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    const payload = this.jwtService.verifyRefreshToken(request.refreshToken);
    const user = await this.repository.findUserByEmail(payload.email);

    if (!user) {
      throw new DomainException(APP_MESSAGES.userNotFound, 404, 'USER_NOT_FOUND');
    }
    const userWithType = await this.mustFindUserWithTypeById(user.id);

    const tokens = this.jwtService.generateTokens({
      userId: userWithType.id,
      email: userWithType.email,
      typeUtilisateur: userWithType.type_utilisateur?.nom ?? null,
    });

    return {
      ...tokens,
      utilisateur: this.mapToUtilisateurResponse(userWithType),
    };
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const currentUser = await this.mustFindUserById(userId);
    const valid = await bcrypt.compare(currentPassword, currentUser.mot_de_passe_hash);

    if (!valid) {
      throw new DomainException(APP_MESSAGES.currentPasswordInvalid, 400, 'AUTH_CURRENT_PASSWORD_INVALID');
    }
    const isSamePassword = await bcrypt.compare(newPassword, currentUser.mot_de_passe_hash);
    if (isSamePassword) {
      throw new DomainException(APP_MESSAGES.newPasswordMustDiffer, 400, 'AUTH_PASSWORD_REUSE_FORBIDDEN');
    }

    const hashedPassword = await bcrypt.hash(newPassword, AUTH_CONFIG.BCRYPT_ROUNDS);
    await this.repository.updateUser(currentUser.id, {
      mot_de_passe_hash: hashedPassword,
    } as any);
  }

  // Private helpers

  private async mustFindUserById(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new DomainException(APP_MESSAGES.userNotFound, 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  private async mustFindUserWithTypeById(userId: string): Promise<AuthUserWithTypeRecord> {
    const user = await this.repository.findUserWithTypeById(userId);
    if (!user) {
      throw new DomainException(APP_MESSAGES.userNotFound, 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  private mapToUtilisateurResponse(user: AuthUserWithTypeRecord) {
    return this.mapper.toUtilisateurResponse(user);
  }
}
