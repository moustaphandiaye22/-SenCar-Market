export const OTP_TYPES = {
  inscription: 'INSCRIPTION',
  connexion: 'CONNEXION',
  motDePasseOublie: 'MOT_DE_PASSE_OUBLIE',
  verificationEmail: 'VERIFICATION_EMAIL',
  verificationTelephone: 'VERIFICATION_TELEPHONE',
} as const;

export type OtpType = (typeof OTP_TYPES)[keyof typeof OTP_TYPES];
