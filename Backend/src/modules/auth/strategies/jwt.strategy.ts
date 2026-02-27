import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AuthenticatedUser } from '../../../common/types/authenticated-user.type';

type JwtPayload = {
  userId: string;
  typeUtilisateur?: string;
  tokenType?: string;
  sub: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('Configuration JWT_SECRET manquante');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    if (payload.tokenType !== 'access') {
      throw new UnauthorizedException("Jeton d'accès invalide");
    }
    if (!payload.userId || !payload.sub) {
      throw new UnauthorizedException('Payload JWT invalide');
    }

    return {
      userId: payload.userId,
      email: payload.sub,
      typeUtilisateur: payload.typeUtilisateur ?? null,
    };
  }
}
