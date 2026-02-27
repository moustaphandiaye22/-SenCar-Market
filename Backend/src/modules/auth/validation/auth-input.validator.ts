import { Injectable } from '@nestjs/common';

import { APP_MESSAGES } from '../../../common/constants/app-messages';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { ALLOWED_USER_TYPES, RESTRICTED_USER_TYPES } from '../types/user-type';

@Injectable()
export class AuthInputValidator {
  normalizeEmail(value: string): string {
    return value.trim().toLowerCase();
  }

  normalizeTelephone(value: string): string {
    return value.trim();
  }

  normalizeNom(value: string): string {
    return value.trim();
  }

  normalizePrenom(value: string): string {
    return value.trim();
  }

  normalizeIdentifiant(value: string): string {
    return value.trim();
  }

  normalizeOtpCode(value: string): string {
    return value.trim();
  }

  normalizeRegistrationType(userType: string): string {
    const normalizedType = userType.trim().toUpperCase();

    if (!normalizedType) {
      throw new DomainException(APP_MESSAGES.userTypeRequired, 400, 'REGISTRATION_USER_TYPE_REQUIRED');
    }

    if (RESTRICTED_USER_TYPES.includes(normalizedType as (typeof RESTRICTED_USER_TYPES)[number])) {
      throw new DomainException(APP_MESSAGES.restrictedUserType, 400, 'REGISTRATION_RESTRICTED_TYPE');
    }

    if (!ALLOWED_USER_TYPES.includes(normalizedType as (typeof ALLOWED_USER_TYPES)[number])) {
      throw new DomainException(
        `${APP_MESSAGES.invalidUserTypePrefix}${ALLOWED_USER_TYPES.join(', ')}`,
        400,
        'REGISTRATION_INVALID_TYPE',
      );
    }

    return normalizedType;
  }

  normalizeOptionalProfileField(value: string | undefined, fieldName: string): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.trim();
    if (!normalized) {
      throw new DomainException(
        `${APP_MESSAGES.profileFieldCannotBeBlankPrefix}${fieldName}`,
        400,
        'AUTH_PROFILE_FIELD_EMPTY',
      );
    }

    return normalized;
  }
}
