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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { ApiErrorResponseDto } from '../auth/dto/api-error-response.dto';

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
  @ApiResponse({ status: 200, description: 'Notifications récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
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
  @ApiResponse({ status: 200, description: 'Notifications récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
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
  @ApiResponse({ status: 200, description: 'Notifications récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
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
  @ApiResponse({ status: 200, type: NotificationResponseDto, description: 'Notification marquée comme lue' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Notification non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  markAsRead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationResponseDto> {
    return this.service.markAsRead(id, user);
  }

  @Put('utilisateur/:utilisateurId/read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer toutes comme lues' })
  @ApiResponse({ status: 200, description: 'Toutes les notifications marquées comme lues' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
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
  @ApiResponse({ status: 200, description: 'Notification supprimée' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Notification non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
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
  @ApiResponse({ status: 200, description: 'Toutes les notifications supprimées' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async deleteAllNotifications(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.service.deleteAllNotifications(utilisateurId, user);
    return { message: 'Toutes les notifications ont été supprimées' };
  }

  @Get('utilisateur/:utilisateurId/count/unread')
  @ApiOperation({ summary: 'Compter les non lues' })
  @ApiResponse({ status: 200, description: 'Nombre de notifications non lues' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  async countUnread(
    @Param('utilisateurId', new ParseUUIDPipe()) utilisateurId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ unreadCount: number }> {
    const unreadCount = await this.service.countUnread(utilisateurId, user);
    return { unreadCount };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une notification par ID' })
  @ApiResponse({ status: 200, type: NotificationResponseDto, description: 'Notification récupérée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Notification non trouvée' })
  @ApiResponse({ status: 500, type: ApiErrorResponseDto, description: 'Erreur serveur interne' })
  getNotificationById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationResponseDto> {
    return this.service.getNotificationById(id, user);
  }
}
