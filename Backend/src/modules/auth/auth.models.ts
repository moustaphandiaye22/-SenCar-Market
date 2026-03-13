import type { OtpType } from './types/otp-type';

export type AuthUserRecord = {
  id: string;
  email: string;
  telephone: string;
  motDePasseHash: string;
  prenom: string | null;
  nom: string | null;
  photoProfilUrl: string | null;
  emailVerifie: boolean | null;
  telephoneVerifie: boolean | null;
  doubleAuthActive: boolean | null;
  statutVerification: string | null;
  createdAt: Date | null;
  typeUtilisateurId: string | null;
};

export type AuthUserTypeRecord = {
  id: string;
  nom: string;
};

export type AuthUserWithTypeRecord = AuthUserRecord & {
  typeUtilisateur: AuthUserTypeRecord | null;
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
  motDePasseHash: string;
  prenom: string;
  nom: string;
  emailVerifie: boolean;
  telephoneVerifie: boolean;
  doubleAuthActive: boolean;
  typeUtilisateur: { connect: { id: string } };
};

export type UpdateUserInput = Partial<{
  prenom: string;
  nom: string;
  telephone: string;
  photoProfilUrl: string;
  motDePasseHash: string;
  derniereConnexion: Date;
  emailVerifie: boolean;
}>;

export type CreateOtpInput = {
  id: string;
  utilisateur: { connect: { id: string } };
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
