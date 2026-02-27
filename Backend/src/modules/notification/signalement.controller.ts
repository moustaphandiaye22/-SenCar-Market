import {
  Body,
  Controller,
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

import { ActionAdminRequestDto } from './dto/action-admin-request.dto';
import { CreateSignalementRequestDto } from './dto/create-signalement-request.dto';
import { SignalementResponseDto } from './dto/signalement-response.dto';
import { NotificationService } from './notification.service';

@ApiTags('Signalements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('signalements')
export class SignalementController {
  constructor(private readonly service: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un signalement' })
  createSignalement(
    @Body() request: CreateSignalementRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SignalementResponseDto> {
    return this.service.createSignalement(request, user);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Signalements en attente' })
  getPendingSignalements(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    return this.service.getPendingSignalements(page, size, user);
  }

  @Get('statut/:statut')
  @ApiOperation({ summary: 'Signalements par statut' })
  getSignalementsByStatut(
    @Param('statut') statut: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    return this.service.getSignalementsByStatut(statut, page, size, user);
  }

  @Get('type/:typeEntite')
  @ApiOperation({ summary: 'Signalements par type' })
  getSignalementsByType(
    @Param('typeEntite') typeEntite: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    return this.service.getSignalementsByType(typeEntite, page, size, user);
  }

  @Get('count/pending')
  @ApiOperation({ summary: 'Compter les signalements en attente' })
  async countPending(@CurrentUser() user: AuthenticatedUser): Promise<{ pendingCount: number }> {
    const pendingCount = await this.service.countPending(user);
    return { pendingCount };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un signalement' })
  getSignalement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SignalementResponseDto> {
    return this.service.getSignalementById(id, user);
  }

  @Get()
  @ApiOperation({ summary: 'Liste des signalements' })
  getAllSignalements(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @Query('sortBy') sortBy = 'dateSignalement',
    @Query('sortDir') sortDir = 'desc',
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<SignalementResponseDto>> {
    return this.service.getAllSignalements(page, size, sortBy, sortDir, user);
  }

  @Post(':id/traiter')
  @ApiOperation({ summary: 'Traiter un signalement' })
  traiterSignalement(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() request: ActionAdminRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SignalementResponseDto> {
    return this.service.traiterSignalement(id, request, user);
  }
}
