import type {
  AuthUserRecord,
  AuthUserTypeRecord,
  AuthUserWithTypeRecord,
  CreateOtpInput,
  CreateUserInput,
  OtpCodeRecord,
  UpdateOtpInput,
  UpdateUserInput,
} from './auth.models';
import type { OtpType } from './types/otp-type';

export const AUTH_REPOSITORY_PORT = Symbol('AUTH_REPOSITORY_PORT');

export interface AuthRepositoryPort {
  findUserByEmail(email: string): Promise<AuthUserRecord | null>;
  findUserByTelephone(telephone: string): Promise<AuthUserRecord | null>;
  findUserByEmailOrTelephone(identifiant: string): Promise<AuthUserRecord | null>;
  findUserById(id: string): Promise<AuthUserRecord | null>;
  findUserWithTypeById(id: string): Promise<AuthUserWithTypeRecord | null>;
  findTypeUtilisateurByNom(nom: string): Promise<AuthUserTypeRecord | null>;

  createUser(data: CreateUserInput): Promise<AuthUserRecord>;
  updateUser(id: string, data: UpdateUserInput): Promise<AuthUserRecord>;

  findLatestValidOtp(utilisateurId: string, type: OtpType, now: Date): Promise<OtpCodeRecord | null>;
  findLatestOtpByEmail(email: string, type: OtpType): Promise<OtpCodeRecord | null>;
  deleteUnusedOtpByType(utilisateurId: string, type: OtpType): Promise<void>;
  createOtp(data: CreateOtpInput): Promise<OtpCodeRecord>;
  updateOtp(id: string, data: UpdateOtpInput): Promise<OtpCodeRecord>;
}
