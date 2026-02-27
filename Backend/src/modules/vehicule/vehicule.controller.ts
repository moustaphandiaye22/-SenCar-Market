import {
  Body,
  Controller,
  Delete,
  Get,
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
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

import { CreateVehiculeRequestDto } from './dto/create-vehicule-request.dto';
import { VehiculeFilterDto } from './dto/vehicule-filter.dto';
import { VehiculeResponseDto } from './dto/vehicule-response.dto';
import { VehiculeService } from './vehicule.service';

@ApiTags('Véhicules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vehicules')
export class VehiculeController {
  constructor(private readonly vehiculeService: VehiculeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Créer une annonce de véhicule' })
  createVehicule(
    @Body() request: CreateVehiculeRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    return this.vehiculeService.createVehicule(request, user);
  }

  @Get()
  @ApiOperation({ summary: 'Rechercher des véhicules' })
  searchVehicules(
    @Query() filter: VehiculeFilterDto,
  ): Promise<PaginatedResponseDto<VehiculeResponseDto>> {
    return this.vehiculeService.searchVehicules(filter);
  }

  @Get('moi')
  @ApiOperation({ summary: 'Obtenir mes véhicules' })
  getMesVehicules(@CurrentUser() user: AuthenticatedUser): Promise<VehiculeResponseDto[]> {
    return this.vehiculeService.getMesVehicules(user);
  }

  @Get('favoris/moi')
  @ApiOperation({ summary: 'Obtenir mes favoris' })
  getMesFavoris(@CurrentUser() user: AuthenticatedUser): Promise<VehiculeResponseDto[]> {
    return this.vehiculeService.getMesFavoris(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un véhicule par ID' })
  getVehiculeById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    return this.vehiculeService.getVehiculeById(id, user);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publier un véhicule' })
  publishVehicule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    return this.vehiculeService.publishVehicule(id, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  async deleteVehicule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.vehiculeService.deleteVehicule(id, user);
  }

  @Post(':id/favoris')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ajouter aux favoris' })
  async addToFavoris(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.vehiculeService.addToFavoris(id, user);
  }

  @Delete(':id/favoris')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retirer des favoris' })
  async removeFromFavoris(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.vehiculeService.removeFromFavoris(id, user);
  }

  @Post(':id/boost')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Booster un véhicule' })
  @ApiResponse({ status: 200, type: VehiculeResponseDto })
  boostVehicule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('debut') debut: string,
    @Query('fin') fin: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VehiculeResponseDto> {
    return this.vehiculeService.boostVehicule(id, debut, fin, user);
  }
}
