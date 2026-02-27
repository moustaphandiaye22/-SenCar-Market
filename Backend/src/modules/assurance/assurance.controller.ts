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

import { AssuranceService } from './assurance.service';
import { CreateOptionAssuranceRequestDto } from './dto/create-option-assurance-request.dto';
import { CreateProduitAssuranceRequestDto } from './dto/create-produit-assurance-request.dto';
import { CreateSouscriptionAssuranceRequestDto } from './dto/create-souscription-assurance-request.dto';
import { OptionAssuranceResponseDto } from './dto/option-assurance-response.dto';
import { ProduitAssuranceResponseDto } from './dto/produit-assurance-response.dto';
import { SouscriptionAssuranceResponseDto } from './dto/souscription-assurance-response.dto';

@ApiTags('Assurances')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller(['assurance', 'assurances'])
export class AssuranceController {
  constructor(private readonly service: AssuranceService) {}

  @Post('produits')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un produit assurance' })
  createProduitAssurance(
    @Body() request: CreateProduitAssuranceRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProduitAssuranceResponseDto> {
    return this.service.createProduitAssurance(request, user);
  }

  @Get('produits')
  @ApiOperation({ summary: 'Liste des produits assurance' })
  getAllProduitAssurances(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<ProduitAssuranceResponseDto>> {
    return this.service.getAllProduitAssurances(page, size);
  }

  @Get('produits/actifs')
  @ApiOperation({ summary: 'Produits assurance actifs' })
  getActiveProduitAssurances(): Promise<ProduitAssuranceResponseDto[]> {
    return this.service.getActiveProduitAssurances();
  }

  @Get('produits/:id')
  @ApiOperation({ summary: 'Obtenir un produit assurance par ID' })
  getProduitAssuranceById(@Param('id', new ParseUUIDPipe()) id: string): Promise<ProduitAssuranceResponseDto> {
    return this.service.getProduitAssuranceById(id);
  }

  @Put('produits/:id')
  @ApiOperation({ summary: 'Mettre à jour un produit assurance' })
  updateProduitAssurance(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: CreateProduitAssuranceRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProduitAssuranceResponseDto> {
    return this.service.updateProduitAssurance(id, request, user);
  }

  @Delete('produits/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un produit assurance' })
  async deleteProduitAssurance(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteProduitAssurance(id, user);
  }

  @Post('options')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une option assurance' })
  createOptionAssurance(
    @Body() request: CreateOptionAssuranceRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OptionAssuranceResponseDto> {
    return this.service.createOptionAssurance(request, user);
  }

  @Get('options/:id')
  @ApiOperation({ summary: 'Obtenir une option assurance par ID' })
  getOptionAssuranceById(@Param('id', new ParseUUIDPipe()) id: string): Promise<OptionAssuranceResponseDto> {
    return this.service.getOptionAssuranceById(id);
  }

  @Get('produits/:produitId/options')
  @ApiOperation({ summary: 'Options d\'un produit assurance' })
  getOptionsByProduitAssurance(
    @Param('produitId', new ParseUUIDPipe()) produitId: string,
  ): Promise<OptionAssuranceResponseDto[]> {
    return this.service.getOptionsByProduitAssurance(produitId);
  }

  @Put('options/:id')
  @ApiOperation({ summary: 'Mettre à jour une option assurance' })
  updateOptionAssurance(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: CreateOptionAssuranceRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OptionAssuranceResponseDto> {
    return this.service.updateOptionAssurance(id, request, user);
  }

  @Delete('options/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une option assurance' })
  async deleteOptionAssurance(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteOptionAssurance(id, user);
  }

  @Post('souscriptions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une souscription assurance' })
  createSouscription(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreateSouscriptionAssuranceRequestDto,
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.createSouscription(user.userId, request);
  }

  @Get('souscriptions/:id')
  @ApiOperation({ summary: 'Obtenir une souscription assurance par ID' })
  async getSouscriptionById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.getSouscriptionByIdAuthorized(id, user);
  }

  @Get('souscriptions/utilisateur/:utilisateurId')
  @ApiOperation({ summary: 'Souscriptions assurance d\'un utilisateur' })
  async getSouscriptionsByUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto[]> {
    return this.service.getSouscriptionsByUtilisateurAuthorized(utilisateurId, user);
  }

  @Get('calcul-prix')
  @ApiOperation({ summary: 'Calculer le prix assurance' })
  calculatePrix(
    @Query('produitAssuranceId', new ParseUUIDPipe()) produitAssuranceId: string,
    @Query('optionIds') optionIds?: string | string[],
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.calculatePrixFromQuery(produitAssuranceId, optionIds);
  }

  @Post('souscriptions/:id/payment')
  @ApiOperation({ summary: 'Traiter le paiement d\'une souscription assurance' })
  async processPayment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('paiementId', new ParseUUIDPipe()) paiementId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.processPaymentAuthorized(id, paiementId, user);
  }

  @Post('souscriptions/:id/contrat')
  @ApiOperation({ summary: 'Générer le contrat assurance' })
  async generateContract(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.generateContractAuthorized(id, user);
  }

  @Post('souscriptions/:id/documents')
  @ApiOperation({ summary: 'Ajouter un document à une souscription assurance' })
  async uploadDocument(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('documentType') documentType: string,
    @Query('documentUrl') documentUrl: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.uploadDocumentAuthorized(id, documentType, documentUrl, user);
  }
}
