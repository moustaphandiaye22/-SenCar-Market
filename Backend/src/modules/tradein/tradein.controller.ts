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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

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
  createDemande(
    @Body() request: CreateDemandeTradeInRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.createDemande(request, user);
  }

  @Get('demandes')
  @ApiOperation({ summary: 'Liste des demandes trade-in' })
  getAllDemandes(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<DemandeTradeInResponseDto>> {
    return this.service.getAllDemandes(page, size, user);
  }

  @Get('demandes/non-notifiees')
  @ApiOperation({ summary: 'Demandes non notifiées' })
  getDemandesNonNotifiees(@CurrentUser() user: AuthenticatedUser): Promise<DemandeTradeInResponseDto[]> {
    return this.service.getDemandesNonNotifiees(user);
  }

  @Get('demandes/utilisateur/:utilisateurId')
  @ApiOperation({ summary: 'Demandes d\'un utilisateur' })
  getDemandesByUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto[]> {
    return this.service.getDemandesByUtilisateur(utilisateurId, user);
  }

  @Get('demandes/:id')
  @ApiOperation({ summary: 'Obtenir une demande par ID' })
  getDemandeById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.getDemandeById(id, user);
  }

  @Put('demandes/:id')
  @ApiOperation({ summary: 'Mettre à jour une demande' })
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
  @ApiOperation({ summary: 'Estimer un véhicule' })
  estimerVehicule(@Body() request: EstimationRequestDto): Promise<EstimationResponseDto> {
    return this.service.estimerVehicule(request);
  }

  @Post('demandes/:id/calculer-estimation')
  @ApiOperation({ summary: 'Calculer estimation auto' })
  calculerEstimationAuto(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.calculerEstimationAuto(id, user);
  }

  @Post('demandes/:id/validation')
  @ApiOperation({ summary: 'Valider une demande' })
  validerDemande(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: ValidationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.validerDemande(id, request, user);
  }

  @Patch('demandes/:id/statut')
  @ApiOperation({ summary: 'Mettre à jour le statut' })
  updateStatut(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('statut') statut: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.updateStatutFromRaw(id, statut, user);
  }

  @Post('demandes/:id/notifier')
  @ApiOperation({ summary: 'Notifier utilisateur' })
  notifierUtilisateur(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeTradeInResponseDto> {
    return this.service.notifierUtilisateur(id, user);
  }
}
