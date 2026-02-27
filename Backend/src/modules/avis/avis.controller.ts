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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

import { AvisService } from './avis.service';
import { AvisResponseDto } from './dto/avis-response.dto';
import { CreateAvisRequestDto } from './dto/create-avis-request.dto';

@ApiTags('Avis et Notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('avis')
export class AvisController {
  constructor(private readonly service: AvisService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un avis' })
  createAvis(
    @Body() request: CreateAvisRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AvisResponseDto> {
    return this.service.createAvis(request, user);
  }

  @Get(':avisId')
  @ApiOperation({ summary: 'Obtenir un avis par ID' })
  getAvisById(@Param('avisId', new ParseUUIDPipe()) avisId: string): Promise<AvisResponseDto> {
    return this.service.getAvisById(avisId);
  }

  @Get('utilisateur/:utilisateurId')
  @ApiOperation({ summary: 'Avis sur un utilisateur' })
  getAvisByUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<AvisResponseDto>> {
    return this.service.getAvisByUtilisateur(utilisateurId, page, size);
  }

  @Get('vehicule/:vehiculeId')
  @ApiOperation({ summary: 'Avis sur un véhicule' })
  getAvisByVehicule(
    @Param('vehiculeId', new ParseUUIDPipe()) vehiculeId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<AvisResponseDto>> {
    return this.service.getAvisByVehicule(vehiculeId, page, size);
  }

  @Get('garage/:garageId')
  @ApiOperation({ summary: 'Avis sur un garage' })
  getAvisByGarage(
    @Param('garageId', new ParseUUIDPipe()) garageId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<AvisResponseDto>> {
    return this.service.getAvisByGarage(garageId, page, size);
  }

  @Get('utilisateur/:utilisateurId/moyenne')
  @ApiOperation({ summary: 'Note moyenne utilisateur' })
  getNoteMoyenneUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
  ): Promise<number> {
    return this.service.getNoteMoyenneUtilisateur(utilisateurId);
  }

  @Get('vehicule/:vehiculeId/moyenne')
  @ApiOperation({ summary: 'Note moyenne véhicule' })
  getNoteMoyenneVehicule(@Param('vehiculeId', new ParseUUIDPipe()) vehiculeId: string): Promise<number> {
    return this.service.getNoteMoyenneVehicule(vehiculeId);
  }

  @Get('garage/:garageId/moyenne')
  @ApiOperation({ summary: 'Note moyenne garage' })
  getNoteMoyenneGarage(@Param('garageId', new ParseUUIDPipe()) garageId: string): Promise<number> {
    return this.service.getNoteMoyenneGarage(garageId);
  }

  @Post(':avisId/signaler')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Signaler un avis' })
  async signalerAvis(
    @Param('avisId', new ParseUUIDPipe()) avisId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.signalerAvis(avisId, user);
  }

  @Delete(':avisId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un avis' })
  async deleteAvis(
    @Param('avisId', new ParseUUIDPipe()) avisId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteAvis(avisId, user);
  }

  @Get('transaction/:transactionId/validation')
  @ApiOperation({ summary: 'Valider transaction pour avis' })
  isTransactionValide(
    @Param('transactionId', new ParseUUIDPipe()) transactionId: string,
    @Query('typeAvis') typeAvis: string,
  ): Promise<boolean> {
    return this.service.isTransactionValide(transactionId, typeAvis);
  }
}
