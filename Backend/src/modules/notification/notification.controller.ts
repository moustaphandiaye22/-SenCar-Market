import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get('utilisateur/:utilisateurId')
  @ApiOperation({ summary: 'Notifications d\'un utilisateur' })
  getNotificationsByUtilisateur(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    return this.service.getNotificationsByUtilisateur(utilisateurId, page, size, user);
  }

  @Get('utilisateur/:utilisateurId/unread')
  @ApiOperation({ summary: 'Notifications non lues' })
  getUnreadNotifications(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    return this.service.getUnreadNotifications(utilisateurId, page, size, user);
  }

  @Get('utilisateur/:utilisateurId/type/:type')
  @ApiOperation({ summary: 'Notifications par type' })
  getNotificationsByType(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @Param('type') type: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 10,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<NotificationResponseDto>> {
    return this.service.getNotificationsByType(utilisateurId, type, page, size, user);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Marquer comme lue' })
  markAsRead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationResponseDto> {
    return this.service.markAsRead(id, user);
  }

  @Put('utilisateur/:utilisateurId/read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer toutes comme lues' })
  async markAllAsRead(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.service.markAllAsRead(utilisateurId, user);
    return { message: 'Toutes les notifications ont été marquées comme lues' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une notification' })
  async deleteNotification(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.service.deleteNotification(id, user);
    return { message: 'Notification supprimée' };
  }

  @Delete('utilisateur/:utilisateurId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer toutes les notifications' })
  async deleteAllNotifications(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.service.deleteAllNotifications(utilisateurId, user);
    return { message: 'Toutes les notifications ont été supprimées' };
  }

  @Get('utilisateur/:utilisateurId/count/unread')
  @ApiOperation({ summary: 'Compter les non lues' })
  async countUnread(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ unreadCount: number }> {
    const unreadCount = await this.service.countUnread(utilisateurId, user);
    return { unreadCount };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une notification par ID' })
  getNotificationById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationResponseDto> {
    return this.service.getNotificationById(id, user);
  }
}
