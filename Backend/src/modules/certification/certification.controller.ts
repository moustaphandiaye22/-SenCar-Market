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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { ApiErrorResponseDto } from '../auth/dto/api-error-response.dto';

import { CertificationService } from './certification.service';
import { CreateDemandeCertificationRequestDto } from './dto/create-demande-certification-request.dto';
import { CreateInspectionRequestDto } from './dto/create-inspection-request.dto';
import { CreateRapportInspectionRequestDto } from './dto/create-rapport-inspection-request.dto';
import { DemandeCertificationResponseDto } from './dto/demande-certification-response.dto';
import { InspectionResponseDto } from './dto/inspection-response.dto';
import { RapportInspectionResponseDto } from './dto/rapport-inspection-response.dto';

type UploadedFileLike = { originalname?: string; buffer: Buffer };

@ApiTags('Certifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('certifications')
export class CertificationController {
  constructor(private readonly service: CertificationService) {}

  @Post('demandes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une demande de certification' })
  @ApiResponse({ status: 201, type: DemandeCertificationResponseDto, description: 'Demande créée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createDemandeCertification(
    @Body() request: CreateDemandeCertificationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.createDemandeCertification(request, user);
  }

  @Get('demandes')
  @ApiOperation({ summary: 'Liste des demandes de certification' })
  @ApiResponse({ status: 200, description: 'Demandes récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAllDemandes(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<DemandeCertificationResponseDto>> {
    return this.service.getAllDemandes(page, size, user);
  }

  @Get('demandes/utilisateur/:utilisateurId')
  @ApiOperation({ summary: 'Demandes de certification d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Demandes récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getDemandesByUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto[]> {
    return this.service.getDemandesByUtilisateur(utilisateurId, user);
  }

  @Get('demandes/:id')
  @ApiOperation({ summary: 'Obtenir une demande de certification par ID' })
  @ApiResponse({ status: 200, type: DemandeCertificationResponseDto, description: 'Demande récupérée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Demande non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getDemandeById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.getDemandeById(id, user);
  }

  @Put('demandes/:id')
  @ApiOperation({ summary: 'Mettre à jour une demande de certification' })
  @ApiResponse({ status: 200, type: DemandeCertificationResponseDto, description: 'Demande mise à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Demande non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  updateDemandeCertification(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: CreateDemandeCertificationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.updateDemandeCertification(id, request, user);
  }

  @Delete('demandes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une demande de certification' })
  @ApiResponse({ status: 204, description: 'Demande supprimée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Demande non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async deleteDemandeCertification(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteDemandeCertification(id, user);
  }

  @Post('demandes/:demandeId/payment')
  @ApiOperation({ summary: 'Traiter le paiement d\'une demande de certification' })
  @ApiResponse({ status: 200, type: DemandeCertificationResponseDto, description: 'Paiement traité avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paiement invalide ou échoué' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Demande non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  processPayment(
    @Param('demandeId', new ParseUUIDPipe()) demandeId: string,
    @Query('paiementId', new ParseUUIDPipe()) paiementId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.processPayment(demandeId, paiementId, user);
  }

  @Post('demandes/:demandeId/assign-inspector')
  @ApiOperation({ summary: 'Attribuer un inspecteur' })
  @ApiResponse({ status: 200, type: DemandeCertificationResponseDto, description: 'Inspecteur attribué avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Demande non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  assignInspector(
    @Param('demandeId', new ParseUUIDPipe()) demandeId: string,
    @Query('inspecteurId', new ParseUUIDPipe()) inspecteurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.assignInspector(demandeId, inspecteurId, user);
  }

  @Patch('demandes/:demandeId/statut')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une demande de certification' })
  @ApiResponse({ status: 200, type: DemandeCertificationResponseDto, description: 'Statut mis à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Statut invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Demande non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  updateStatut(
    @Param('demandeId', new ParseUUIDPipe()) demandeId: string,
    @Query('statut') statut: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.updateStatutFromRaw(demandeId, statut, user);
  }

  @Post('demandes/:demandeId/inspections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une inspection' })
  @ApiResponse({ status: 201, type: InspectionResponseDto, description: 'Inspection créée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Demande non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createInspection(
    @Body() request: CreateInspectionRequestDto,
    @Param('demandeId', new ParseUUIDPipe()) demandeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InspectionResponseDto> {
    return this.service.createInspection(request, demandeId, user);
  }

  @Get('inspections/:id')
  @ApiOperation({ summary: 'Obtenir une inspection par ID' })
  @ApiResponse({ status: 200, type: InspectionResponseDto, description: 'Inspection récupérée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Inspection non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getInspectionById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InspectionResponseDto> {
    return this.service.getInspectionById(id, user);
  }

  @Get('inspections/inspecteur/:inspecteurId')
  @ApiOperation({ summary: 'Inspections d\'un inspecteur' })
  @ApiResponse({ status: 200, description: 'Inspections récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Inspecteur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getInspectionsByInspecteur(
    @Param('inspecteurId', new ParseUUIDPipe()) inspecteurId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<InspectionResponseDto>> {
    return this.service.getInspectionsByInspecteur(inspecteurId, page, size, user);
  }

  @Put('inspections/:id')
  @ApiOperation({ summary: 'Mettre à jour une inspection' })
  @ApiResponse({ status: 200, type: InspectionResponseDto, description: 'Inspection mise à jour avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Inspection non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  updateInspection(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: CreateInspectionRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InspectionResponseDto> {
    return this.service.updateInspection(id, request, user);
  }

  @Delete('inspections/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une inspection' })
  @ApiResponse({ status: 204, description: 'Inspection supprimée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Inspection non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async deleteInspection(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteInspection(id, user);
  }

  @Post('inspections/:inspectionId/upload-rapport')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Uploader le PDF du rapport d\'inspection' })
  @ApiResponse({ status: 200, type: RapportInspectionResponseDto, description: 'Rapport uploadé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Fichier invalide' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Inspection non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  uploadRapportPdf(
    @Param('inspectionId', new ParseUUIDPipe()) inspectionId: string,
    @UploadedFile() file: UploadedFileLike | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RapportInspectionResponseDto> {
    return this.service.uploadRapportPdf(inspectionId, file as UploadedFileLike, user);
  }

  @Post('inspections/:inspectionId/resultat')
  @ApiOperation({ summary: 'Enregistrer le résultat du rapport d\'inspection' })
  @ApiResponse({ status: 200, type: InspectionResponseDto, description: 'Résultat enregistré avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Inspection non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  saveRapportResult(
    @Param('inspectionId', new ParseUUIDPipe()) inspectionId: string,
    @Body() request: CreateRapportInspectionRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InspectionResponseDto> {
    return this.service.saveRapportResult(inspectionId, request, user);
  }

  @Post('demandes/:demandeId/generate-badge')
  @ApiOperation({ summary: 'Générer le badge certifié' })
  @ApiResponse({ status: 200, type: DemandeCertificationResponseDto, description: 'Badge généré avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Demande non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  generateBadge(
    @Param('demandeId', new ParseUUIDPipe()) demandeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.generateBadge(demandeId, user);
  }
}
