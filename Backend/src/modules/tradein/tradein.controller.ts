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
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { ApiErrorResponseDto } from '../auth/dto/api-error-response.dto';

import { CreateDemandeTradeInRequestDto } from './dto/create-demande-tradein-request.dto';
import { DemandeTradeInResponseDto } from './dto/demande-tradein-response.dto';
import { EstimationRequestDto } from './dto/estimation-request.dto';
import { EstimationResponseDto } from './dto/estimation-response.dto';
import { ValidationRequestDto } from './dto/validation-request.dto';
import { TradeInService } from './tradein.service';

@ApiTags('Trade-In')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('tradein')
export class TradeInController {
  constructor(private readonly service: TradeInService) {}

  @Post('demandes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une demande de trade-in' })
  @ApiResponse({ status: 201, type: DemandeTradeInResponseDto, description: 'Demande créée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé' })
  createDemande(
    @Body() request: CreateDemandeTradeInRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.createDemande(request, user);
  }

  @Get('demandes')
  @ApiOperation({ summary: 'Liste des demandes trade-in' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, type: PaginatedResponseDto, description: 'Demandes récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé' })
  getAllDemandes(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<DemandeTradeInResponseDto>> {
    return this.service.getAllDemandes(page, size, user);
  }

  @Get('demandes/non-notifiees')
  @ApiOperation({ summary: 'Demandes non notifiées' })
  @ApiResponse({ status: 200, type: DemandeTradeInResponseDto, isArray: true, description: 'Demandes récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé' })
  getDemandesNonNotifiees(@CurrentUser() user: AuthenticatedUser): Promise<DemandeTradeInResponseDto[]> {
    return this.service.getDemandesNonNotifiees(user);
  }

  @Get('demandes/utilisateur/:utilisateurId')
  @ApiOperation({ summary: 'Demandes d\'un utilisateur' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: DemandeTradeInResponseDto, isArray: true, description: 'Demandes récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé' })
  getDemandesByUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto[]> {
    return this.service.getDemandesByUtilisateur(utilisateurId, user);
  }

  @Get('demandes/:id')
  @ApiOperation({ summary: 'Obtenir une demande par ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: DemandeTradeInResponseDto, description: 'Demande récupérée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Demande non trouvée' })
  getDemandeById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.getDemandeById(id, user);
  }

  @Put('demandes/:id')
  @ApiOperation({ summary: 'Mettre à jour une demande' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: DemandeTradeInResponseDto, description: 'Demande mise à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé' })
  updateDemande(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: CreateDemandeTradeInRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.updateDemande(id, request, user);
  }

  @Delete('demandes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une demande' })
  async deleteDemande(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteDemande(id, user);
  }

  @Post('estimation')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Estimer un véhicule' })
  @ApiResponse({ status: 201, type: EstimationResponseDto, description: 'Estimation calculée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  estimerVehicule(@Body() request: EstimationRequestDto): Promise<EstimationResponseDto> {
    return this.service.estimerVehicule(request);
  }

  @Post('demandes/:id/calculer-estimation')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Calculer estimation auto' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 201, type: DemandeTradeInResponseDto, description: 'Estimation recalculée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé' })
  calculerEstimationAuto(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.calculerEstimationAuto(id, user);
  }

  @Post('demandes/:id/validation')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Valider une demande' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 201, type: DemandeTradeInResponseDto, description: 'Demande validée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé' })
  validerDemande(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: ValidationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.validerDemande(id, request, user);
  }

  @Patch('demandes/:id/statut')
  @ApiOperation({ summary: 'Mettre à jour le statut' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'statut', type: String, required: true, example: 'EN_ATTENTE' })
  @ApiResponse({ status: 200, type: DemandeTradeInResponseDto, description: 'Statut mis à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Statut invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé' })
  updateStatut(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('statut') statut: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.updateStatutFromRaw(id, statut, user);
  }

  @Post('demandes/:id/notifier')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Notifier utilisateur' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 201, type: DemandeTradeInResponseDto, description: 'Notification envoyée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé' })
  notifierUtilisateur(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.notifierUtilisateur(id, user);
  }
}
