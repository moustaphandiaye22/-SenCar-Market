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
  @ApiResponse({ status: 201, type: ProduitAssuranceResponseDto, description: 'Produit assurance créé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createProduitAssurance(
    @Body() request: CreateProduitAssuranceRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ProduitAssuranceResponseDto> {
    return this.service.createProduitAssurance(request, user);
  }

  @Get('produits')
  @ApiOperation({ summary: 'Liste des produits assurance' })
  @ApiResponse({ status: 200, description: 'Produits assurance récupérés avec succès' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAllProduitAssurances(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<ProduitAssuranceResponseDto>> {
    return this.service.getAllProduitAssurances(page, size);
  }

  @Get('produits/actifs')
  @ApiOperation({ summary: 'Produits assurance actifs' })
  @ApiResponse({ status: 200, description: 'Produits actifs récupérés avec succès' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getActiveProduitAssurances(): Promise<ProduitAssuranceResponseDto[]> {
    return this.service.getActiveProduitAssurances();
  }

  @Get('produits/:id')
  @ApiOperation({ summary: 'Obtenir un produit assurance par ID' })
  @ApiResponse({ status: 200, type: ProduitAssuranceResponseDto, description: 'Produit assurance trouvé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Produit assurance non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getProduitAssuranceById(@Param('id', new ParseUUIDPipe()) id: string): Promise<ProduitAssuranceResponseDto> {
    return this.service.getProduitAssuranceById(id);
  }

  @Put('produits/:id')
  @ApiOperation({ summary: 'Mettre à jour un produit assurance' })
  @ApiResponse({ status: 200, type: ProduitAssuranceResponseDto, description: 'Produit assurance mis à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Produit assurance non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
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
  @ApiResponse({ status: 204, description: 'Produit assurance supprimé avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Produit assurance non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async deleteProduitAssurance(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteProduitAssurance(id, user);
  }

  @Post('options')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une option assurance' })
  @ApiResponse({ status: 201, type: OptionAssuranceResponseDto, description: 'Option assurance créée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createOptionAssurance(
    @Body() request: CreateOptionAssuranceRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OptionAssuranceResponseDto> {
    return this.service.createOptionAssurance(request, user);
  }

  @Get('options/:id')
  @ApiOperation({ summary: 'Obtenir une option assurance par ID' })
  @ApiResponse({ status: 200, type: OptionAssuranceResponseDto, description: 'Option assurance trouvée' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Option assurance non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getOptionAssuranceById(@Param('id', new ParseUUIDPipe()) id: string): Promise<OptionAssuranceResponseDto> {
    return this.service.getOptionAssuranceById(id);
  }

  @Get('produits/:produitId/options')
  @ApiOperation({ summary: 'Options d\'un produit assurance' })
  @ApiResponse({ status: 200, description: 'Options du produit récupérées avec succès' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Produit assurance non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getOptionsByProduitAssurance(
    @Param('produitId', new ParseUUIDPipe()) produitId: string,
  ): Promise<OptionAssuranceResponseDto[]> {
    return this.service.getOptionsByProduitAssurance(produitId);
  }

  @Put('options/:id')
  @ApiOperation({ summary: 'Mettre à jour une option assurance' })
  @ApiResponse({ status: 200, type: OptionAssuranceResponseDto, description: 'Option assurance mise à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Option assurance non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
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
  @ApiResponse({ status: 204, description: 'Option assurance supprimée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Option assurance non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async deleteOptionAssurance(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteOptionAssurance(id, user);
  }

  @Post('souscriptions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une souscription assurance' })
  @ApiResponse({ status: 201, type: SouscriptionAssuranceResponseDto, description: 'Souscription créée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createSouscription(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreateSouscriptionAssuranceRequestDto,
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.createSouscription(user.userId, request);
  }

  @Get('souscriptions/:id')
  @ApiOperation({ summary: 'Obtenir une souscription assurance par ID' })
  @ApiResponse({ status: 200, type: SouscriptionAssuranceResponseDto, description: 'Souscription trouvée' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Souscription non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async getSouscriptionById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.getSouscriptionByIdAuthorized(id, user);
  }

  @Get('souscriptions/utilisateur/:utilisateurId')
  @ApiOperation({ summary: 'Souscriptions assurance d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Souscriptions de l\'utilisateur récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async getSouscriptionsByUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto[]> {
    return this.service.getSouscriptionsByUtilisateurAuthorized(utilisateurId, user);
  }

  @Get('calcul-prix')
  @ApiOperation({ summary: 'Calculer le prix assurance' })
  @ApiResponse({ status: 200, description: 'Prix calculé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paramètres invalides' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  calculatePrix(
    @Query('produitAssuranceId', new ParseUUIDPipe()) produitAssuranceId: string,
    @Query('optionIds') optionIds?: string | string[],
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.calculatePrixFromQuery(produitAssuranceId, optionIds);
  }

  @Post('souscriptions/:id/payment')
  @ApiOperation({ summary: 'Traiter le paiement d\'une souscription assurance' })
  @ApiResponse({ status: 200, type: SouscriptionAssuranceResponseDto, description: 'Paiement traité avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données de paiement invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Souscription non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async processPayment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('paiementId', new ParseUUIDPipe()) paiementId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.processPaymentAuthorized(id, paiementId, user);
  }

  @Post('souscriptions/:id/contrat')
  @ApiOperation({ summary: 'Générer le contrat assurance' })
  @ApiResponse({ status: 200, type: SouscriptionAssuranceResponseDto, description: 'Contrat généré avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Souscription non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async generateContract(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.generateContractAuthorized(id, user);
  }

  @Post('souscriptions/:id/documents')
  @ApiOperation({ summary: 'Ajouter un document à une souscription assurance' })
  @ApiResponse({ status: 200, type: SouscriptionAssuranceResponseDto, description: 'Document ajouté avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Type de document ou URL invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Souscription non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async uploadDocument(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('documentType') documentType: string,
    @Query('documentUrl') documentUrl: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    return this.service.uploadDocumentAuthorized(id, documentType, documentUrl, user);
  }
}
