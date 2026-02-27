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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

import { CreatePaiementRequestDto } from './dto/create-paiement-request.dto';
import { PaiementLogResponseDto } from './dto/paiement-log-response.dto';
import { PaiementResponseDto } from './dto/paiement-response.dto';
import { PortefeuilleResponseDto } from './dto/portefeuille-response.dto';
import { RetraitRequestDto } from './dto/retrait-request.dto';
import { TransactionPortefeuilleRequestDto } from './dto/transaction-portefeuille-request.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { PaiementService } from './paiement.service';

@ApiTags('Paiements')
@Controller('paiements')
export class PaiementController {
  constructor(private readonly service: PaiementService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer un paiement' })
  createPaiement(
    @Body() request: CreatePaiementRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.createPaiement(request, user);
  }

  @Post('wave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer un paiement Wave' })
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
  confirmerReceptionEtLiberer(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.confirmerReceptionEtLiberer(id, user);
  }

  @Post('webhook/wave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Wave' })
  async webhookWave(
    @Body() payload: unknown,
    @Headers('x-wave-signature') signature: string,
  ): Promise<{ result: string }> {
    const result = await this.service.processWaveWebhookFromPayload(payload, signature);
    return { result };
  }

  @Post('webhook/orange-money')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Orange Money' })
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
  @ApiResponse({ status: 200, type: PaiementLogResponseDto, isArray: true })
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
  getPaiementById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaiementResponseDto> {
    return this.service.getPaiementById(id, user);
  }
}
