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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
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
  getDashboardStats(@CurrentUser() user: AuthenticatedUser): Promise<DashboardStatsResponseDto> {
    return this.service.getDashboardStats(user);
  }

  @Get('utilisateurs')
  @ApiOperation({ summary: 'Liste utilisateurs' })
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
  getUtilisateurById(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UtilisateurResponseDto> {
    return this.service.getUtilisateurById(utilisateurId, user);
  }

  @Post('utilisateurs/:utilisateurId/suspendre')
  @ApiOperation({ summary: 'Suspendre utilisateur' })
  suspendreUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('raison') raison: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UtilisateurResponseDto> {
    return this.service.suspendreUtilisateur(utilisateurId, raison, user);
  }

  @Post('utilisateurs/:utilisateurId/reactiver')
  @ApiOperation({ summary: 'Réactiver utilisateur' })
  reactiverUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UtilisateurResponseDto> {
    return this.service.reactiverUtilisateur(utilisateurId, user);
  }

  @Delete('utilisateurs/:utilisateurId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bannir utilisateur' })
  async bannirUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('raison') raison: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.bannirUtilisateur(utilisateurId, raison, user);
  }

  @Put('utilisateurs/:utilisateurId/role')
  @ApiOperation({ summary: 'Modifier rôle utilisateur' })
  modifierRole(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Body() request: ModifierRoleRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UtilisateurResponseDto> {
    return this.service.modifierRole(utilisateurId, request, user);
  }

  @Get('annonces')
  @ApiOperation({ summary: 'Liste annonces' })
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
  validerAnnonce(
    @Param('annonceId', new ParseUUIDPipe()) annonceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    return this.service.validerAnnonce(annonceId, user);
  }

  @Post('annonces/:annonceId/desactiver')
  @ApiOperation({ summary: 'Désactiver annonce' })
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
  async supprimerAnnonce(
    @Param('annonceId', new ParseUUIDPipe()) annonceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.supprimerAnnonce(annonceId, user);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Liste transactions' })
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
  getTotalCommissions(@CurrentUser() user: AuthenticatedUser): Promise<number> {
    return this.service.getTotalCommissions(user);
  }

  @Post('transactions/:transactionId/rembourser')
  @ApiOperation({ summary: 'Rembourser transaction' })
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
  async notifierGroupeUtilisateurs(
    @Query('utilisateurIds') utilisateurIds: string[] | string,
    @Query('titre') titre: string,
    @Query('message') message: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.notifierGroupeUtilisateurs(utilisateurIds, titre, message, user);
  }
}
