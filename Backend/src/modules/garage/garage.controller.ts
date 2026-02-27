import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFloatPipe,
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

import { AssociateServiceRequestDto } from './dto/associate-service-request.dto';
import { CreateGarageRequestDto } from './dto/create-garage-request.dto';
import { CreateServiceGarageRequestDto } from './dto/create-service-garage-request.dto';
import { GarageResponseDto } from './dto/garage-response.dto';
import { GarageServiceResponseDto } from './dto/garage-service-response.dto';
import { ServiceGarageResponseDto } from './dto/service-garage-response.dto';
import { ValidationGarageRequestDto } from './dto/validation-garage-request.dto';
import { GarageService } from './garage.service';

@ApiTags('Garages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('garages')
export class GarageController {
  constructor(private readonly service: GarageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un garage' })
  createGarage(
    @Body() request: CreateGarageRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageResponseDto> {
    return this.service.createGarage(request, user);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des garages' })
  getAllGarages(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<GarageResponseDto>> {
    return this.service.getAllGarages(page, size);
  }

  @Get('actifs')
  @ApiOperation({ summary: 'Garages actifs' })
  getActiveGarages(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<GarageResponseDto>> {
    return this.service.getActiveGarages(page, size);
  }

  @Get('en-attente')
  @ApiOperation({ summary: 'Garages en attente' })
  getGaragesEnAttente(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
  ): Promise<PaginatedResponseDto<GarageResponseDto>> {
    return this.service.getGaragesEnAttente(page, size, user);
  }

  @Get('proprietaire/:proprietaireId')
  @ApiOperation({ summary: 'Garages d\'un propriétaire' })
  getGaragesByProprietaire(
    @Param('proprietaireId', new ParseUUIDPipe()) proprietaireId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageResponseDto[]> {
    return this.service.getGaragesByProprietaire(proprietaireId, user);
  }

  @Get('search/ville')
  @ApiOperation({ summary: 'Rechercher par ville' })
  searchByVille(@Query('ville') ville: string): Promise<GarageResponseDto[]> {
    return this.service.searchByLocalisation(ville);
  }

  @Get('search/proximity')
  @ApiOperation({ summary: 'Rechercher par proximité' })
  searchByProximity(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('rayonKm', new ParseFloatPipe({ optional: true })) rayonKm = 10,
  ): Promise<GarageResponseDto[]> {
    return this.service.searchByProximity(latitude, longitude, rayonKm);
  }

  @Get('search')
  @ApiOperation({ summary: 'Rechercher des garages' })
  searchGarages(@Query('q') q: string): Promise<GarageResponseDto[]> {
    return this.service.searchGarages(q);
  }

  @Post('services')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un service garage' })
  createService(
    @Body() request: CreateServiceGarageRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ServiceGarageResponseDto> {
    return this.service.createService(request, user);
  }

  @Get('services')
  @ApiOperation({ summary: 'Liste des services' })
  getAllServices(): Promise<ServiceGarageResponseDto[]> {
    return this.service.getAllServices();
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Obtenir un service par ID' })
  getServiceById(@Param('id', new ParseUUIDPipe()) id: string): Promise<ServiceGarageResponseDto> {
    return this.service.getServiceById(id);
  }

  @Post(':garageId/services')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Associer un service à un garage' })
  associateService(
    @Param('garageId', new ParseUUIDPipe()) garageId: string,
    @Body() request: AssociateServiceRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageServiceResponseDto> {
    return this.service.associateService(garageId, request, user);
  }

  @Get(':garageId/services')
  @ApiOperation({ summary: 'Services d\'un garage' })
  getServicesByGarage(@Param('garageId', new ParseUUIDPipe()) garageId: string): Promise<GarageServiceResponseDto[]> {
    return this.service.getServicesByGarage(garageId);
  }

  @Delete(':garageId/services/:serviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer association service-garage' })
  async disassociateService(
    @Param('garageId', new ParseUUIDPipe()) garageId: string,
    @Param('serviceId', new ParseUUIDPipe()) serviceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.disassociateService(garageId, serviceId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un garage par ID' })
  getGarageById(@Param('id', new ParseUUIDPipe()) id: string): Promise<GarageResponseDto> {
    return this.service.getGarageById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un garage' })
  updateGarage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: CreateGarageRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageResponseDto> {
    return this.service.updateGarage(id, request, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un garage' })
  async deleteGarage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteGarage(id, user);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Valider un garage' })
  validerGarage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: ValidationGarageRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageResponseDto> {
    return this.service.validerGarage(id, request, user);
  }

  @Put(':id/logo')
  @ApiOperation({ summary: 'Mettre à jour le logo' })
  updateLogo(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('logoUrl') logoUrl: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<GarageResponseDto> {
    return this.service.updateLogo(id, logoUrl, user);
  }
}
