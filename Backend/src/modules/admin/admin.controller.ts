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
import { UtilisateurResponseDto } from '../auth/dto/utilisateur-response.dto';
import { TransactionResponseDto } from '../paiement/dto/transaction-response.dto';
import { VehiculeResponseDto } from '../vehicule/dto/vehicule-response.dto';

import { AdminService } from './admin.service';
import { DashboardStatsResponseDto } from './dto/dashboard-stats-response.dto';
import { ModifierRoleRequestDto } from './dto/modifier-role-request.dto';

@ApiTags('Administration')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs récupérée avec succès' })
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
  @ApiResponse({ status: 200, description: 'Liste des annonces récupérée avec succès' })
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
  @ApiResponse({ status: 200, description: 'Liste des transactions récupérée avec succès' })
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
  @ApiResponse({ status: 200, description: 'Transactions récupérées avec succès' })
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
  @ApiResponse({ status: 200, description: 'Total des commissions récupéré avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getTotalCommissions(@CurrentUser() user: AuthenticatedUser): Promise<number> {
    return this.service.getTotalCommissions(user);
  }

  @Post('transactions/:transactionId/rembourser')
  @ApiOperation({ summary: 'Rembourser transaction' })
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
  @ApiResponse({ status: 200, description: 'Notification envoyée à tous les utilisateurs' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paramètres invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async notifierTousUtilisateurs(
    @Query('titre') titre: string,
    @Query('message') message: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.notifierTousUtilisateurs(titre, message, user);
  }

  @Post('notifications/groupe')
  @ApiOperation({ summary: 'Notifier groupe utilisateurs' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Notification envoyée au groupe' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paramètres invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès réservé aux administrateurs' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async notifierGroupeUtilisateurs(
    @Query('utilisateurIds') utilisateurIds: string[] | string,
    @Query('titre') titre: string,
    @Query('message') message: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.notifierGroupeUtilisateurs(utilisateurIds, titre, message, user);
  }
}
