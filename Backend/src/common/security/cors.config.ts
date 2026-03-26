import type { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

const DEFAULT_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8082",
  "http://127.0.0.1:8082",
  "http://localhost:4200",
  "http://127.0.0.1:4200",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://sencar-market.onrender.com",
  "https://sen-car-market.vercel.app",
];

const parseList = (raw: string | undefined, fallback: string[]): string[] => {
  const values = (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  return values.length ? values : fallback;
};

const isOriginAllowed = (origin: string, allowedOrigins: string[]): boolean => {
  // Check exact match
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check wildcard patterns (e.g., *.onrender.com)
  return allowedOrigins.some((allowed) => {
    if (allowed.includes("*")) {
      const regex = new RegExp(
        "^" +
          allowed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
          "$",
      );
      return regex.test(origin);
    }
    return false;
  });
};

export const buildCorsOptions = (): CorsOptions => {
  const allowedOrigins = parseList(process.env.CORS_ORIGINS, DEFAULT_ORIGINS);
  const allowCredentials =
    String(process.env.CORS_CREDENTIALS ?? "true") === "true";

  // Allow all origins in development
  if (process.env.NODE_ENV === "development") {
    return {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Authorization",
        "Content-Type",
        "X-Requested-With",
        "Accept",
        "Origin",
      ],
      exposedHeaders: ["X-Request-Id"],
    };
  }

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origine CORS non autorisée"));
    },
    credentials: allowCredentials,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["X-Request-Id"],
    maxAge: 86400,
  };
};
