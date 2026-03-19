import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  AuthUserRecord,
  AuthUserTypeRecord,
  AuthUserWithTypeRecord,
  CreateOtpInput,
  CreateUserInput,
  OtpCodeRecord,
  UpdateOtpInput,
  UpdateUserInput,
} from './auth.models';
import { AuthRepositoryPort } from './auth.repository.port';
import { OtpType } from './types/otp-type';

@Injectable()
export class AuthRepository implements AuthRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<AuthUserRecord | null> {
    return this.prisma.utilisateur.findUnique({ where: { email } });
  }

  findUserByTelephone(telephone: string): Promise<AuthUserRecord | null> {
    return this.prisma.utilisateur.findUnique({ where: { telephone } });
  }

  findUserByEmailOrTelephone(identifiant: string): Promise<AuthUserRecord | null> {
    return this.prisma.utilisateur.findFirst({
      where: {
        OR: [{ email: identifiant }, { telephone: identifiant }],
      },
    });
  }

  findUserById(id: string): Promise<AuthUserRecord | null> {
    return this.prisma.utilisateur.findUnique({ where: { id } });
  }

  findUserWithTypeById(id: string): Promise<AuthUserWithTypeRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: { type_utilisateur: true },
    }) as any;
  }

  findTypeUtilisateurByNom(nom: string): Promise<AuthUserTypeRecord | null> {
    return this.prisma.type_utilisateur.findUnique({ where: { nom } });
  }

  createUser(data: CreateUserInput): Promise<AuthUserRecord> {
    return this.prisma.utilisateur.create({ data: data as any }) as any;
  }

  updateUser(id: string, data: UpdateUserInput): Promise<AuthUserRecord> {
    return this.prisma.utilisateur.update({
      where: { id },
      data: data as any,
    }) as any;
  }

  findLatestValidOtp(utilisateurId: string, type: OtpType, now: Date): Promise<OtpCodeRecord | null> {
    return this.prisma.otp_code.findFirst({
      where: {
        utilisateur_id: utilisateurId,
        type,
        utilise: false,
        expiration: { gt: now },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  findLatestOtpByEmail(email: string, type: OtpType): Promise<OtpCodeRecord | null> {
    return this.prisma.otp_code.findFirst({
      where: {
        utilisateur: { email },
        type,
        utilise: false,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async deleteUnusedOtpByType(utilisateurId: string, type: OtpType): Promise<void> {
    await this.prisma.otp_code.deleteMany({
      where: {
        utilisateur_id: utilisateurId,
        type,
        utilise: false,
      },
    });
  }

  createOtp(data: CreateOtpInput): Promise<OtpCodeRecord> {
    return this.prisma.otp_code.create({ data: data as any });
  }

  updateOtp(id: string, data: UpdateOtpInput): Promise<OtpCodeRecord> {
    return this.prisma.otp_code.update({
      where: { id },
      data: data as any,
    });
  }
}
