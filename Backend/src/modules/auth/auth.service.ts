import { Injectable } from '@nestjs/common';

import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { UpdateProfileRequestDto } from './dto/update-profile-request.dto';
import { UtilisateurResponseDto } from './dto/utilisateur-response.dto';
import { AuthLoginService } from './services/auth-login.service';
import { AuthOtpService } from './services/auth-otp.service';
import { AuthProfileService } from './services/auth-profile.service';
import { AuthRegistrationService } from './services/auth-registration.service';

/**
 * Auth Service - Facade for authentication operations
 * Delegates to specialized services following Single Responsibility Principle
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly registrationService: AuthRegistrationService,
    private readonly loginService: AuthLoginService,
    private readonly otpService: AuthOtpService,
    private readonly profileService: AuthProfileService,
  ) {}

  /**
   * Register a new user
   */
  async register(request: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.registrationService.register(request);
  }

  /**
   * Authenticate user and generate tokens
   */
  async login(request: LoginRequestDto): Promise<AuthResponseDto> {
    return this.loginService.login(request);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(request: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    return this.loginService.refreshToken(request);
  }

  /**
   * Get current authenticated user profile
   */
  async getCurrentUser(user: AuthenticatedUser): Promise<UtilisateurResponseDto> {
    return this.profileService.getCurrentUser(user);
  }

  /**
   * Update current user profile
   */
  async updateProfile(
    user: AuthenticatedUser,
    request: UpdateProfileRequestDto,
  ): Promise<UtilisateurResponseDto> {
    return this.profileService.updateProfile(user, request);
  }

  /**
   * Change user password
   */
  async changePassword(
    user: AuthenticatedUser,
    request: ChangePasswordRequestDto,
  ): Promise<void> {
    return this.loginService.changePassword(
      user.userId,
      request.motDePasseActuel,
      request.nouveauMotDePasse,
    );
  }

  /**
   * Verify email with OTP code
   */
  async verifyEmailWithOtp(email: string, codeOtp: string): Promise<void> {
    return this.otpService.verifyEmailWithOtp(email, codeOtp);
  }

  /**
   * Resend verification OTP to user email
   */
  async resendOtp(email: string): Promise<void> {
    return this.otpService.resendOtp(email);
  }

  /**
   * Send password reset OTP to user email
   */
  async sendPasswordResetOtp(email: string): Promise<void> {
    return this.otpService.sendPasswordResetOtp(email);
  }

  /**
   * Reset password using OTP verification
   */
  async resetPasswordByEmail(request: ResetPasswordRequestDto): Promise<void> {
    return this.otpService.resetPasswordByEmail(request);
  }
}
