import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const configService = {
    get: jest.fn((key: string) => (key === 'JWT_SECRET' ? 'test-secret' : undefined)),
  } as unknown as ConfigService;

  it('should accept access token payload', () => {
    const strategy = new JwtStrategy(configService);

    const user = strategy.validate({
      userId: 'user-1',
      sub: 'user@test.com',
      typeUtilisateur: 'ADMIN',
      tokenType: 'access',
    });

    expect(user).toEqual({
      userId: 'user-1',
      email: 'user@test.com',
      typeUtilisateur: 'ADMIN',
    });
  });

  it('should reject refresh token payload on protected routes', () => {
    const strategy = new JwtStrategy(configService);

    expect(() =>
      strategy.validate({
        userId: 'user-1',
        sub: 'user@test.com',
        tokenType: 'refresh',
      }),
    ).toThrow(UnauthorizedException);
  });
});
