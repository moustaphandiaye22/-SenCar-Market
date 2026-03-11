import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8082',
  'http://127.0.0.1:8082',
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://sencar-market.onrender.com',
];

const parseList = (raw: string | undefined, fallback: string[]): string[] => {
  const values = (raw ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  return values.length ? values : fallback;
};

export const buildCorsOptions = (): CorsOptions => {
  const allowedOrigins = parseList(process.env.CORS_ORIGINS, DEFAULT_ORIGINS);
  const allowCredentials = String(process.env.CORS_CREDENTIALS ?? 'true') === 'true';

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origine CORS non autorisée'));
    },
    credentials: allowCredentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86400,
  };
};
