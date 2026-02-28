import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
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
import { ApiErrorResponseDto } from '../auth/dto/api-error-response.dto';

import { ConversationResponseDto } from './dto/conversation-response.dto';
import { CreateConversationRequestDto } from './dto/create-conversation-request.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { ParticipantResponseDto } from './dto/participant-response.dto';
import { SendMessageRequestDto } from './dto/send-message-request.dto';
import { MessagerieService } from './messagerie.service';

@ApiTags('Messagerie')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('messagerie')
export class MessagerieController {
  constructor(private readonly service: MessagerieService) {}

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une conversation' })
  @ApiResponse({ status: 201, type: ConversationResponseDto, description: 'Conversation créée avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Conversation non trouvée' })
  @ApiResponse({ status: 409, type: ApiErrorResponseDto, description: 'Conflit - Conversation déjà existante' })
  createConversation(
    @Body() request: CreateConversationRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConversationResponseDto> {
    return this.service.createConversation(request, user);
  }

  @Get('conversations/:conversationId')
  @ApiOperation({ summary: 'Obtenir une conversation' })
  @ApiResponse({ status: 200, type: ConversationResponseDto, description: 'Conversation récupérée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Conversation non trouvée' })
  getConversation(
    @Param('conversationId', new ParseUUIDPipe()) conversationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConversationResponseDto> {
    return this.service.getConversationById(conversationId, user);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Liste des conversations' })
  @ApiResponse({ status: 200, description: 'Conversations récupérées avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  getConversations(
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<ConversationResponseDto>> {
    return this.service.getConversationsByUtilisateur(page, size, user);
  }

  @Get('conversations/search')
  @ApiOperation({ summary: 'Rechercher des conversations' })
  @ApiResponse({ status: 200, description: 'Résultats de recherche récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  searchConversations(
    @Query('query') query: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConversationResponseDto[]> {
    return this.service.searchConversations(query, user);
  }

  @Get('conversations/:conversationId/participants')
  @ApiOperation({ summary: 'Participants d\'une conversation' })
  @ApiResponse({ status: 200, type: [ParticipantResponseDto], description: 'Participants récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Conversation non trouvée' })
  getParticipants(
    @Param('conversationId', new ParseUUIDPipe()) conversationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ParticipantResponseDto[]> {
    return this.service.getParticipants(conversationId, user);
  }

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Envoyer un message' })
  @ApiResponse({ status: 201, type: MessageResponseDto, description: 'Message envoyé avec succès' })
  @ApiResponse({ status: 400, type: ApiErrorResponseDto, description: 'Données invalides' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Conversation non trouvée' })
  sendMessage(
    @Body() request: SendMessageRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MessageResponseDto> {
    return this.service.sendMessage(request, user);
  }

  @Get('conversations/:conversationId/messages')
  @ApiOperation({ summary: 'Messages d\'une conversation' })
  @ApiResponse({ status: 200, description: 'Messages récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Conversation non trouvée' })
  getMessages(
    @Param('conversationId', new ParseUUIDPipe()) conversationId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 50,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<MessageResponseDto>> {
    return this.service.getMessagesByConversation(conversationId, page, size, user);
  }

  @Put('conversations/:conversationId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer comme lu' })
  @ApiResponse({ status: 200, description: 'Messages marqués comme lus' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Conversation non trouvée' })
  async markAsRead(
    @Param('conversationId', new ParseUUIDPipe()) conversationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.markMessagesAsRead(conversationId, user);
  }

  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un message' })
  @ApiResponse({ status: 204, description: 'Message supprimé avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Message non trouvé' })
  async deleteMessage(
    @Param('messageId', new ParseUUIDPipe()) messageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.deleteMessage(messageId, user);
  }

  @Put('messages/:messageId/pin')
  @ApiOperation({ summary: 'Épingler un message' })
  @ApiResponse({ status: 200, type: MessageResponseDto, description: 'Message épinglé avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Message non trouvé' })
  pinMessage(
    @Param('messageId', new ParseUUIDPipe()) messageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MessageResponseDto> {
    return this.service.pinMessage(messageId, user);
  }

  @Post('conversations/:conversationId/typing')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Indicateur de frappe' })
  @ApiResponse({ status: 200, description: 'Indicateur de frappe envoyé' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Conversation non trouvée' })
  async sendTypingIndicator(
    @Param('conversationId', new ParseUUIDPipe()) conversationId: string,
    @Query('isTyping', new ParseBoolPipe()) isTyping: boolean,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.sendTypingIndicator(conversationId, user, isTyping);
  }

  @Get('conversations/:conversationId/messages/search')
  @ApiOperation({ summary: 'Rechercher dans les messages' })
  @ApiResponse({ status: 200, description: 'Résultats de recherche récupérés avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Conversation non trouvée' })
  searchMessages(
    @Param('conversationId', new ParseUUIDPipe()) conversationId: string,
    @Query('query') query: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 0,
    @Query('size', new ParseIntPipe({ optional: true })) size = 50,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<MessageResponseDto>> {
    return this.service.searchMessages(conversationId, query, page, size, user);
  }

  @Post('conversations/:conversationId/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quitter une conversation' })
  @ApiResponse({ status: 204, description: 'Conversation quittée avec succès' })
  @ApiResponse({ status: 401, type: ApiErrorResponseDto, description: 'Non autorisé - Token invalide ou expiré' })
  @ApiResponse({ status: 403, type: ApiErrorResponseDto, description: 'Interdit - Accès refusé' })
  @ApiResponse({ status: 404, type: ApiErrorResponseDto, description: 'Conversation non trouvée' })
  async leaveConversation(
    @Param('conversationId', new ParseUUIDPipe()) conversationId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.service.leaveConversation(conversationId, user);
  }
}
