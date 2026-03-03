import {
  Body,
  Controller,
  Get,
  Headers,
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
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { ApiErrorResponseDto } from '../auth/dto/api-error-response.dto';

import { CreatePaiementRequestDto } from './dto/create-paiement-request.dto';
import { PaiementLogResponseDto } from './dto/paiement-log-response.dto';
import { PaiementResponseDto } from './dto/paiement-response.dto';
import { PortefeuilleResponseDto } from './dto/portefeuille-response.dto';
import { RetraitRequestDto } from './dto/retrait-request.dto';
import { TransactionPortefeuilleRequestDto } from './dto/transaction-portefeuille-request.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { PaiementService } from './paiement.service';
import { STATUT_PAIEMENT_VALUES } from './types/paiement.types';

@ApiTags('Paiements')
@ApiExtraModels(PaginatedResponseDto, PaiementResponseDto)
@ApiResponse({
  status: 429,
  type: ApiErrorResponseDto,
  description: 'Trop de requêtes - Veuillez réessayer plus tard',
})
@Controller('paiements')
@UseGuards(ThrottlerGuard)
export class PaiementController {
  constructor(private readonly service: PaiementService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer un paiement' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, description: 'Paiement créé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createPaiement(
    @Body() request: CreatePaiementRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.createPaiement(request, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir tous les paiements (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Numéro de page (>= 1)' })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20, description: 'Taille de page (max 100)' })
  @ApiResponse({
    status: 200,
    description: 'Liste des paiements récupérée avec succès',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            content: {
              type: 'array',
              items: { $ref: getSchemaPath(PaiementResponseDto) },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAllPaiements(
    @Query('page') pageRaw: string | undefined,
    @Query('size') sizeRaw: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<PaiementResponseDto>> {
    const page = pageRaw ? parseInt(pageRaw, 10) : 1;
    const size = sizeRaw ? parseInt(sizeRaw, 10) : 20;
    return this.service.getAllPaiements(page, size, user);
  }

  @Post('wave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer un paiement Wave' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, description: 'Paiement Wave créé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createPaiementWave(
    @Body() request: CreatePaiementRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.createPaiementWave(request, user);
  }

  @Post('orange-money')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer un paiement Orange Money' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, description: 'Paiement Orange Money créé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createPaiementOrangeMoney(
    @Body() request: CreatePaiementRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.createPaiementOrangeMoney(request, user);
  }

  @Post('escrow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer un paiement escrow' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, description: 'Paiement escrow créé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createPaiementEscrow(
    @Body() request: CreatePaiementRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.createPaiementEscrow(request, user);
  }

  @Get('utilisateur/:utilisateurId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Paiements d\'un utilisateur' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, isArray: true, description: 'Paiements récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getPaiementsByUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto[]> {
    return this.service.getPaiementsByUtilisateur(utilisateurId, user);
  }

  @Get('reservation/:reservationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Paiements par réservation' })
  @ApiParam({ name: 'reservationId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, isArray: true, description: 'Paiements récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getPaiementsByReservation(
    @Param('reservationId', new ParseUUIDPipe()) reservationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto[]> {
    return this.service.getPaiementsByReservation(reservationId, user);
  }

  @Get('statut/:statut')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Paiements par statut' })
  @ApiParam({ name: 'statut', enum: STATUT_PAIEMENT_VALUES, description: 'Statut du paiement' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, isArray: true, description: 'Paiements récupérés avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Statut de paiement invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getPaiementsByStatut(
    @Param('statut') statut: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto[]> {
    return this.service.getPaiementsByStatut(statut, user);
  }

  @Put(':id/confirmer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirmer un paiement' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'referenceExterne', type: String, required: true, example: 'TXN_WAVE_20260228_001' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, description: 'Paiement confirmé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  confirmerPaiement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('referenceExterne') referenceExterne: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.confirmerPaiement(id, referenceExterne, user);
  }

  @Put(':id/annuler')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Annuler un paiement' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, description: 'Paiement annulé avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  annulerPaiement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.annulerPaiement(id, user);
  }

  @Post(':id/rembourser')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rembourser un paiement' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'montant', type: Number, required: true, example: 10000, description: 'Montant à rembourser' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, description: 'Paiement remboursé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Montant invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  rembourserPaiement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('montant') montantRaw: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.remboursementPaiementFromRaw(id, montantRaw, user);
  }

  @Post(':id/confirmer-liberer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirmer réception et libérer fonds' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, description: 'Fonds libérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  confirmerReceptionEtLiberer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.confirmerReceptionEtLiberer(id, user);
  }

  @Post('webhook/wave')
  @HttpCode(HttpStatus.OK)
  @Throttle({ webhook: { limit: 120, ttl: 60000 } })
  @ApiOperation({ summary: 'Webhook Wave' })
  @ApiHeader({ name: 'x-wave-signature', required: true, description: 'Signature HMAC Wave du payload brut' })
  @ApiResponse({
    status: 200,
    description: 'Webhook traité avec succès',
    schema: {
      type: 'object',
      properties: { result: { type: 'string', example: 'PROCESSED' } },
    },
  })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Signature invalide' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async webhookWave(
    @Body() payload: unknown,
    @Headers('x-wave-signature') signature: string,
  ): Promise<{ result: string }> {
    const result = await this.service.processWaveWebhookFromPayload(payload, signature);
    return { result };
  }

  @Post('webhook/orange-money')
  @HttpCode(HttpStatus.OK)
  @Throttle({ webhook: { limit: 120, ttl: 60000 } })
  @ApiOperation({ summary: 'Webhook Orange Money' })
  @ApiHeader({ name: 'x-om-signature', required: true, description: 'Signature HMAC Orange Money du payload brut' })
  @ApiResponse({
    status: 200,
    description: 'Webhook traité avec succès',
    schema: {
      type: 'object',
      properties: { result: { type: 'string', example: 'PROCESSED' } },
    },
  })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Signature invalide' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async webhookOrangeMoney(
    @Body() payload: unknown,
    @Headers('x-om-signature') signature: string,
  ): Promise<{ result: string }> {
    const result = await this.service.processOrangeMoneyWebhookFromPayload(payload, signature);
    return { result };
  }

  @Get('portefeuille/utilisateur/:utilisateurId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir le portefeuille' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PortefeuilleResponseDto, description: 'Portefeuille récupéré avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getPortefeuille(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PortefeuilleResponseDto> {
    return this.service.getOrCreatePortefeuille(utilisateurId, user);
  }

  @Post('portefeuille/crediter')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créditer le portefeuille' })
  @ApiResponse({ status: 200, type: PortefeuilleResponseDto, description: 'Portefeuille crédité avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Solde insuffisant' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  crediterPortefeuille(
    @Body() request: TransactionPortefeuilleRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PortefeuilleResponseDto> {
    return this.service.crediterPortefeuille(request, user);
  }

  @Post('portefeuille/debiter')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Débiter le portefeuille' })
  @ApiResponse({ status: 200, type: PortefeuilleResponseDto, description: 'Portefeuille débité avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Solde insuffisant' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  debiterPortefeuille(
    @Body() request: TransactionPortefeuilleRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PortefeuilleResponseDto> {
    return this.service.debiterPortefeuille(request, user);
  }

  @Post('portefeuille/retrait')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demander un retrait' })
  @ApiResponse({ status: 200, type: TransactionResponseDto, description: 'Retrait demandé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Solde insuffisant' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  demanderRetrait(
    @Body() request: RetraitRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    return this.service.demanderRetrait(request, user);
  }

  @Get('transactions/utilisateur/:utilisateurId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Historique des transactions' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: TransactionResponseDto, isArray: true, description: 'Transactions récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getHistoriqueTransactions(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TransactionResponseDto[]> {
    return this.service.getHistoriqueTransactions(utilisateurId, user);
  }

  @Get('transactions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir une transaction par ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: TransactionResponseDto, description: 'Transaction récupérée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Transaction non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getTransactionById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    return this.service.getTransactionById(id, user);
  }

  @Get('commission/calculer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculer la commission' })
  @ApiQuery({ name: 'montant', type: Number, required: true, example: 25000, description: 'Montant de base' })
  @ApiResponse({
    status: 200,
    description: 'Commission calculée avec succès',
    schema: { type: 'number', example: 1250 },
  })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Montant invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  calculateCommission(
    @Query('montant') montantRaw: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<number> {
    return this.service.calculateCommissionForUserFromRaw(montantRaw, user);
  }

  @Get(':id/logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logs d\'un paiement' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaiementLogResponseDto, isArray: true, description: 'Logs récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getLogsByPaiement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementLogResponseDto[]> {
    return this.service.getLogsByPaiement(id, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir un paiement par ID' })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: PaiementResponseDto, description: 'Paiement récupéré avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Paiement non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getPaiementById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.getPaiementById(id, user);
  }
}
