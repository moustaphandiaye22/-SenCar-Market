import type { NextFunction, Request, Response } from 'express';

import { createInMemoryRateLimiter } from './rate-limit.util';

describe('createInMemoryRateLimiter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const buildResponse = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const setHeader = jest.fn();

    return {
      response: {
        setHeader,
        status,
      } as unknown as Response,
      json,
      setHeader,
      status,
    };
  };

  it('allows requests under the limit', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);

    const limiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      max: 2,
      message: 'Too many requests',
    });

    const req = { ip: '127.0.0.1', path: '/health' } as Request;
    const { response, status, setHeader } = buildResponse();
    const next = jest.fn() as NextFunction;

    limiter(req, response, next);
    limiter(req, response, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(status).not.toHaveBeenCalled();
    expect(setHeader).not.toHaveBeenCalled();
  });

  it('blocks requests once the limit is reached', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_000);

    const limiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      max: 1,
      message: 'Slow down',
    });

    const req = { ip: '127.0.0.1', path: '/auth' } as Request;
    const { response, json, setHeader, status } = buildResponse();
    const next = jest.fn() as NextFunction;

    limiter(req, response, next);
    limiter(req, response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(setHeader).toHaveBeenCalledWith('Retry-After', '60');
    expect(status).toHaveBeenCalledWith(429);
    expect(json).toHaveBeenCalledWith({
      statusCode: 429,
      message: 'Slow down',
    });
  });

  it('resets the counter after the time window expires', () => {
    const nowSpy = jest.spyOn(Date, 'now');
    nowSpy.mockReturnValueOnce(1_000);
    nowSpy.mockReturnValueOnce(1_500);
    nowSpy.mockReturnValueOnce(62_000);

    const limiter = createInMemoryRateLimiter({
      windowMs: 60_000,
      max: 1,
      message: 'Slow down',
    });

    const req = { ip: '127.0.0.1', path: '/auth' } as Request;
    const { response } = buildResponse();
    const next = jest.fn() as NextFunction;

    limiter(req, response, next);
    limiter(req, response, next);
    limiter(req, response, next);

    expect(next).toHaveBeenCalledTimes(2);
  });
});
