import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { APP_MESSAGES } from '../../common/constants/app-messages';
import { DomainException } from '../../common/exceptions/domain.exception';

type TokenPayload = {
  userId: string;
  email: string;
  typeUtilisateur: string | null;
};

const durationToSeconds = (value: string): number => {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    return 24 * 60 * 60;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 24 * 60 * 60;
    default:
      return 24 * 60 * 60;
  }
};

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateTokens(payload: TokenPayload): {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  } {
    const accessToken = this.jwt.sign(
      {
        userId: payload.userId,
        typeUtilisateur: payload.typeUtilisateur,
        tokenType: 'access',
      },
      {
        subject: payload.email,
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
      },
    );

    const refreshToken = this.jwt.sign(
      {
        userId: payload.userId,
        tokenType: 'refresh',
      },
      {
        subject: payload.email,
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: durationToSeconds(this.configService.get<string>('JWT_EXPIRES_IN', '1d')),
    };
  }

  verifyRefreshToken(token: string): { email: string } {
    try {
      const payload = this.jwt.verify<{ sub: string; tokenType?: string }>(token);
      // Compatibilité migration: accepter les refresh tokens legacy Spring
      // qui n'embarquent pas la claim tokenType.
      if (payload.tokenType && payload.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return { email: payload.sub };
    } catch {
      throw new DomainException(APP_MESSAGES.refreshTokenInvalid, 401, 'AUTH_REFRESH_TOKEN_INVALID');
    }
  }
}
