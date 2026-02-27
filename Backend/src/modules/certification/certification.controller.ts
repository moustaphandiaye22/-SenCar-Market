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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

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
  createDemandeCertification(
    @Body() request: CreateDemandeCertificationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.createDemandeCertification(request, user);
  }

  @Get('demandes')
  @ApiOperation({ summary: 'Liste des demandes de certification' })
  getAllDemandes(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<DemandeCertificationResponseDto>> {
    return this.service.getAllDemandes(page, size, user);
  }

  @Get('demandes/utilisateur/:utilisateurId')
  @ApiOperation({ summary: 'Demandes de certification d\'un utilisateur' })
  getDemandesByUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto[]> {
    return this.service.getDemandesByUtilisateur(utilisateurId, user);
  }

  @Get('demandes/:id')
  @ApiOperation({ summary: 'Obtenir une demande de certification par ID' })
  getDemandeById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.getDemandeById(id, user);
  }

  @Put('demandes/:id')
  @ApiOperation({ summary: 'Mettre à jour une demande de certification' })
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
  async deleteDemandeCertification(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteDemandeCertification(id, user);
  }

  @Post('demandes/:demandeId/payment')
  @ApiOperation({ summary: 'Traiter le paiement d\'une demande de certification' })
  processPayment(
    @Param('demandeId', new ParseUUIDPipe()) demandeId: string,
    @Query('paiementId', new ParseUUIDPipe()) paiementId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.processPayment(demandeId, paiementId, user);
  }

  @Post('demandes/:demandeId/assign-inspector')
  @ApiOperation({ summary: 'Attribuer un inspecteur' })
  assignInspector(
    @Param('demandeId', new ParseUUIDPipe()) demandeId: string,
    @Query('inspecteurId', new ParseUUIDPipe()) inspecteurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.assignInspector(demandeId, inspecteurId, user);
  }

  @Patch('demandes/:demandeId/statut')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une demande de certification' })
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
  createInspection(
    @Body() request: CreateInspectionRequestDto,
    @Param('demandeId', new ParseUUIDPipe()) demandeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InspectionResponseDto> {
    return this.service.createInspection(request, demandeId, user);
  }

  @Get('inspections/:id')
  @ApiOperation({ summary: 'Obtenir une inspection par ID' })
  getInspectionById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InspectionResponseDto> {
    return this.service.getInspectionById(id, user);
  }

  @Get('inspections/inspecteur/:inspecteurId')
  @ApiOperation({ summary: 'Inspections d\'un inspecteur' })
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
  async deleteInspection(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteInspection(id, user);
  }

  @Post('inspections/:inspectionId/upload-rapport')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Uploader le PDF du rapport d\'inspection' })
  uploadRapportPdf(
    @Param('inspectionId', new ParseUUIDPipe()) inspectionId: string,
    @UploadedFile() file: UploadedFileLike | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RapportInspectionResponseDto> {
    return this.service.uploadRapportPdf(inspectionId, file as UploadedFileLike, user);
  }

  @Post('inspections/:inspectionId/resultat')
  @ApiOperation({ summary: 'Enregistrer le résultat du rapport d\'inspection' })
  saveRapportResult(
    @Param('inspectionId', new ParseUUIDPipe()) inspectionId: string,
    @Body() request: CreateRapportInspectionRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InspectionResponseDto> {
    return this.service.saveRapportResult(inspectionId, request, user);
  }

  @Post('demandes/:demandeId/generate-badge')
  @ApiOperation({ summary: 'Générer le badge certifié' })
  generateBadge(
    @Param('demandeId', new ParseUUIDPipe()) demandeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    return this.service.generateBadge(demandeId, user);
  }
}
