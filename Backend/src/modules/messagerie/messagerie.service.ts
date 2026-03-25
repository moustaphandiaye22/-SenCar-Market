import { Inject, Injectable } from '@nestjs/common';

import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { buildPaged, parsePaginationParams } from '../../common/utils/pagination-helper.util';

import { ConversationResponseDto } from './dto/conversation-response.dto';
import { CreateConversationRequestDto } from './dto/create-conversation-request.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { ParticipantResponseDto } from './dto/participant-response.dto';
import { SendMessageRequestDto } from './dto/send-message-request.dto';
import {
  ConversationRecord,
  MessageRecord,
  UserRecord,
} from './messagerie.models';
import { MESSAGERIE_REPOSITORY_PORT, MessagerieRepositoryPort } from './messagerie.repository.port';
import { MessagerieAccessService } from './services/messagerie-access.service';
import { MessagerieMapper } from './services/messagerie.mapper';
import { MessagerieInputValidator } from './validation/messagerie-input.validator';

@Injectable()
export class MessagerieService {
  constructor(
    @Inject(MESSAGERIE_REPOSITORY_PORT) private readonly repository: MessagerieRepositoryPort,
    private readonly inputValidator: MessagerieInputValidator,
    private readonly accessService: MessagerieAccessService,
    private readonly mapper: MessagerieMapper,
  ) {}

  async createConversation(
    request: CreateConversationRequestDto,
    user: AuthenticatedUser,
  ): Promise<ConversationResponseDto> {
    const createur = await this.mustFindCurrentUser(user.email);
    const titre = this.inputValidator.validateConversationCreation(request, createur.id);

    const type = request.typeConversation;
    if (type === 'DIRECT' && request.autreUtilisateurId) {
      const user2 = await this.repository.findUserById(request.autreUtilisateurId);
      if (!user2) {
        throw new DomainException('Utilisateur cible non trouvé', 404, 'USER_NOT_FOUND');
      }
    }

    if (type === 'DIRECT' && request.autreUtilisateurId) {
      console.log('DEBUG: Checking for existing direct conversation between', createur.id, 'and', request.autreUtilisateurId);
      const existing = await this.repository.findDirectConversation(createur.id, request.autreUtilisateurId);
      if (existing) {
        console.log('DEBUG: Found existing conversation:', existing.id);
        return this.assembleConversation(existing, createur.id);
      }
    }

    const conversation = await this.repository.createConversation({
      id: this.repository.newId(),
      ...(titre ? { titre } : {}),
      type_conversation: type,
      annonce_id: request.annonceId,
      created_at: new Date(),
      updated_at: new Date(),
    } as any);

    await this.repository.createParticipant({
      id: this.repository.newId(),
      conversation_id: conversation.id,
      utilisateur_id: createur.id,
      date_join: new Date(),
      est_admin: true,
      est_mute: false,
      nombre_non_lus: 0,
    } as any);

    if (type === 'DIRECT' && request.autreUtilisateurId) {
      await this.repository.createParticipant({
        id: this.repository.newId(),
        conversation_id: conversation.id,
        utilisateur_id: request.autreUtilisateurId,
        date_join: new Date(),
        est_admin: false,
        est_mute: false,
        nombre_non_lus: 0,
      } as any);
    }

    if (type === 'GROUP' && request.participantIds?.length) {
      const uniqueIds = [...new Set(request.participantIds.filter((id) => id !== createur.id))];
      await Promise.all(
        uniqueIds.map(async (participantId) => {
          const found = await this.repository.findUserById(participantId);
          if (!found) return;
          if (await this.repository.existsParticipant(conversation.id, participantId)) return;

          await this.repository.createParticipant({
            id: this.repository.newId(),
            conversation_id: conversation.id,
            utilisateur_id: participantId,
            date_join: new Date(),
            est_admin: false,
            est_mute: false,
            nombre_non_lus: 0,
          } as any);
        }),
      );
    }

    return this.assembleConversation(conversation, createur.id);
  }

  async getConversationById(conversationId: string, user: AuthenticatedUser): Promise<ConversationResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const conversation = await this.mustFindConversation(conversationId);
    await this.accessService.ensureParticipant(this.repository, conversationId, currentUser.id);

