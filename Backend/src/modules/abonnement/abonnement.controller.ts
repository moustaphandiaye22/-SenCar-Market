import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

import { AbonnementService } from './abonnement.service';
import { AbonnementResponseDto } from './dto/abonnement-response.dto';
import { BoostAnnonceResponseDto } from './dto/boost-annonce-response.dto';
import { CreateAbonnementRequestDto } from './dto/create-abonnement-request.dto';
import { CreateBoostRequestDto } from './dto/create-boost-request.dto';
import { SouscriptionRequestDto } from './dto/souscription-request.dto';
import { UtilisateurAbonnementResponseDto } from './dto/utilisateur-abonnement-response.dto';

@ApiTags('Abonnements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('abonnements')
export class AbonnementController {
  constructor(private readonly service: AbonnementService) {}

  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un plan d\'abonnement' })
  createPlan(
    @Body() request: CreateAbonnementRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AbonnementResponseDto> {
    return this.service.createPlan(request, user);
  }

  @Put('plans/:id')
  @ApiOperation({ summary: 'Mettre à jour un plan' })
  updatePlan(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: CreateAbonnementRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AbonnementResponseDto> {
    return this.service.updatePlan(id, request, user);
  }

  @Delete('plans/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un plan (désactivation)' })
  async deletePlan(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deletePlan(id, user);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Obtenir un plan par ID' })
  getPlanById(@Param('id', new ParseUUIDPipe()) id: string): Promise<AbonnementResponseDto> {
    return this.service.getPlanById(id);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Liste des plans actifs' })
  getAllPlans(): Promise<AbonnementResponseDto[]> {
    return this.service.getAllPlans();
  }

  @Post('souscription')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Souscrire à un plan' })
  subscribe(
    @Body() request: SouscriptionRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UtilisateurAbonnementResponseDto> {
    return this.service.subscribe(request, user);
  }

  @Post('utilisateurs/:utilisateurId/renew')
  @ApiOperation({ summary: 'Renouveler un abonnement' })
  renewSubscription(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UtilisateurAbonnementResponseDto> {
    return this.service.renewSubscription(utilisateurId, user);
  }

  @Post('utilisateurs/:utilisateurId/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Annuler un abonnement' })
  async cancelSubscription(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.cancelSubscription(utilisateurId, user);
  }

  @Get('utilisateurs/:utilisateurId/actif')
  @ApiOperation({ summary: 'Abonnement actif' })
  @ApiResponse({ status: 200, type: UtilisateurAbonnementResponseDto })
  getActiveSubscription(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UtilisateurAbonnementResponseDto | null> {
    return this.service.getActiveSubscription(utilisateurId, user);
  }

  @Get('utilisateurs/:utilisateurId')
  @ApiOperation({ summary: 'Historique des abonnements' })
  getSubscriptionsHistory(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<UtilisateurAbonnementResponseDto>> {
    return this.service.getSubscriptionsHistory(utilisateurId, page, size, user);
  }

  @Post('boosts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un boost' })
  createBoost(
    @Body() request: CreateBoostRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BoostAnnonceResponseDto> {
    return this.service.createBoost(request, user);
  }

  @Put('boosts/:id')
  @ApiOperation({ summary: 'Mettre à jour un boost' })
  updateBoost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: CreateBoostRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BoostAnnonceResponseDto> {
    return this.service.updateBoost(id, request, user);
  }

  @Delete('boosts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un boost' })
  async deleteBoost(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteBoost(id, user);
  }

  @Get('boosts/:id')
  @ApiOperation({ summary: 'Obtenir un boost par ID' })
  getBoostById(@Param('id', new ParseUUIDPipe()) id: string): Promise<BoostAnnonceResponseDto> {
    return this.service.getBoostById(id);
  }

  @Get('vehicules/:vehiculeId/boosts')
  @ApiOperation({ summary: 'Boosts d\'un véhicule' })
  getBoostsByVehicule(
    @Param('vehiculeId', new ParseUUIDPipe()) vehiculeId: string,
  ): Promise<BoostAnnonceResponseDto[]> {
    return this.service.getBoostsByVehicule(vehiculeId);
  }
}
