import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { ApiErrorResponseDto } from '../auth/dto/api-error-response.dto';

import { ActionAdminRequestDto } from './dto/action-admin-request.dto';
import { CreateSignalementRequestDto } from './dto/create-signalement-request.dto';
import { SignalementResponseDto } from './dto/signalement-response.dto';
import { NotificationService } from './notification.service';

@ApiTags('Signalements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('signalements')
export class SignalementController {
  constructor(private readonly service: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un signalement' })
  @ApiResponse({ status: 201, type: SignalementResponseDto, description: 'Signalement créé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createSignalement(
    @Body() request: CreateSignalementRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SignalementResponseDto> {
    return this.service.createSignalement(request, user);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Signalements en attente' })
  @ApiResponse({ status: 200, description: 'Signalements en attente récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getPendingSignalements(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    return this.service.getPendingSignalements(page, size, user);
  }

  @Get('statut/:statut')
  @ApiOperation({ summary: 'Signalements par statut' })
  @ApiResponse({ status: 200, description: 'Signalements récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getSignalementsByStatut(
    @Param('statut') statut: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    return this.service.getSignalementsByStatut(statut, page, size, user);
  }

  @Get('type/:typeEntite')
  @ApiOperation({ summary: 'Signalements par type' })
  @ApiResponse({ status: 200, description: 'Signalements récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getSignalementsByType(
    @Param('typeEntite') typeEntite: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    return this.service.getSignalementsByType(typeEntite, page, size, user);
  }

  @Get('count/pending')
  @ApiOperation({ summary: 'Compter les signalements en attente' })
  @ApiResponse({ status: 200, description: 'Nombre de signalements en attente' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async countPending(@CurrentUser() user: AuthenticatedUser): Promise<{ pendingCount: number }> {
    const pendingCount = await this.service.countPending(user);
    return { pendingCount };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un signalement' })
  @ApiResponse({ status: 200, type: SignalementResponseDto, description: 'Signalement récupéré avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Signalement non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getSignalement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SignalementResponseDto> {
    return this.service.getSignalementById(id, user);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des signalements' })
  @ApiResponse({ status: 200, description: 'Signalements récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAllSignalements(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @Query('sortBy') sortBy = 'dateSignalement',
    @Query('sortDir') sortDir = 'desc',
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    return this.service.getAllSignalements(page, size, sortBy, sortDir, user);
  }

  @Post(':id/traiter')
  @ApiOperation({ summary: 'Traiter un signalement' })
  @ApiResponse({ status: 200, type: SignalementResponseDto, description: 'Signalement traité avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Signalement non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  traiterSignalement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: ActionAdminRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SignalementResponseDto> {
    return this.service.traiterSignalement(id, request, user);
  }
}
