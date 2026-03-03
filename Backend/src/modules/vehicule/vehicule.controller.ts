import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { ApiErrorResponseDto } from '../auth/dto/api-error-response.dto';

import { CreateVehiculeRequestDto } from './dto/create-vehicule-request.dto';
import { VehiculeFilterDto } from './dto/vehicule-filter.dto';
import { VehiculeResponseDto } from './dto/vehicule-response.dto';
import { VehiculeService } from './vehicule.service';

@ApiTags('Véhicules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels(PaginatedResponseDto, VehiculeResponseDto)
@Controller('vehicules')
export class VehiculeController {
  constructor(private readonly vehiculeService: VehiculeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer une annonce de véhicule' })
  @ApiResponse({ status: 200, type: VehiculeResponseDto, description: 'Véhicule créé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createVehicule(
    @Body() request: CreateVehiculeRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    return this.vehiculeService.createVehicule(request, user);
  }

  @Get()
  @ApiOperation({ summary: 'Rechercher des véhicules' })
  @ApiResponse({
    status: 200,
    description: 'Véhicules récupérés avec succès',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        { properties: { content: { type: 'array', items: { $ref: getSchemaPath(VehiculeResponseDto) } } } },
      ],
    },
  })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paramètres de filtre invalides' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  searchVehicules(
    @Query() filter: VehiculeFilterDto,
  ): Promise<PaginatedResponseDto<VehiculeResponseDto>> {
    return this.vehiculeService.searchVehicules(filter);
  }

  @Get('moi')
  @ApiOperation({ summary: 'Obtenir mes véhicules' })
  @ApiResponse({ status: 200, type: VehiculeResponseDto, isArray: true, description: 'Mes véhicules récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getMesVehicules(@CurrentUser() user: AuthenticatedUser): Promise<VehiculeResponseDto[]> {
    return this.vehiculeService.getMesVehicules(user);
  }

  @Get('favoris/moi')
  @ApiOperation({ summary: 'Obtenir mes favoris' })
  @ApiResponse({ status: 200, type: VehiculeResponseDto, isArray: true, description: 'Favoris récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getMesFavoris(@CurrentUser() user: AuthenticatedUser): Promise<VehiculeResponseDto[]> {
    return this.vehiculeService.getMesFavoris(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un véhicule par ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: VehiculeResponseDto, description: 'Véhicule trouvé' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Véhicule non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getVehiculeById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    return this.vehiculeService.getVehiculeById(id, user);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publier un véhicule' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: VehiculeResponseDto, description: 'Véhicule publié avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Vous n\'êtes pas propriétaire du véhicule' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Véhicule non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  publishVehicule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    return this.vehiculeService.publishVehicule(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Véhicule supprimé avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Vous n\'êtes pas propriétaire du véhicule' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Véhicule non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async deleteVehicule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.vehiculeService.deleteVehicule(id, user);
  }

  @Post(':id/favoris')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ajouter aux favoris' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Véhicule ajouté aux favoris',
    schema: { type: 'object', properties: { message: { type: 'string', example: 'Véhicule ajouté aux favoris' } } },
  })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Véhicule non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async addToFavoris(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.vehiculeService.addToFavoris(id, user);
    return { message: 'Véhicule ajouté aux favoris' };
  }

  @Delete(':id/favoris')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirer des favoris' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Véhicule retiré des favoris' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Véhicule non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async removeFromFavoris(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.vehiculeService.removeFromFavoris(id, user);
  }

  @Post(':id/boost')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Booster un véhicule' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'debut', type: String, required: true, example: '2026-03-01T08:00:00.000Z' })
  @ApiQuery({ name: 'fin', type: String, required: true, example: '2026-03-07T08:00:00.000Z' })
  @ApiResponse({ status: 200, type: VehiculeResponseDto, description: 'Véhicule boosté avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paramètres de boost invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Vous n\'êtes pas propriétaire du véhicule' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Véhicule non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  boostVehicule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('debut') debut: string,
    @Query('fin') fin: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    return this.vehiculeService.boostVehicule(id, debut, fin, user);
  }
}
