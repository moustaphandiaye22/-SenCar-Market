import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

import { AuthService } from './auth.service';
import { ApiErrorResponseDto } from './dto/api-error-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordRequestDto } from './dto/change-password-request.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { OtpVerifyRequestDto } from './dto/otp-verify-request.dto';
import { RefreshTokenRequestDto } from './dto/refresh-token-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { UpdateProfileRequestDto } from './dto/update-profile-request.dto';
import { UtilisateurResponseDto } from './dto/utilisateur-response.dto';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @Throttle({ auth: { limit: 30, ttl: 900000 } })
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @ApiResponse({ status: 201, type: AuthResponseDto, description: 'Utilisateur créé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides ou email déjà utilisé' })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Conflit - Utilisateur déjà existant' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  register(@Body() request: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.authService.register(request);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ auth: { limit: 30, ttl: 900000 } })
  @ApiOperation({ summary: "Vérification de l'email par OTP" })
  @ApiResponse({ status: 200, type: MessageResponseDto, description: 'OTP vérifié avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'OTP invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async verifyOtp(@Body() request: OtpVerifyRequestDto): Promise<MessageResponseDto> {
    await this.authService.verifyEmailWithOtp(request.email, request.codeOtp);
    return { message: 'Email vérifié avec succès' };
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ auth: { limit: 30, ttl: 900000 } })
  @ApiOperation({ summary: 'Renvoi du code OTP' })
  @ApiResponse({ status: 200, type: MessageResponseDto, description: 'OTP envoyé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Email ou téléphone invalide' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, description: 'Trop de requêtes - Rate limit dépassé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async resendOtp(@Body() request: ForgotPasswordRequestDto): Promise<MessageResponseDto> {
    await this.authService.resendOtp(request.email);
    return { message: 'Code OTP renvoyé avec succès' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ auth: { limit: 30, ttl: 900000 } })
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, type: AuthResponseDto, description: 'Connexion réussie' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Identifiants invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Email ou mot de passe incorrect' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Compte non vérifié ou suspendu' })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, description: 'Trop de requêtes - Rate limit dépassé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  login(@Body() request: LoginRequestDto): Promise<AuthResponseDto> {
    return this.authService.login(request);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ auth: { limit: 30, ttl: 900000 } })
  @ApiOperation({ summary: "Rafraîchir le token d'accès" })
  @ApiResponse({ status: 200, type: AuthResponseDto, description: 'Token rafraîchi avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Refresh token invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Refresh token expiré ou invalide' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  refresh(@Body() request: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(request);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir le profil utilisateur actuel' })
  @ApiResponse({ status: 200, type: UtilisateurResponseDto, description: 'Profil récupéré avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  me(@CurrentUser() user: AuthenticatedUser): Promise<UtilisateurResponseDto> {
    return this.authService.getCurrentUser(user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le profil' })
  @ApiResponse({ status: 200, type: UtilisateurResponseDto, description: 'Profil mis à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Conflit - Email ou téléphone déjà utilisé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: UpdateProfileRequestDto,
  ): Promise<UtilisateurResponseDto> {
    return this.authService.updateProfile(user, request);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Changer le mot de passe' })
  @ApiResponse({ status: 200, type: MessageResponseDto, description: 'Mot de passe changé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Ancien mot de passe incorrect' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 422, type: ApiErrorResponseDto, description: 'Nouveau mot de passe ne respecte pas les critères' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: ChangePasswordRequestDto,
  ): Promise<void> {
    await this.authService.changePassword(user, request);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ auth: { limit: 30, ttl: 900000 } })
  @ApiOperation({ summary: 'Mot de passe oublié' })
  @ApiResponse({ status: 200, type: MessageResponseDto, description: 'Instructions de réinitialisation envoyées' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Email invalide' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 429, type: ApiErrorResponseDto, description: 'Trop de requêtes - Rate limit dépassé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async forgotPassword(@Body() request: ForgotPasswordRequestDto): Promise<MessageResponseDto> {
    await this.authService.sendPasswordResetOtp(request.email);
    return { message: "Si l'email existe, un code OTP sera envoyé" };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ auth: { limit: 30, ttl: 900000 } })
  @ApiOperation({ summary: 'Réinitialiser le mot de passe' })
  @ApiResponse({ status: 200, type: MessageResponseDto, description: 'Mot de passe réinitialisé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Token de réinitialisation invalide ou expiré' })
  @ApiResponse({ status: 422, type: ApiErrorResponseDto, description: 'Nouveau mot de passe ne respecte pas les critères' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async resetPassword(@Body() request: ResetPasswordRequestDto): Promise<MessageResponseDto> {
    await this.authService.resetPasswordByEmail(request);
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
