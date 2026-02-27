import type { ExecutionContext } from '@nestjs/common';
import { UnauthorizedException, createParamDecorator } from '@nestjs/common';

import type { AuthenticatedUser } from '../types/authenticated-user.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    if (!request.user) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    return request.user;
  },
);
