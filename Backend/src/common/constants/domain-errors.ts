import { HTTP_STATUS, type HttpStatusCode } from './http-status-codes';

type DomainErrorDefinition = {
  statusCode: HttpStatusCode;
  message: string;
};

export const DOMAIN_ERROR_DEFINITIONS: Record<string, DomainErrorDefinition> = {
  FORBIDDEN: {
    statusCode: HTTP_STATUS.FORBIDDEN,
    message: 'Accès refusé',
  },
  USER_NOT_FOUND: {
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: 'Utilisateur non trouvé',
  },
  AUTH_INVALID_CREDENTIALS: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    message: 'Identifiants invalides.',
  },
  AUTH_REFRESH_TOKEN_INVALID: {
    statusCode: HTTP_STATUS.UNAUTHORIZED,
    message: 'Jeton de rafraîchissement invalide ou expiré.',
  },
  REGISTRATION_EMAIL_EXISTS: {
    statusCode: HTTP_STATUS.CONFLICT,
    message: "L'email existe déjà. Veuillez utiliser un autre email.",
  },
  REGISTRATION_PHONE_EXISTS: {
    statusCode: HTTP_STATUS.CONFLICT,
    message: 'Ce numéro de téléphone est déjà utilisé.',
  },
  PHONE_ALREADY_USED: {
    statusCode: HTTP_STATUS.CONFLICT,
    message: 'Ce numéro de téléphone est déjà utilisé.',
  },
  ACCESS_DENIED_RESOURCE: {
    statusCode: HTTP_STATUS.FORBIDDEN,
    message: 'Accès refusé',
  },
  ACCESS_DENIED_ANNONCE: {
    statusCode: HTTP_STATUS.FORBIDDEN,
    message: 'Accès refusé à cette annonce.',
  },
  ACCESS_DENIED_RESERVATION: {
    statusCode: HTTP_STATUS.FORBIDDEN,
    message: 'Accès refusé à cette réservation.',
  },
  ACCESS_DENIED_NOTIFICATIONS: {
    statusCode: HTTP_STATUS.FORBIDDEN,
    message: 'Accès refusé à ces notifications.',
  },
};

const inferStatusFromCode = (errorCode: string): HttpStatusCode | null => {
  if (errorCode.endsWith('_NOT_FOUND')) return HTTP_STATUS.NOT_FOUND;
  if (errorCode.endsWith('_EXISTS') || errorCode.includes('ALREADY_')) return HTTP_STATUS.CONFLICT;
  if (errorCode.includes('FORBIDDEN') || errorCode.startsWith('ACCESS_DENIED')) return HTTP_STATUS.FORBIDDEN;
  if (errorCode.startsWith('AUTH_') && errorCode.includes('INVALID')) return HTTP_STATUS.UNAUTHORIZED;
  if (errorCode.includes('INVALID_STORED') || errorCode.includes('SYSTEM_')) return HTTP_STATUS.INTERNAL_SERVER_ERROR;
  return null;
};

export const resolveDomainError = (
  errorCode: string | undefined,
  fallbackMessage: string | undefined,
  fallbackStatusCode: number | undefined,
): DomainErrorDefinition => {
  if (errorCode && DOMAIN_ERROR_DEFINITIONS[errorCode]) {
    return DOMAIN_ERROR_DEFINITIONS[errorCode];
  }

  const inferredStatus = errorCode ? inferStatusFromCode(errorCode) : null;
  return {
    statusCode: (inferredStatus ?? fallbackStatusCode ?? HTTP_STATUS.BAD_REQUEST) as HttpStatusCode,
    message: fallbackMessage ?? 'Erreur métier.',
  };
};
