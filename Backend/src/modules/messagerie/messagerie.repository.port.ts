import type {
  ConversationRecord,
  CreateConversationInput,
  CreateMessageInput,
  CreateParticipantInput,
  MessageRecord,
  ParticipantRecord,
  UpdateConversationInput,
  UpdateMessageInput,
  UserRecord,
} from './messagerie.models';

export const MESSAGERIE_REPOSITORY_PORT = Symbol('MESSAGERIE_REPOSITORY_PORT');

export interface MessagerieRepositoryPort {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;

  createConversation(data: CreateConversationInput): Promise<ConversationRecord>;
  updateConversation(id: string, data: UpdateConversationInput): Promise<ConversationRecord>;
  findConversationById(id: string): Promise<ConversationRecord | null>;
  findDirectConversation(utilisateurId1: string, utilisateurId2: string): Promise<ConversationRecord | null>;
  findConversationsByParticipantPaged(
    utilisateurId: string,
    page: number,
    size: number,
  ): Promise<{ items: ConversationRecord[]; total: number }>;
  searchConversations(utilisateurId: string, query: string): Promise<ConversationRecord[]>;

  createParticipant(data: CreateParticipantInput): Promise<ParticipantRecord>;
  findParticipantsByConversationId(conversationId: string): Promise<ParticipantRecord[]>;
  findParticipant(conversationId: string, utilisateurId: string): Promise<ParticipantRecord | null>;
  existsParticipant(conversationId: string, utilisateurId: string): Promise<boolean>;
  countAdmins(conversationId: string): Promise<number>;
  deleteParticipant(id: string): Promise<ParticipantRecord>;

  createMessage(data: CreateMessageInput): Promise<MessageRecord>;
  updateMessage(id: string, data: UpdateMessageInput): Promise<MessageRecord>;
  findMessageById(id: string): Promise<MessageRecord | null>;
  findMessagesByConversationPaged(
    conversationId: string,
    page: number,
    size: number,
  ): Promise<{ items: MessageRecord[]; total: number }>;
  searchMessages(
    conversationId: string,
    query: string,
    page: number,
    size: number,
  ): Promise<{ items: MessageRecord[]; total: number }>;
  findLastMessage(conversationId: string): Promise<MessageRecord | null>;
  countUnread(conversationId: string, utilisateurId: string): Promise<number>;
  markAllAsRead(conversationId: string, utilisateurId: string): Promise<{ count: number }>;

  newId(): string;
}
