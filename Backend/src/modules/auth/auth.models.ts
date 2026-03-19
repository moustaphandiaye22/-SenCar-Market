import type { OtpType } from './types/otp-type';

export type AuthUserRecord = {
  id: string;
  email: string;
  telephone: string;
  mot_de_passe_hash: string;
  prenom: string | null;
  nom: string | null;
  photo_profil_url: string | null;
  email_verifie: boolean | null;
  telephone_verifie: boolean | null;
  double_auth_active: boolean | null;
  statut_verification: string | null;
  created_at: Date | null;
  type_utilisateur_id: string | null;
};

export type AuthUserTypeRecord = {
  id: string;
  nom: string;
};

export type AuthUserWithTypeRecord = AuthUserRecord & {
  type_utilisateur: AuthUserTypeRecord | null;
};

export type OtpCodeRecord = {
  id: string;
  code: string;
  type: OtpType;
  tentatives: number;
};

export type CreateUserInput = {
  id: string;
  email: string;
  telephone: string;
  mot_de_passe_hash: string;
  prenom: string;
  nom: string;
  email_verifie: boolean;
  telephone_verifie: boolean;
  double_auth_active: boolean;
  type_utilisateur_id: string;
};

export type UpdateUserInput = Partial<{
  prenom: string;
  nom: string;
  telephone: string;
  photo_profil_url: string;
  mot_de_passe_hash: string;
  derniere_connexion: Date;
  email_verifie: boolean;
}>;

export type CreateOtpInput = {
  id: string;
  utilisateur_id: string;
  code: string;
  type: OtpType;
  expiration: Date;
  utilise: boolean;
  tentatives: number;
};

export type UpdateOtpInput = Partial<{
  utilise: boolean;
  tentatives: number;
}>;
