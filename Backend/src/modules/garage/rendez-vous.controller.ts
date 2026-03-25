import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../common/types/authenticated-user.type';

import { CreateRendezVousRequestDto } from './dto/create-rendez-vous-request.dto';
import { RendezVousResponseDto } from './dto/rendez-vous-response.dto';
import { RendezVousService } from './services/rendez-vous.service';

@ApiTags('Rendez-vous Garages')
@ApiBearerAuth()
@Controller('garages/rendez-vous')
export class RendezVousController {
  constructor(private readonly service: RendezVousService) {}


  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer une demande de rendez-vous' })
  create(@Body() request: CreateRendezVousRequestDto, @CurrentUser() user: AuthenticatedUser): Promise<RendezVousResponseDto> {
    return this.service.createRendezVous(request, user);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtenir mes rendez-vous (client)' })
  getMyRendezVous(@CurrentUser() user: AuthenticatedUser): Promise<RendezVousResponseDto[]> {
    return this.service.getRendezVousByClient(user);
  }

  @Get('garage/:garageId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtenir les rendez-vous d\'un garage' })
  getGarageRendezVous(@Param('garageId') garageId: string): Promise<RendezVousResponseDto[]> {
    return this.service.getRendezVousByGarage(garageId);
  }

  @Put(':id/statut')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un rendez-vous' })
  updateStatut(@Param('id') id: string, @Body('statut') statut: string): Promise<RendezVousResponseDto> {
    return this.service.updateStatut(id, statut);
  }
}
