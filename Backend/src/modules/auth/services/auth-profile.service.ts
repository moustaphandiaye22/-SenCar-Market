import { Inject, Injectable } from '@nestjs/common';

import { APP_MESSAGES } from '../../../common/constants/app-messages';
import { DomainException } from '../../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { AuthUserWithTypeRecord } from '../auth.models';
import { AUTH_REPOSITORY_PORT, AuthRepositoryPort } from '../auth.repository.port';
import { UpdateProfileRequestDto } from '../dto/update-profile-request.dto';
import { UtilisateurResponseDto } from '../dto/utilisateur-response.dto';
import { AuthInputValidator } from '../validation/auth-input.validator';

import { AuthMapper } from './auth.mapper';


/**
 * Auth Profile Service - Single Responsibility for user profile management
 * Handles getting and updating user profiles
 */
@Injectable()
export class AuthProfileService {
  constructor(
    @Inject(AUTH_REPOSITORY_PORT) private readonly repository: AuthRepositoryPort,
    private readonly mapper: AuthMapper,
    private readonly inputValidator: AuthInputValidator,
  ) {}

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(user: AuthenticatedUser): Promise<UtilisateurResponseDto> {
    return this.toUtilisateurResponse(user.userId);
  }

  /**
   * Update current user profile
   */
  async updateProfile(
    user: AuthenticatedUser,
    request: UpdateProfileRequestDto,
  ): Promise<UtilisateurResponseDto> {
    const prenom = this.inputValidator.normalizeOptionalProfileField(request.prenom, 'prenom');
    const nom = this.inputValidator.normalizeOptionalProfileField(request.nom, 'nom');
    const telephone = this.inputValidator.normalizeOptionalProfileField(request.telephone, 'telephone');
    const photoProfilUrl = this.inputValidator.normalizeOptionalProfileField(request.photoProfilUrl, 'photoProfilUrl');

    if (telephone !== undefined) {
      const existing = await this.repository.findUserByTelephone(telephone);
      if (existing && existing.id !== user.userId) {
        throw new DomainException(APP_MESSAGES.phoneAlreadyExists, 409, 'PHONE_ALREADY_USED');
      }
    }

    await this.repository.updateUser(user.userId, {
      ...(prenom !== undefined ? { prenom } : {}),
      ...(nom !== undefined ? { nom } : {}),
      ...(telephone !== undefined ? { telephone } : {}),
      ...(photoProfilUrl !== undefined ? { photoProfilUrl } : {}),
    });

    return this.toUtilisateurResponse(user.userId);
  }

  // Private helpers

  private async mustFindUserWithTypeById(userId: string): Promise<AuthUserWithTypeRecord> {
    const user = await this.repository.findUserWithTypeById(userId);
    if (!user) {
      throw new DomainException(APP_MESSAGES.userNotFound, 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  private async toUtilisateurResponse(userId: string): Promise<UtilisateurResponseDto> {
    const user = await this.mustFindUserWithTypeById(userId);
    return this.mapper.toUtilisateurResponse(user);
  }
}
