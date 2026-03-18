import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFloatPipe,
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
import { ApiErrorResponseDto } from '../auth/dto/api-error-response.dto';

import { AssociateServiceRequestDto } from './dto/associate-service-request.dto';
import { CreateGarageRequestDto } from './dto/create-garage-request.dto';
import { CreateServiceGarageRequestDto } from './dto/create-service-garage-request.dto';
import { GarageResponseDto } from './dto/garage-response.dto';
import { GarageServiceResponseDto } from './dto/garage-service-response.dto';
import { ServiceGarageResponseDto } from './dto/service-garage-response.dto';
import { ValidationGarageRequestDto } from './dto/validation-garage-request.dto';
import { GarageService } from './garage.service';

@ApiTags('Garages')
@ApiBearerAuth()
@Controller('garages')
export class GarageController {
  constructor(private readonly service: GarageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un garage' })
  @ApiResponse({ status: 201, type: GarageResponseDto, description: 'Garage créé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createGarage(
    @Body() request: CreateGarageRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageResponseDto> {
    return this.service.createGarage(request, user);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des garages' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto, description: 'Garages récupérés avec succès' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAllGarages(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<GarageResponseDto>> {
    return this.service.getAllGarages(page, size);
  }

  @Get('actifs')
  @ApiOperation({ summary: 'Garages actifs' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto, description: 'Garages actifs récupérés avec succès' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getActiveGarages(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<GarageResponseDto>> {
    return this.service.getActiveGarages(page, size);
  }

  @Get('en-attente')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Garages en attente' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto, description: 'Garages en attente récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getGaragesEnAttente(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<GarageResponseDto>> {
    return this.service.getGaragesEnAttente(page, size, user);
  }

  @Get('proprietaire/:proprietaireId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Garages d\'un propriétaire' })
  @ApiResponse({ status: 200, type: GarageResponseDto, isArray: true, description: 'Garages du propriétaire récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Propriétaire non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getGaragesByProprietaire(
    @Param('proprietaireId', new ParseUUIDPipe()) proprietaireId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageResponseDto[]> {
    return this.service.getGaragesByProprietaire(proprietaireId, user);
  }

  @Get('search/ville')
  @ApiOperation({ summary: 'Rechercher par ville' })
  @ApiResponse({ status: 200, type: GarageResponseDto, isArray: true, description: 'Garages trouvés par ville' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paramètre ville requis' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  searchByVille(@Query('ville') ville: string): Promise<GarageResponseDto[]> {
    return this.service.searchByLocalisation(ville);
  }

  @Get('search/proximity')
  @ApiOperation({ summary: 'Rechercher par proximité' })
  @ApiResponse({ status: 200, type: GarageResponseDto, isArray: true, description: 'Garages trouvés par proximité' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paramètres latitude et longitude requis' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  searchByProximity(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('rayonKm', new ParseFloatPipe({ optional: true })) rayonKm = 10,
  ): Promise<GarageResponseDto[]> {
    return this.service.searchByProximity(latitude, longitude, rayonKm);
  }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher des garages' })
  @ApiResponse({ status: 200, type: GarageResponseDto, isArray: true, description: 'Garages trouvés' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paramètre de recherche requis' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  searchGarages(@Query('q') q: string): Promise<GarageResponseDto[]> {
    return this.service.searchGarages(q);
  }

  @Post('services')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un service garage' })
  @ApiResponse({ status: 201, type: ServiceGarageResponseDto, description: 'Service garage créé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createService(
    @Body() request: CreateServiceGarageRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ServiceGarageResponseDto> {
    return this.service.createService(request, user);
  }

  @Get('services')
  @ApiOperation({ summary: 'Liste des services' })
  @ApiResponse({ status: 200, type: ServiceGarageResponseDto, isArray: true, description: 'Services récupérés avec succès' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAllServices(): Promise<ServiceGarageResponseDto[]> {
    return this.service.getAllServices();
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Obtenir un service par ID' })
  @ApiResponse({ status: 200, type: ServiceGarageResponseDto, description: 'Service trouvé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Service non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getServiceById(@Param('id', new ParseUUIDPipe()) id: string): Promise<ServiceGarageResponseDto> {
    return this.service.getServiceById(id);
  }

  @Post(':garageId/services')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Associer un service à un garage' })
  @ApiResponse({ status: 201, type: GarageServiceResponseDto, description: 'Service associé au garage avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Garage ou service non trouvé' })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Conflict - Service déjà associé au garage' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  associateService(
    @Param('garageId', new ParseUUIDPipe()) garageId: string,
    @Body() request: AssociateServiceRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageServiceResponseDto> {
    return this.service.associateService(garageId, request, user);
  }

  @Get(':garageId/services')
  @ApiOperation({ summary: 'Services d\'un garage' })
  @ApiResponse({ status: 200, type: GarageServiceResponseDto, isArray: true, description: 'Services du garage récupérés avec succès' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Garage non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getServicesByGarage(@Param('garageId', new ParseUUIDPipe()) garageId: string): Promise<GarageServiceResponseDto[]> {
    return this.service.getServicesByGarage(garageId);
  }

  @Delete(':garageId/services/:serviceId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer association service-garage' })
  @ApiResponse({ status: 204, description: 'Association supprimée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Association non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async disassociateService(
    @Param('garageId', new ParseUUIDPipe()) garageId: string,
    @Param('serviceId', new ParseUUIDPipe()) serviceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.disassociateService(garageId, serviceId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un garage par ID' })
  @ApiResponse({ status: 200, type: GarageResponseDto, description: 'Garage trouvé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Garage non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getGarageById(@Param('id', new ParseUUIDPipe()) id: string): Promise<GarageResponseDto> {
    return this.service.getGarageById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour un garage' })
  @ApiResponse({ status: 200, type: GarageResponseDto, description: 'Garage mis à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Vous n\'êtes pas propriétaire du garage' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Garage non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  updateGarage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: CreateGarageRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageResponseDto> {
    return this.service.updateGarage(id, request, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un garage' })
  @ApiResponse({ status: 204, description: 'Garage supprimé avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Vous n\'êtes pas propriétaire du garage' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Garage non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async deleteGarage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteGarage(id, user);
  }

  @Post(':id/validate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Valider un garage' })
  @ApiResponse({ status: 200, type: GarageResponseDto, description: 'Garage validé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données de validation invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Garage non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  validerGarage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: ValidationGarageRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageResponseDto> {
    return this.service.validerGarage(id, request, user);
  }

  @Put(':id/logo')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour le logo' })
  @ApiResponse({ status: 200, type: GarageResponseDto, description: 'Logo mis à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'URL du logo invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Vous n\'êtes pas propriétaire du garage' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Garage non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  updateLogo(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('logoUrl') logoUrl: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageResponseDto> {
    return this.service.updateLogo(id, logoUrl, user);
  }
}
