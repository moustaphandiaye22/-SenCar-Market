import type { NextFunction, Request, Response } from 'express';

type RateLimitOptions = {
  windowMs: number;
  max: number;
  message: string;
};

type Counter = {
  count: number;
  resetAt: number;
};

export const createInMemoryRateLimiter = (options: RateLimitOptions) => {
  const counters = new Map<string, Counter>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const current = counters.get(key);

    if (!current || now >= current.resetAt) {
      counters.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    if (current.count >= options.max) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(Math.max(retryAfter, 1)));
      res.status(429).json({
        statusCode: 429,
        message: options.message,
      });
      return;
    }

    current.count += 1;
    next();
  };
};
