import { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';

import type { AuthRepositoryPort } from './auth.repository.port';
import { AUTH_REPOSITORY_PORT } from './auth.repository.port';
import { AuthService } from './auth.service';
import { JwtTokenService } from './jwt.service';
import { AuthLoginService } from './services/auth-login.service';
import { AuthOtpService } from './services/auth-otp.service';
import { AuthProfileService } from './services/auth-profile.service';
import { AuthRegistrationService } from './services/auth-registration.service';
import { AuthMapper } from './services/auth.mapper';
import { AuthInputValidator } from './validation/auth-input.validator';

describe('AuthService', () => {
  let service: AuthService;
  let repository: jest.Mocked<AuthRepositoryPort>;
  let jwtService: jest.Mocked<JwtTokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthRegistrationService,
        AuthLoginService,
        AuthOtpService,
        AuthProfileService,
        AuthInputValidator,
        AuthMapper,
        {
          provide: AUTH_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            findUserByTelephone: jest.fn(),
            findUserByEmailOrTelephone: jest.fn(),
            findUserById: jest.fn(),
            findUserWithTypeById: jest.fn(),
            findTypeUtilisateurByNom: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            findLatestValidOtp: jest.fn(),
            deleteUnusedOtpByType: jest.fn(),
            createOtp: jest.fn(),
            updateOtp: jest.fn(),
          },
        },
        {
          provide: JwtTokenService,
          useValue: {
            generateTokens: jest.fn().mockReturnValue({
              accessToken: 'access',
              refreshToken: 'refresh',
              tokenType: 'Bearer',
              expiresIn: 86400,
            }),
            verifyRefreshToken: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('false'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get(AUTH_REPOSITORY_PORT);
    jwtService = module.get(JwtTokenService);
  });

  it('should reject registration when email already exists', async () => {
    repository.findUserByEmail.mockResolvedValue({ id: 'u1' } as never);
    repository.findUserByTelephone.mockResolvedValue(null);

    await expect(
      service.register({
        email: 'existing@test.com',
        telephone: '770000000',
        motDePasse: 'Password123',
        prenom: 'Test',
        nom: 'User',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow("L'email existe déjà");
  });

  it('should reject login with invalid password', async () => {
    const hash = await bcrypt.hash('valid-password', 10);
    repository.findUserByEmailOrTelephone.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
      mot_de_passe_hash: hash,
    } as never);

    await expect(
      service.login({ identifiant: 'user@test.com', motDePasse: 'wrong-password' }),
    ).rejects.toThrow('Identifiants invalides');
  });

  it('should include user type in login token payload', async () => {
    const hash = await bcrypt.hash('valid-password', 10);
    repository.findUserByEmailOrTelephone.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
      mot_de_passe_hash: hash,
    } as never);
    repository.updateUser.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
    } as never);
    repository.findUserWithTypeById.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
      telephone: '770000000',
      prenom: 'Test',
      nom: 'User',
      photo_profil_url: null,
      email_verifie: true,
      telephone_verifie: true,
      double_auth_active: false,
      statut_verification: null,
      created_at: new Date(),
      type_utilisateur_id: 't1',
      deleted_at: null,
      type_utilisateur: { id: 't1', nom: 'UTILISATEUR' },
    } as never);

    await service.login({ identifiant: 'user@test.com', motDePasse: 'valid-password' });

    expect(jwtService.generateTokens).toHaveBeenCalledWith(
      expect.objectContaining({ typeUtilisateur: 'UTILISATEUR' }),
    );
  });

  it('should include user type in refresh token payload', async () => {
    jwtService.verifyRefreshToken.mockReturnValue({ email: 'user@test.com' });
    repository.findUserByEmail.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
    } as never);
    repository.findUserWithTypeById.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
      telephone: '770000000',
      prenom: 'Test',
      nom: 'User',
      photo_profil_url: null,
      email_verifie: true,
      telephone_verifie: true,
      double_auth_active: false,
      statut_verification: null,
      created_at: new Date(),
      type_utilisateur_id: 't1',
      deleted_at: null,
      type_utilisateur: { id: 't1', nom: 'PROFESSIONNEL' },
    } as never);

    await service.refreshToken({ refreshToken: 'refresh-token' });

    expect(jwtService.generateTokens).toHaveBeenCalledWith(
      expect.objectContaining({ typeUtilisateur: 'PROFESSIONNEL' }),
    );
  });

  it('should reject blank profile fields', async () => {
    await expect(
      service.updateProfile(
        { userId: 'u1', email: 'user@test.com', typeUtilisateur: 'UTILISATEUR' },
        { prenom: '   ' },
      ),
    ).rejects.toThrow('Le champ ne peut pas être vide: prenom');
  });

  it('should reject password reuse', async () => {
    const hash = await bcrypt.hash('same-password', 10);
    repository.findUserById.mockResolvedValue({
      id: 'u1',
      email: 'user@test.com',
      telephone: '770000000',
      mot_de_passe_hash: hash,
      prenom: 'Test',
      nom: 'User',
      photo_profil_url: null,
      email_verifie: true,
      telephone_verifie: true,
      double_auth_active: false,
      statut_verification: null,
      created_at: new Date(),
      type_utilisateur_id: 't1',
      deleted_at: null,
    } as never);

    await expect(
      service.changePassword(
        { userId: 'u1', email: 'user@test.com', typeUtilisateur: 'UTILISATEUR' },
        { motDePasseActuel: 'same-password', nouveauMotDePasse: 'same-password' },
      ),
    ).rejects.toThrow("Le nouveau mot de passe doit être différent de l'ancien");
  });
});
