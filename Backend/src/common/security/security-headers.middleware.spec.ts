import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import {
  httpsRedirectMiddleware,
  securityHeadersMiddleware,
} from './security-headers.middleware';

jest.mock('helmet', () => ({
  __esModule: true,
  default: jest.fn(() => (_req: Request, _res: Response, next: NextFunction) =>
    next(),
  ),
}));

describe('security-headers.middleware', () => {
  afterEach(() => {
    delete process.env.NODE_ENV;
    jest.restoreAllMocks();
  });

  const createResponse = () => {
    const setHeader = jest.fn();
    const redirect = jest.fn();
    return {
      setHeader,
      redirect,
    } as unknown as Response;
  };

  it('applies helmet and custom security headers', () => {
    const req = {} as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    securityHeadersMiddleware(req, res, next);

    expect(helmet).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Content-Type-Options',
      'nosniff',
    );
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(res.setHeader).not.toHaveBeenCalledWith(
      'Strict-Transport-Security',
      expect.anything(),
    );
    expect(next).toHaveBeenCalled();
  });

  it('adds HSTS in production', () => {
    process.env.NODE_ENV = 'production';
    const req = {} as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    securityHeadersMiddleware(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  });

  it('redirects insecure production requests to https', () => {
    process.env.NODE_ENV = 'production';
    const req = {
      headers: { 'x-forwarded-proto': 'http' },
      protocol: 'http',
      hostname: 'example.com',
      originalUrl: '/api/test',
    } as unknown as Request;
    const res = createResponse();
    const next = jest.fn() as NextFunction;

    httpsRedirectMiddleware(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith(
      301,
      'https://example.com/api/test',
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('lets secure or non-production requests continue', () => {
    const next = jest.fn() as NextFunction;

    httpsRedirectMiddleware(
      {
        headers: {},
        protocol: 'https',
      } as unknown as Request,
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalled();
  });
});
