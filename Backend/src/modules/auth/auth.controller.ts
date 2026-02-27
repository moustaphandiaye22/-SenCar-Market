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

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

import { AuthService } from './auth.service';
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
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  register(@Body() request: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.authService.register(request);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Vérification de l'email par OTP" })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  async verifyOtp(@Body() request: OtpVerifyRequestDto): Promise<MessageResponseDto> {
    await this.authService.verifyEmailWithOtp(request.email, request.codeOtp);
    return { message: 'Email vérifié avec succès' };
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renvoi du code OTP' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  async resendOtp(@Body() request: ForgotPasswordRequestDto): Promise<MessageResponseDto> {
    await this.authService.resendOtp(request.email);
    return { message: 'Code OTP renvoyé avec succès' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  login(@Body() request: LoginRequestDto): Promise<AuthResponseDto> {
    return this.authService.login(request);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Rafraîchir le token d'accès" })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  refresh(@Body() request: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(request);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir le profil utilisateur actuel' })
  me(@CurrentUser() user: AuthenticatedUser): Promise<UtilisateurResponseDto> {
    return this.authService.getCurrentUser(user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le profil' })
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
  async changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: ChangePasswordRequestDto,
  ): Promise<void> {
    await this.authService.changePassword(user, request);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mot de passe oublié' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  async forgotPassword(@Body() request: ForgotPasswordRequestDto): Promise<MessageResponseDto> {
    await this.authService.sendPasswordResetOtp(request.email);
    return { message: "Si l'email existe, un code OTP sera envoyé" };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Réinitialiser le mot de passe' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  async resetPassword(@Body() request: ResetPasswordRequestDto): Promise<MessageResponseDto> {
    await this.authService.resetPasswordByEmail(request);
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