    return this.assembleConversation(conversation, currentUser.id);
  }

  async getConversationsByUtilisateur(
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<ConversationResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const { page: safePage, size: safeSize } = parsePaginationParams(page, size, { defaultSize: 20 });

    const data = await this.repository.findConversationsByParticipantPaged(currentUser.id, safePage, safeSize);
    const content = await Promise.all(
      data.items.map((conv) => this.assembleConversation(conv, currentUser.id)),
    );

    return buildPaged(content, safePage, safeSize, data.total);
  }

  async searchConversations(query: string, user: AuthenticatedUser): Promise<ConversationResponseDto[]> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const cleanedQuery = this.inputValidator.normalizeSearchTerm(query);
    if (!cleanedQuery) {
      return [];
    }
    const list = await this.repository.searchConversations(currentUser.id, cleanedQuery);
    return Promise.all(list.map((conv) => this.assembleConversation(conv, currentUser.id)));
  }

  async getParticipants(conversationId: string, user: AuthenticatedUser): Promise<ParticipantResponseDto[]> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    await this.accessService.ensureParticipant(this.repository, conversationId, currentUser.id);
    const participants = await this.repository.findParticipantsByConversationId(conversationId);
    return participants.map((item) => this.mapper.toParticipantResponse(item));
  }

  async sendMessage(request: SendMessageRequestDto, user: AuthenticatedUser): Promise<MessageResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    await this.mustFindConversation(request.conversationId);
    await this.accessService.ensureParticipant(this.repository, request.conversationId, currentUser.id);
    const contenu = this.inputValidator.requireMessageContent(request.contenu);

    const message = await this.repository.createMessage({
      id: this.repository.newId(),
      conversation_id: request.conversationId,
      utilisateur_id: currentUser.id,
      contenu,
      date_envoi: new Date(),
      est_lu: false,
      est_supprime: false,
      est_epingle: false,
      type_message: request.typeMessage ?? 'TEXTE',
    } as any);

    await this.repository.updateConversation(request.conversationId, { updated_at: new Date() } as any);
    return this.mapper.toMessageResponse(message);
  }

  async getMessagesByConversation(
    conversationId: string,
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<MessageResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    await this.accessService.ensureParticipant(this.repository, conversationId, currentUser.id);

    const { page: safePage, size: safeSize } = parsePaginationParams(page, size, { defaultSize: 50 });
    const data = await this.repository.findMessagesByConversationPaged(conversationId, safePage, safeSize);

    return buildPaged(
      data.items.map((item) => this.mapper.toMessageResponse(item)),
      safePage,
      safeSize,
      data.total,
    );
  }

  async markMessagesAsRead(conversationId: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    await this.accessService.ensureParticipant(this.repository, conversationId, currentUser.id);
    await this.repository.markAllAsRead(conversationId, currentUser.id);
  }

  async deleteMessage(messageId: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const message = await this.mustFindMessage(messageId);

    if (message.utilisateur_id !== currentUser.id) {
      throw new DomainException('Seul l\'auteur peut supprimer ce message', 403, 'CANNOT_DELETE_MESSAGE');
    }

    await this.repository.updateMessage(messageId, { est_supprime: true } as any);
  }

  async pinMessage(messageId: string, user: AuthenticatedUser): Promise<MessageResponseDto> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const message = await this.mustFindMessage(messageId);
    if (message.est_supprime === true) {
      throw new DomainException('Impossible d\'épingler un message supprimé', 400, 'MESSAGE_DELETED_CANNOT_PIN');
    }

    await this.accessService.ensureConversationAdmin(this.repository, message.conversation_id, currentUser.id);
    const pinned = await this.repository.updateMessage(messageId, {
      est_epingle: !(message.est_epingle ?? false),
    } as any);

    return this.mapper.toMessageResponse(pinned);
  }

  async sendTypingIndicator(conversationId: string, user: AuthenticatedUser, isTyping: boolean): Promise<void> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    await this.accessService.ensureParticipant(this.repository, conversationId, currentUser.id);
    void isTyping;
  }

  async searchMessages(
    conversationId: string,
    query: string,
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<MessageResponseDto>> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    await this.accessService.ensureParticipant(this.repository, conversationId, currentUser.id);
    const cleanedQuery = this.inputValidator.normalizeSearchTerm(query);
    if (!cleanedQuery) {
      return buildPaged([], 0, 50, 0);
    }

    const { page: safePage, size: safeSize } = parsePaginationParams(page, size, { defaultSize: 50 });
    const data = await this.repository.searchMessages(conversationId, cleanedQuery, safePage, safeSize);

    return buildPaged(
      data.items.map((item) => this.mapper.toMessageResponse(item)),
      safePage,
      safeSize,
      data.total,
    );
  }

  async leaveConversation(conversationId: string, user: AuthenticatedUser): Promise<void> {
    const currentUser = await this.mustFindCurrentUser(user.email);
    const conversation = await this.mustFindConversation(conversationId);
    const participant = await this.repository.findParticipant(conversationId, currentUser.id);
    if (!participant) {
      throw new DomainException('Vous ne participez pas à cette conversation', 403, 'NOT_PARTICIPANT');
    }

    if (conversation.type_conversation === 'DIRECT') {
      throw new DomainException('Impossible de quitter une conversation directe', 400, 'CANNOT_LEAVE_DIRECT');
    }

    if (participant.est_admin) {
      const adminCount = await this.repository.countAdmins(conversationId);
      if (adminCount <= 1) {
        throw new DomainException('Le dernier admin ne peut pas quitter la conversation', 400, 'LAST_ADMIN_CANNOT_LEAVE');
      }
    }

    await this.repository.deleteParticipant(participant.id);
  }

  private async mustFindCurrentUser(email: string): Promise<UserRecord> {
    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  private async mustFindConversation(id: string): Promise<ConversationRecord> {
    const conv = await this.repository.findConversationById(id);
    if (!conv) {
      throw new DomainException('Conversation non trouvée', 404, 'CONVERSATION_NOT_FOUND');
    }
    return conv;
  }

  private async mustFindMessage(id: string): Promise<MessageRecord> {
    const msg = await this.repository.findMessageById(id);
    if (!msg) {
      throw new DomainException('Message non trouvé', 404, 'MESSAGE_NOT_FOUND');
    }
    return msg;
  }

  private async assembleConversation(conversation: ConversationRecord, utilisateurId: string): Promise<ConversationResponseDto> {
    const [dernierMessage, participants, nonLus] = await Promise.all([
      this.repository.findLastMessage(conversation.id),
      this.repository.findParticipantsByConversationId(conversation.id),
      this.repository.countUnread(conversation.id, utilisateurId),
    ]);

    return this.mapper.toConversationResponse(
      conversation,
      dernierMessage ? this.mapper.toMessageResponse(dernierMessage) : null,
      participants.map((item) => this.mapper.toParticipantResponse(item)),
      nonLus,
    );
  }

  private buildPaged<T>(content: T[], page: number, size: number, total: number): PaginatedResponseDto<T> {
    return buildPaged(content, page, size, total);
  }
}
