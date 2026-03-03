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
import { UtilisateurResponseDto } from '../auth/dto/utilisateur-response.dto';
import { TransactionResponseDto } from '../paiement/dto/transaction-response.dto';
import { VehiculeResponseDto } from '../vehicule/dto/vehicule-response.dto';

import { AdminService } from './admin.service';
import { DashboardStatsResponseDto } from './dto/dashboard-stats-response.dto';
import { ModifierRoleRequestDto } from './dto/modifier-role-request.dto';

@ApiTags('Administration')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiExtraModels(PaginatedResponseDto, UtilisateurResponseDto, VehiculeResponseDto, TransactionResponseDto)
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Statistiques dashboard' })
  @ApiResponse({ status: 200, type: DashboardStatsResponseDto, description: 'Statistiques récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getDashboardStats(@CurrentUser() user: AuthenticatedUser): Promise<DashboardStatsResponseDto> {
    return this.service.getDashboardStats(user);
  }

  @Get('utilisateurs')
  @ApiOperation({ summary: 'Liste utilisateurs' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortDir', required: false, type: String, example: 'desc' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée avec succès',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        { properties: { content: { type: 'array', items: { $ref: getSchemaPath(UtilisateurResponseDto) } } } },
      ],
    },
  })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAllUtilisateurs(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortDir') sortDir = 'desc',
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<UtilisateurResponseDto>> {
    return this.service.getAllUtilisateurs(page, size, sortBy, sortDir, user);
  }

  @Get('utilisateurs/:utilisateurId')
  @ApiOperation({ summary: 'Utilisateur par ID' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: UtilisateurResponseDto, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getUtilisateurById(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UtilisateurResponseDto> {
    return this.service.getUtilisateurById(utilisateurId, user);
  }

  @Post('utilisateurs/:utilisateurId/suspendre')
  @ApiOperation({ summary: 'Suspendre utilisateur' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiQuery({ name: 'raison', type: String, required: true, example: 'Comportement frauduleux' })
  @ApiResponse({ status: 200, type: UtilisateurResponseDto, description: 'Utilisateur suspendu avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  suspendreUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('raison') raison: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UtilisateurResponseDto> {
    return this.service.suspendreUtilisateur(utilisateurId, raison, user);
  }

  @Post('utilisateurs/:utilisateurId/reactiver')
  @ApiOperation({ summary: 'Réactiver utilisateur' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: UtilisateurResponseDto, description: 'Utilisateur réactivé avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  reactiverUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UtilisateurResponseDto> {
    return this.service.reactiverUtilisateur(utilisateurId, user);
  }

  @Delete('utilisateurs/:utilisateurId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bannir utilisateur' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiQuery({ name: 'raison', type: String, required: true, example: 'Violation des conditions' })
  @ApiResponse({ status: 204, description: 'Utilisateur banni avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async bannirUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('raison') raison: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.bannirUtilisateur(utilisateurId, raison, user);
  }

  @Put('utilisateurs/:utilisateurId/role')
  @ApiOperation({ summary: 'Modifier rôle utilisateur' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: UtilisateurResponseDto, description: 'Rôle modifié avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Rôle invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  modifierRole(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Body() request: ModifierRoleRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UtilisateurResponseDto> {
    return this.service.modifierRole(utilisateurId, request, user);
  }

  @Get('annonces')
  @ApiOperation({ summary: 'Liste annonces' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortDir', required: false, type: String, example: 'desc' })
  @ApiResponse({
    status: 200,
    description: 'Liste des annonces récupérée avec succès',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        { properties: { content: { type: 'array', items: { $ref: getSchemaPath(VehiculeResponseDto) } } } },
      ],
    },
  })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAllAnnonces(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortDir') sortDir = 'desc',
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<VehiculeResponseDto>> {
    return this.service.getAllAnnonces(page, size, sortBy, sortDir, user);
  }

  @Post('annonces/:annonceId/valider')
  @ApiOperation({ summary: 'Valider annonce' })
  @ApiParam({ name: 'annonceId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: VehiculeResponseDto, description: 'Annonce validée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  validerAnnonce(
    @Param('annonceId', new ParseUUIDPipe()) annonceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    return this.service.validerAnnonce(annonceId, user);
  }

  @Post('annonces/:annonceId/desactiver')
  @ApiOperation({ summary: 'Désactiver annonce' })
  @ApiParam({ name: 'annonceId', type: String, format: 'uuid' })
  @ApiQuery({ name: 'raison', type: String, required: true, example: 'Annonce non conforme' })
  @ApiResponse({ status: 200, type: VehiculeResponseDto, description: 'Annonce désactivée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  desactiverAnnonce(
    @Param('annonceId', new ParseUUIDPipe()) annonceId: string,
    @Query('raison') raison: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    return this.service.desactiverAnnonce(annonceId, raison, user);
  }

  @Delete('annonces/:annonceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer annonce' })
  @ApiParam({ name: 'annonceId', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Annonce supprimée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Annonce non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async supprimerAnnonce(
    @Param('annonceId', new ParseUUIDPipe()) annonceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.supprimerAnnonce(annonceId, user);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Liste transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'createdAt' })
  @ApiQuery({ name: 'sortDir', required: false, type: String, example: 'desc' })
  @ApiResponse({
    status: 200,
    description: 'Liste des transactions récupérée avec succès',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        { properties: { content: { type: 'array', items: { $ref: getSchemaPath(TransactionResponseDto) } } } },
      ],
    },
  })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAllTransactions(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
    @Query('sortBy') sortBy = 'createdAt',
    @Query('sortDir') sortDir = 'desc',
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    return this.service.getAllTransactions(page, size, sortBy, sortDir, user);
  }

  @Get('utilisateurs/:utilisateurId/transactions')
  @ApiOperation({ summary: 'Transactions utilisateur' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Transactions récupérées avec succès',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        { properties: { content: { type: 'array', items: { $ref: getSchemaPath(TransactionResponseDto) } } } },
      ],
    },
  })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getTransactionsByUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<TransactionResponseDto>> {
    return this.service.getTransactionsByUtilisateur(utilisateurId, page, size, user);
  }

  @Get('commissions')
  @ApiOperation({ summary: 'Total commissions' })
  @ApiResponse({ status: 200, description: 'Total des commissions récupéré avec succès', schema: { type: 'number', example: 154320.5 } })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getTotalCommissions(@CurrentUser() user: AuthenticatedUser): Promise<number> {
    return this.service.getTotalCommissions(user);
  }

  @Post('transactions/:transactionId/rembourser')
  @ApiOperation({ summary: 'Rembourser transaction' })
  @ApiParam({ name: 'transactionId', type: String, format: 'uuid' })
  @ApiQuery({ name: 'raison', type: String, required: true, example: 'Litige validé' })
  @ApiResponse({ status: 200, type: TransactionResponseDto, description: 'Remboursement effectué avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Transaction non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  effectuerRemboursement(
    @Param('transactionId', new ParseUUIDPipe()) transactionId: string,
    @Query('raison') raison: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TransactionResponseDto> {
    return this.service.effectuerRemboursement(transactionId, raison, user);
  }

  @Post('notifications/broadcast')
  @ApiOperation({ summary: 'Notifier tous les utilisateurs' })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'titre', type: String, required: true, example: 'Maintenance' })
  @ApiQuery({ name: 'message', type: String, required: true, example: 'Intervention prévue à 22h' })
  @ApiResponse({
    status: 200,
    description: 'Notification envoyée à tous les utilisateurs',
    schema: { type: 'object', properties: { message: { type: 'string', example: 'Notification envoyée à tous les utilisateurs' } } },
  })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paramètres invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async notifierTousUtilisateurs(
    @Query('titre') titre: string,
    @Query('message') message: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.service.notifierTousUtilisateurs(titre, message, user);
    return { message: 'Notification envoyée à tous les utilisateurs' };
  }

  @Post('notifications/groupe')
  @ApiOperation({ summary: 'Notifier groupe utilisateurs' })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'utilisateurIds', required: true, isArray: true, type: String, example: ['550e8400-e29b-41d4-a716-446655440000'] })
  @ApiQuery({ name: 'titre', type: String, required: true, example: 'Information' })
  @ApiQuery({ name: 'message', type: String, required: true, example: 'Votre dossier a été mis à jour' })
  @ApiResponse({
    status: 200,
    description: 'Notification envoyée au groupe',
    schema: { type: 'object', properties: { message: { type: 'string', example: 'Notification envoyée au groupe' } } },
  })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paramètres invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async notifierGroupeUtilisateurs(
    @Query('utilisateurIds') utilisateurIds: string[] | string,
    @Query('titre') titre: string,
    @Query('message') message: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.service.notifierGroupeUtilisateurs(utilisateurIds, titre, message, user);
    return { message: 'Notification envoyée au groupe' };
  }
}
