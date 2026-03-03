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

import { AvisService } from './avis.service';
import { AvisResponseDto } from './dto/avis-response.dto';
import { CreateAvisRequestDto } from './dto/create-avis-request.dto';

@ApiTags('Avis et Notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiExtraModels(PaginatedResponseDto, AvisResponseDto)
@Controller('avis')
export class AvisController {
  constructor(private readonly service: AvisService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un avis' })
  @ApiResponse({ status: 201, type: AvisResponseDto, description: 'Avis créé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Entité non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  createAvis(
    @Body() request: CreateAvisRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AvisResponseDto> {
    return this.service.createAvis(request, user);
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les avis' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Avis récupérés avec succès',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        { properties: { content: { type: 'array', items: { $ref: getSchemaPath(AvisResponseDto) } } } },
      ],
    },
  })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAllAvis(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<AvisResponseDto>> {
    return this.service.getAllAvis(page, size);
  }

  @Get(':avisId')
  @ApiOperation({ summary: 'Obtenir un avis par ID' })
  @ApiParam({ name: 'avisId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, type: AvisResponseDto, description: 'Avis récupéré avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Avis non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAvisById(@Param('avisId', new ParseUUIDPipe()) avisId: string): Promise<AvisResponseDto> {
    return this.service.getAvisById(avisId);
  }

  @Get('utilisateur/:utilisateurId')
  @ApiOperation({ summary: 'Avis sur un utilisateur' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Avis récupérés avec succès',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        { properties: { content: { type: 'array', items: { $ref: getSchemaPath(AvisResponseDto) } } } },
      ],
    },
  })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAvisByUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<AvisResponseDto>> {
    return this.service.getAvisByUtilisateur(utilisateurId, page, size);
  }

  @Get('vehicule/:vehiculeId')
  @ApiOperation({ summary: 'Avis sur un véhicule' })
  @ApiParam({ name: 'vehiculeId', type: String, format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Avis récupérés avec succès',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        { properties: { content: { type: 'array', items: { $ref: getSchemaPath(AvisResponseDto) } } } },
      ],
    },
  })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Véhicule non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAvisByVehicule(
    @Param('vehiculeId', new ParseUUIDPipe()) vehiculeId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<AvisResponseDto>> {
    return this.service.getAvisByVehicule(vehiculeId, page, size);
  }

  @Get('garage/:garageId')
  @ApiOperation({ summary: 'Avis sur un garage' })
  @ApiParam({ name: 'garageId', type: String, format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Avis récupérés avec succès',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        { properties: { content: { type: 'array', items: { $ref: getSchemaPath(AvisResponseDto) } } } },
      ],
    },
  })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Garage non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getAvisByGarage(
    @Param('garageId', new ParseUUIDPipe()) garageId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<AvisResponseDto>> {
    return this.service.getAvisByGarage(garageId, page, size);
  }

  @Get('utilisateur/:utilisateurId/moyenne')
  @ApiOperation({ summary: 'Note moyenne utilisateur' })
  @ApiParam({ name: 'utilisateurId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Note moyenne récupérée avec succès', schema: { type: 'number', example: 4.6 } })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getNoteMoyenneUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
  ): Promise<number> {
    return this.service.getNoteMoyenneUtilisateur(utilisateurId);
  }

  @Get('vehicule/:vehiculeId/moyenne')
  @ApiOperation({ summary: 'Note moyenne véhicule' })
  @ApiParam({ name: 'vehiculeId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Note moyenne récupérée avec succès', schema: { type: 'number', example: 4.3 } })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Véhicule non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getNoteMoyenneVehicule(@Param('vehiculeId', new ParseUUIDPipe()) vehiculeId: string): Promise<number> {
    return this.service.getNoteMoyenneVehicule(vehiculeId);
  }

  @Get('garage/:garageId/moyenne')
  @ApiOperation({ summary: 'Note moyenne garage' })
  @ApiParam({ name: 'garageId', type: String, format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Note moyenne récupérée avec succès', schema: { type: 'number', example: 4.1 } })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Garage non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getNoteMoyenneGarage(@Param('garageId', new ParseUUIDPipe()) garageId: string): Promise<number> {
    return this.service.getNoteMoyenneGarage(garageId);
  }

  @Post(':avisId/signaler')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Signaler un avis' })
  @ApiParam({ name: 'avisId', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Avis signalé avec succès',
    schema: { type: 'object', properties: { message: { type: 'string', example: 'Avis signalé avec succès' } } },
  })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Avis non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async signalerAvis(
    @Param('avisId', new ParseUUIDPipe()) avisId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.service.signalerAvis(avisId, user);
    return { message: 'Avis signalé avec succès' };
  }

  @Delete(':avisId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un avis' })
  @ApiParam({ name: 'avisId', type: String, format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Avis supprimé avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Avis non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async deleteAvis(
    @Param('avisId', new ParseUUIDPipe()) avisId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteAvis(avisId, user);
  }

  @Get('transaction/:transactionId/validation')
  @ApiOperation({ summary: 'Valider transaction pour avis' })
  @ApiParam({ name: 'transactionId', type: String, format: 'uuid' })
  @ApiQuery({ name: 'typeAvis', type: String, required: true, example: 'ACHETEUR' })
  @ApiResponse({ status: 200, description: 'Validation récupérée avec succès', schema: { type: 'boolean', example: true } })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Paramètres invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Transaction non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  isTransactionValide(
    @Param('transactionId', new ParseUUIDPipe()) transactionId: string,
    @Query('typeAvis') typeAvis: string,
  ): Promise<boolean> {
    return this.service.isTransactionValide(transactionId, typeAvis);
  }
}
