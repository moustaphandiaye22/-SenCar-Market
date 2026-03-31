import { randomInt, randomUUID } from 'crypto';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { APP_MESSAGES } from '../../../common/constants/app-messages';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { addMinutes } from '../../../common/utils/date.util';
import { AUTH_CONFIG } from '../../../config/auth.config';
import { AUTH_REPOSITORY_PORT, AuthRepositoryPort } from '../auth.repository.port';
import { ResetPasswordRequestDto } from '../dto/reset-password-request.dto';
import { OtpType } from '../types/otp-type';
import { AuthInputValidator } from '../validation/auth-input.validator';

/**
 * Auth OTP Service - Single Responsibility for OTP handling
 * Handles OTP generation, verification, and password reset
 */
@Injectable()
export class AuthOtpService {
  private readonly logger = new Logger(AuthOtpService.name);

  constructor(
    @Inject(AUTH_REPOSITORY_PORT) private readonly repository: AuthRepositoryPort,
    private readonly inputValidator: AuthInputValidator,
  ) {}

  /**
   * Verify email with OTP code
   */
  async verifyEmailWithOtp(email: string, codeOtp: string): Promise<void> {
    const user = await this.mustFindUserByEmail(email);
    await this.verifyOtp(user.id, 'VERIFICATION_EMAIL', codeOtp);
    await this.repository.updateUser(user.id, { email_verifie: true });
  }

  /**
   * Resend verification OTP to user email
   */
  async resendOtp(email: string): Promise<void> {
    const user = await this.repository.findUserByEmail(this.inputValidator.normalizeEmail(email));
    if (!user) {
      return;
    }

    await this.generateOtp(user.id, user.email, 'VERIFICATION_EMAIL');
  }

  /**
   * Send password reset OTP to user email
   */
  async sendPasswordResetOtp(email: string): Promise<void> {
    const user = await this.repository.findUserByEmail(this.inputValidator.normalizeEmail(email));
    if (!user) {
      return;
    }

    await this.generateOtp(user.id, user.email, 'MOT_DE_PASSE_OUBLIE');
  }

  /**
   * Reset password using OTP verification
   */
  async resetPasswordByEmail(request: ResetPasswordRequestDto): Promise<void> {
    const user = await this.mustFindUserByEmail(request.email);
    await this.verifyOtp(user.id, 'MOT_DE_PASSE_OUBLIE', request.codeOtp);

    const hashedPassword = await this.hashPassword(request.nouveauMotDePasse);
    await this.repository.updateUser(user.id, {
      mot_de_passe_hash: hashedPassword,
    });
  }

  // Private helpers

  private async mustFindUserByEmail(email: string) {
    const user = await this.repository.findUserByEmail(this.inputValidator.normalizeEmail(email));
    if (!user) {
      throw new DomainException(APP_MESSAGES.userNotFound, 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  private async generateOtp(
    utilisateurId: string,
    email: string,
    type: OtpType,
  ): Promise<void> {
    await this.repository.deleteUnusedOtpByType(utilisateurId, type);

    const code = this.generateRandomOtp();

    await this.repository.createOtp({
      id: randomUUID(),
      utilisateur_id: utilisateurId,
      code,
      type,
      expiration: addMinutes(new Date(), AUTH_CONFIG.OTP.EXPIRATION_MINUTES),
      utilise: false,
      tentatives: 0,
    });

    const emailEnabled = AUTH_CONFIG.OTP.EMAIL_ENABLED;
    if (emailEnabled) {
      this.logger.log(`OTP generated for ${email} (${type})`);
    }
  }

  private async verifyOtp(utilisateurId: string, type: OtpType, code: string): Promise<void> {
    const otp = await this.repository.findLatestValidOtp(utilisateurId, type, new Date());

    if (!otp) {
      throw new DomainException(APP_MESSAGES.otpInvalidOrExpired, 400, 'OTP_INVALID_OR_EXPIRED');
    }

    const maxAttempts = AUTH_CONFIG.OTP.MAX_ATTEMPTS;
    if (otp.tentatives >= maxAttempts) {
      await this.repository.updateOtp(otp.id, { utilise: true });
      throw new DomainException(APP_MESSAGES.otpMaxAttemptsReached, 400, 'OTP_MAX_ATTEMPTS_REACHED');
    }

    if (otp.code !== this.inputValidator.normalizeOtpCode(code)) {
      await this.repository.updateOtp(otp.id, { tentatives: otp.tentatives + 1 });
      throw new DomainException(APP_MESSAGES.otpIncorrect, 400, 'OTP_INCORRECT');
    }

    await this.repository.updateOtp(otp.id, { utilise: true });
  }

  private generateRandomOtp(): string {
    return Array.from({ length: AUTH_CONFIG.OTP.CODE_LENGTH }, () => randomInt(0, 10).toString()).join('');
  }

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.default.hash(password, AUTH_CONFIG.BCRYPT_ROUNDS);
  }
}
