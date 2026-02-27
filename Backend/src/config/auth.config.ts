/**
 * Authentication configuration constants
 * Centralizes magic numbers and strings for auth-related settings
 */

export const AUTH_CONFIG = {
  /** Bcrypt hash rounds for password hashing */
  BCRYPT_ROUNDS: 10,

  /** JWT access token expiration in seconds (1 hour) */
  JWT_ACCESS_EXPIRATION: 3600,

  /** JWT refresh token expiration in seconds (7 days) */
  JWT_REFRESH_EXPIRATION: 604800,

  /** OTP configuration */
  OTP: {
    /** OTP code length */
    CODE_LENGTH: 6,

    /** OTP expiration in minutes */
    EXPIRATION_MINUTES: 10,

    /** Maximum OTP verification attempts */
    MAX_ATTEMPTS: 5,

    /** Whether to send OTP via email (feature flag) */
    EMAIL_ENABLED: false,
  },

  /** Password validation rules */
  PASSWORD: {
    /** Minimum password length */
    MIN_LENGTH: 8,

    /** Maximum password length */
    MAX_LENGTH: 128,
  },
} as const;

/** Provider-specific webhook secrets */
export const WEBHOOK_CONFIG = {
  WAVE: {
    /** Base URL for Wave payment */
    PAY_URL_BASE: 'https://wave.com/pay',

    /** Secret key for webhook signature verification */
    SECRET: '',
  },
  ORANGE_MONEY: {
    /** Base URL for Orange Money payment */
    PAY_URL_BASE: 'https://om.sn/pay',

    /** Secret key for webhook signature verification */
    SECRET: '',
  },
} as const;

/** Payment configuration */
export const PAIEMENT_CONFIG = {
  /** Commission rate (5%) */
  COMMISSION_TAUX: 0.05,

  /** Maximum payment amount */
  MAX_MONTANT: 1000000,

  /** Minimum payment amount */
  MIN_MONTANT: 100,
} as const;

export type AuthConfig = typeof AUTH_CONFIG;
export type WebhookConfig = typeof WEBHOOK_CONFIG;
export type PaiementConfig = typeof PAIEMENT_CONFIG;
