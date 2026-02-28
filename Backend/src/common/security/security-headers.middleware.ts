import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

/**
 * Security headers middleware using Helmet.js
 * Provides comprehensive security protection against common web vulnerabilities
 */
export const securityHeadersMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Use Helmet for comprehensive security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Note: 'unsafe-inline' required for Swagger UI in development
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })(req, res, () => {
    // Additional custom headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()',
    );
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

    // HSTS only in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
      );
    }

    next();
  });
};

/**
 * HTTPS redirect middleware for production
 * Forces all HTTP requests to use HTTPS
 * Supports X-Forwarded-Proto header for deployments behind reverse proxies
 */
export const httpsRedirectMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (process.env.NODE_ENV === 'production') {
    // Support X-Forwarded-Proto header from reverse proxies (load balancers, nginx, etc.)
    const protocol = (req.headers['x-forwarded-proto'] as string) || req.protocol;
    if (protocol === 'http') {
      const httpsUrl = `https://${req.hostname}${req.originalUrl}`;
      res.redirect(301, httpsUrl);
      return;
    }
  }
  next();
};
