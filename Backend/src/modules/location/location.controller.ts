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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

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
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationController {
  constructor(private readonly service: LocationService) {}

  @Post('annonces')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer une annonce de location' })
  createAnnonceLocation(
    @Body() request: CreateAnnonceLocationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto> {
    return this.service.createAnnonceLocation(request, user);
  }

  @Put('annonces/:id')
  @ApiOperation({ summary: 'Mettre à jour une annonce' })
  updateAnnonceLocation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: UpdateAnnonceLocationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto> {
    return this.service.updateAnnonceLocation(id, request, user);
  }

  @Delete('annonces/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une annonce' })
  async deleteAnnonceLocation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteAnnonceLocation(id, user);
  }

  @Get('annonces')
  @ApiOperation({ summary: 'Liste des annonces' })
  getAllAnnoncesLocation(): Promise<AnnonceLocationResponseDto[]> {
    return this.service.getAllAnnoncesLocation();
  }

  @Get('mes-annonces')
  @ApiOperation({ summary: 'Mes annonces' })
  getMesAnnonces(@CurrentUser() user: AuthenticatedUser): Promise<AnnonceLocationResponseDto[]> {
    return this.service.getMesAnnoncesLocation(user);
  }

  @Get('annonces/:id')
  @ApiOperation({ summary: 'Obtenir une annonce par ID' })
  getAnnonceLocationById(@Param('id', new ParseUUIDPipe()) id: string): Promise<AnnonceLocationResponseDto> {
    return this.service.getAnnonceLocationById(id);
  }

  @Post('annonces/:id/activer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activer une annonce' })
  activerAnnonce(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto> {
    return this.service.activerDesactiverAnnonce(id, true, user);
  }

  @Post('annonces/:id/desactiver')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Désactiver une annonce' })
  desactiverAnnonce(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AnnonceLocationResponseDto> {
    return this.service.activerDesactiverAnnonce(id, false, user);
  }

  @Post('reservations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer une réservation' })
  createReservation(
    @Body() request: CreateReservationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    return this.service.createReservation(request, user);
  }

  @Put('reservations/:id/statut')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une réservation' })
  updateStatutReservation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('statut') statut: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    return this.service.updateStatutReservation(id, statut, user);
  }

  @Post('reservations/:id/annuler')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Annuler une réservation' })
  async cancelReservation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() body?: CancelReservationRequestDto,
  ): Promise<void> {
    await this.service.cancelReservation(id, body, user);
  }

  @Get('reservations/:id')
  @ApiOperation({ summary: 'Obtenir une réservation par ID' })
  getReservationById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    return this.service.getReservationById(id, user);
  }

  @Get('mes-reservations')
  @ApiOperation({ summary: 'Mes réservations' })
  getMesReservations(@CurrentUser() user: AuthenticatedUser): Promise<ReservationLocationResponseDto[]> {
    return this.service.getMesReservations(user);
  }

  @Get('annonces/:id/reservations')
  @ApiOperation({ summary: 'Réservations d\'une annonce' })
  getReservationsByAnnonce(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto[]> {
    return this.service.getReservationsByAnnonce(id, user);
  }

  @Post('annonces/:id/disponibilites')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ajouter des disponibilités' })
  ajouterDisponibilites(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: DisponibiliteRequestDto[],
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DisponibiliteLocationResponseDto[]> {
    return this.service.ajouterDisponibilites(id, request, user);
  }

  @Get('annonces/:id/disponibilites')
  @ApiOperation({ summary: 'Obtenir les disponibilités' })
  getDisponibilites(@Param('id', new ParseUUIDPipe()) id: string): Promise<DisponibiliteLocationResponseDto[]> {
    return this.service.getDisponibilites(id);
  }

  @Delete('annonces/:id/disponibilites')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer les disponibilités' })
  async supprimerDisponibilites(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.supprimerDisponibilites(id, user);
  }

  @Get('reservations/:id/historique')
  @ApiOperation({ summary: 'Historique des statuts' })
  getHistoriqueStatuts(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HistoriqueStatutResponseDto[]> {
    return this.service.getHistoriqueStatuts(id, user);
  }

  @Put('reservations/:id/statut-avec-historique')
  @ApiOperation({ summary: 'Mettre à jour le statut avec historique' })
  @ApiResponse({ status: 200, type: ReservationLocationResponseDto })
  updateStatutReservationAvecHistorique(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('statut') statut: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ReservationLocationResponseDto> {
    return this.service.updateStatutReservationAvecHistorique(id, statut, user);
  }
}
