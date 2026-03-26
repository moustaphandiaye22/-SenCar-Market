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
import { ApiErrorResponseDto } from '../auth/dto/api-error-response.dto';

import { AnnonceLocationResponseDto } from './dto/annonce-location-response.dto';
import { CancelReservationRequestDto } from './dto/cancel-reservation-request.dto';
import { CreateAnnonceLocationRequestDto } from './dto/create-annonce-location-request.dto';
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto';
import { DisponibiliteLocationResponseDto } from './dto/disponibilite-location-response.dto';
import { DisponibiliteRequestDto } from './dto/disponibilite-request.dto';
import { HistoriqueStatutResponseDto } from './dto/historique-statut-response.dto';
import { ReservationLocationResponseDto } from './dto/reservation-location-response.dto';
import { UpdateAnnonceLocationRequestDto } from './dto/update-annonce-location-request.dto';
import { LocationService } from './location.service';

@ApiTags('Locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationController {
  constructor(private readonly service: LocationService) {}

  @Post('annonces')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer une annonce de location' })
  @ApiResponse({ status: 200, type: AnnonceLocationResponseDto, description: 'Annonce de location créée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createAnnonceLocation(
    @Body() request: CreateAnnonceLocationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto> {
    return this.service.createAnnonceLocation(request, user);
  }

  @Put('annonces/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour une annonce' })
  @ApiResponse({ status: 200, type: AnnonceLocationResponseDto, description: 'Annonce mise à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  updateAnnonceLocation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: UpdateAnnonceLocationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto> {
    return this.service.updateAnnonceLocation(id, request, user);
  }

  @Delete('annonces/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une annonce' })
  @ApiResponse({ status: 204, description: 'Annonce supprimée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async deleteAnnonceLocation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteAnnonceLocation(id, user);
  }

  @Get('annonces')
  @ApiOperation({ summary: 'Liste des annonces (paginée)' })
  @ApiResponse({ status: 200, type: PaginatedResponseDto, description: 'Annonces récupérées avec succès' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAllAnnoncesLocation(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<AnnonceLocationResponseDto>> {
    return this.service.getAllAnnoncesLocationPaginated(page, size);
  }

  @Get('mes-annonces')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mes annonces' })
  @ApiResponse({ status: 200, type: AnnonceLocationResponseDto, isArray: true, description: 'Mes annonces récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getMesAnnonces(@CurrentUser() user: AuthenticatedUser): Promise<AnnonceLocationResponseDto[]> {
    return this.service.getMesAnnoncesLocation(user);
  }

  @Get('annonces/:id')
  @ApiOperation({ summary: 'Obtenir une annonce par ID' })
  @ApiResponse({ status: 200, type: AnnonceLocationResponseDto, description: 'Annonce trouvée' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAnnonceLocationById(@Param('id', new ParseUUIDPipe()) id: string): Promise<AnnonceLocationResponseDto> {
    return this.service.getAnnonceLocationById(id);
  }

  @Post('annonces/:id/activer')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activer une annonce' })
  @ApiResponse({ status: 200, type: AnnonceLocationResponseDto, description: 'Annonce activée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  activerAnnonce(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto> {
    return this.service.activerDesactiverAnnonce(id, true, user);
  }

  @Post('annonces/:id/desactiver')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Désactiver une annonce' })
  @ApiResponse({ status: 200, type: AnnonceLocationResponseDto, description: 'Annonce désactivée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  desactiverAnnonce(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto> {
    return this.service.activerDesactiverAnnonce(id, false, user);
  }

  @Post('reservations')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer une réservation' })
  @ApiResponse({ status: 200, type: ReservationLocationResponseDto, description: 'Réservation créée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createReservation(
    @Body() request: CreateReservationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    return this.service.createReservation(request, user);
  }

  @Put('reservations/:id/statut')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une réservation' })
  @ApiResponse({ status: 200, type: ReservationLocationResponseDto, description: 'Statut mis à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Statut invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Réservation non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  updateStatutReservation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('statut') statut: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    return this.service.updateStatutReservation(id, statut, user);
  }

  @Post('reservations/:id/process-payment')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Traiter le paiement et confirmer la réservation' })
  @ApiResponse({ status: 200, type: ReservationLocationResponseDto, description: 'Réservation confirmée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paiement non confirmé' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Réservation ou paiement non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  processPayment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    return this.service.processPayment(id, user);
  }

  @Post('reservations/:id/annuler')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Annuler une réservation' })
  @ApiResponse({
    status: 200,
    description: 'Réservation annulée avec succès',
    schema: { type: 'object', properties: { message: { type: 'string', example: 'Réservation annulée avec succès' } } },
  })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Impossible d\'annuler la réservation' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Réservation non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async cancelReservation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body?: CancelReservationRequestDto,
  ): Promise<{ message: string }> {
    await this.service.cancelReservation(id, body, user);
    return { message: 'Réservation annulée avec succès' };
  }

  @Get('reservations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtenir une réservation par ID' })
  @ApiResponse({ status: 200, type: ReservationLocationResponseDto, description: 'Réservation trouvée' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Réservation non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getReservationById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    return this.service.getReservationById(id, user);
  }

  @Get('mes-reservations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mes réservations' })
  @ApiResponse({ status: 200, type: ReservationLocationResponseDto, isArray: true, description: 'Mes réservations récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getMesReservations(@CurrentUser() user: AuthenticatedUser): Promise<ReservationLocationResponseDto[]> {
    return this.service.getMesReservations(user);
  }

  @Get('annonces/:id/reservations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Réservations d\'une annonce' })
  @ApiResponse({ status: 200, type: ReservationLocationResponseDto, isArray: true, description: 'Réservations récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getReservationsByAnnonce(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto[]> {
    return this.service.getReservationsByAnnonce(id, user);
  }

  @Post('annonces/:id/disponibilites')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ajouter des disponibilités' })
  @ApiResponse({ status: 200, type: DisponibiliteLocationResponseDto, isArray: true, description: 'Disponibilités ajoutées avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  ajouterDisponibilites(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: DisponibiliteRequestDto[],
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DisponibiliteLocationResponseDto[]> {
    return this.service.ajouterDisponibilites(id, request, user);
  }

  @Get('annonces/:id/disponibilites')
  @ApiOperation({ summary: 'Obtenir les disponibilités' })
  @ApiResponse({ status: 200, type: DisponibiliteLocationResponseDto, isArray: true, description: 'Disponibilités récupérées avec succès' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getDisponibilites(@Param('id', new ParseUUIDPipe()) id: string): Promise<DisponibiliteLocationResponseDto[]> {
    return this.service.getDisponibilites(id);
  }

  @Delete('annonces/:id/disponibilites')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer les disponibilités' })
  @ApiResponse({ status: 204, description: 'Disponibilités supprimées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async supprimerDisponibilites(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.supprimerDisponibilites(id, user);
  }

  @Get('reservations/:id/historique')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Historique des statuts' })
  @ApiResponse({ status: 200, type: HistoriqueStatutResponseDto, isArray: true, description: 'Historique récupéré avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Réservation non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getHistoriqueStatuts(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HistoriqueStatutResponseDto[]> {
    return this.service.getHistoriqueStatuts(id, user);
  }

  @Put('reservations/:id/statut-avec-historique')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour le statut avec historique' })
  @ApiResponse({ status: 200, type: ReservationLocationResponseDto, description: 'Statut mis à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Statut invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Réservation non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  updateStatutReservationAvecHistorique(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('statut') statut: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    return this.service.updateStatutReservationAvecHistorique(id, statut, user);
  }
}
