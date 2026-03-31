import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
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
import { MessagerieRepositoryPort } from './messagerie.repository.port';

@Injectable()
export class MessagerieRepository implements MessagerieRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email },
      include: { type_utilisateur: true },
    }) as unknown as Promise<UserRecord | null>;
  }

  findUserById(id: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: { type_utilisateur: true },
    }) as unknown as Promise<UserRecord | null>;
  }

  createConversation(data: CreateConversationInput): Promise<ConversationRecord> {
    return this.prisma.conversation.create({
      data: {
        id: data.id || randomUUID(),
        titre: data.titre,
        type_conversation: data.type_conversation,
        annonce_id: data.annonce_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    }) as unknown as Promise<ConversationRecord>;
  }

  updateConversation(id: string, data: UpdateConversationInput): Promise<ConversationRecord> {
    return this.prisma.conversation.update({ where: { id }, data }) as unknown as Promise<ConversationRecord>;
  }

  findConversationById(id: string): Promise<ConversationRecord | null> {
    return this.prisma.conversation.findUnique({ where: { id } }) as unknown as Promise<ConversationRecord | null>;
  }

  findDirectConversation(utilisateurId1: string, utilisateurId2: string): Promise<ConversationRecord | null> {
    return this.prisma.conversation.findFirst({
      where: {
        type_conversation: 'DIRECT',
        conversation_participant: {
          some: { utilisateur_id: utilisateurId1 },
        },
        AND: {
          conversation_participant: {
            some: { utilisateur_id: utilisateurId2 },
          },
        },
      },
    }) as unknown as Promise<ConversationRecord | null>;
  }

  findConversationsByParticipantPaged(
    utilisateurId: string,
    page: number,
    size: number,
  ): Promise<{ items: ConversationRecord[]; total: number }> {
    const where = { conversation_participant: { some: { utilisateur_id: utilisateurId } } };
    return Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { updated_at: 'desc' },
      }),
      this.prisma.conversation.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  searchConversations(utilisateurId: string, query: string): Promise<ConversationRecord[]> {
    return this.prisma.conversation.findMany({
      where: {
        conversation_participant: { some: { utilisateur_id: utilisateurId } },
        titre: { contains: query, mode: 'insensitive' },
      },
      orderBy: { updated_at: 'desc' },
      take: 50,
    });
  }

  createParticipant(data: CreateParticipantInput): Promise<ParticipantRecord> {
    return this.prisma.conversation_participant.create({
      data: {
        id: data.id || randomUUID(),
        conversation_id: data.conversation_id,
        utilisateur_id: data.utilisateur_id,
        date_join: data.date_join,
        est_admin: data.est_admin,
        est_mute: data.est_mute,
        nombre_non_lus: data.nombre_non_lus,
      },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, photo_profil_url: true } } },
    }) as unknown as Promise<ParticipantRecord>;
  }

  findParticipantsByConversationId(conversationId: string): Promise<ParticipantRecord[]> {
    return this.prisma.conversation_participant.findMany({
      where: { conversation_id: conversationId },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, photo_profil_url: true } } },
      orderBy: { date_join: 'asc' },
    }) as unknown as Promise<ParticipantRecord[]>;
  }

  findParticipant(conversationId: string, utilisateurId: string): Promise<ParticipantRecord | null> {
    return this.prisma.conversation_participant.findUnique({
      where: {
        conversation_id_utilisateur_id: {
          conversation_id: conversationId,
          utilisateur_id: utilisateurId,
        },
      },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, photo_profil_url: true } } },
    }) as unknown as Promise<ParticipantRecord | null>;
  }

  existsParticipant(conversationId: string, utilisateurId: string): Promise<boolean> {
    return this.prisma.conversation_participant
      .findUnique({
        where: {
          conversation_id_utilisateur_id: {
            conversation_id: conversationId,
            utilisateur_id: utilisateurId,
          },
        },
        select: { id: true },
      })
      .then((value: { id: string } | null) => Boolean(value));
  }

  countAdmins(conversationId: string): Promise<number> {
    return this.prisma.conversation_participant.count({
      where: { conversation_id: conversationId, est_admin: true },
    });
  }

  deleteParticipant(id: string): Promise<ParticipantRecord> {
    return this.prisma.conversation_participant.delete({
      where: { id },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, photo_profil_url: true } } },
    }) as unknown as Promise<ParticipantRecord>;
  }

  createMessage(data: CreateMessageInput): Promise<MessageRecord> {
    return this.prisma.message.create({
      data: {
        id: data.id || randomUUID(),
        conversation_id: data.conversation_id,
        utilisateur_id: data.utilisateur_id,
        contenu: data.contenu,
        date_envoi: data.date_envoi,
        est_lu: data.est_lu,
        est_supprime: data.est_supprime,
        est_epingle: data.est_epingle,
        type_message: data.type_message,
      },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
    }) as unknown as Promise<MessageRecord>;
  }

  updateMessage(id: string, data: UpdateMessageInput): Promise<MessageRecord> {
    return this.prisma.message.update({
      where: { id },
      data: {
        est_supprime: data.est_supprime,
        est_epingle: data.est_epingle,
        est_lu: data.est_lu,
        date_lecture: data.date_lecture,
      },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
    }) as unknown as Promise<MessageRecord>;
  }

  findMessageById(id: string): Promise<MessageRecord | null> {
    return this.prisma.message.findUnique({
      where: { id },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
    }) as unknown as Promise<MessageRecord | null>;
  }

  findMessagesByConversationPaged(
    conversationId: string,
    page: number,
    size: number,
  ): Promise<{ items: MessageRecord[]; total: number }> {
    const where = { conversation_id: conversationId, est_supprime: false };
    return Promise.all([
      this.prisma.message.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { date_envoi: 'desc' },
        include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
      }),
      this.prisma.message.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  searchMessages(
    conversationId: string,
    query: string,
    page: number,
    size: number,
  ): Promise<{ items: MessageRecord[]; total: number }> {
    const where = {
      conversation_id: conversationId,
      est_supprime: false,
      contenu: { contains: query, mode: 'insensitive' as const },
    };

    return Promise.all([
      this.prisma.message.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { date_envoi: 'desc' },
        include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
      }),
      this.prisma.message.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findLastMessage(conversationId: string): Promise<MessageRecord | null> {
    return this.prisma.message.findFirst({
      where: { conversation_id: conversationId, est_supprime: false },
      orderBy: { date_envoi: 'desc' },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
    });
  }

  countUnread(conversationId: string, utilisateurId: string): Promise<number> {
    return this.prisma.message.count({
      where: {
        conversation_id: conversationId,
        utilisateur_id: { not: utilisateurId },
        est_supprime: false,
        est_lu: false,
      },
    });
  }

  markAllAsRead(conversationId: string, utilisateurId: string): Promise<{ count: number }> {
    return this.prisma.message.updateMany({
      where: {
        conversation_id: conversationId,
        utilisateur_id: { not: utilisateurId },
        est_supprime: false,
        est_lu: false,
      },
      data: {
        est_lu: true,
        date_lecture: new Date(),
      },
    });
  }

  newId(): string {
    return randomUUID();
  }
}
