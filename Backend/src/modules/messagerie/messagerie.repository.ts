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
      include: { typeUtilisateur: true },
    });
  }

  findUserById(id: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur.findUnique({
      where: { id },
      include: { typeUtilisateur: true },
    });
  }

  createConversation(data: CreateConversationInput): Promise<ConversationRecord> {
    return this.prisma.conversation.create({ data });
  }

  updateConversation(id: string, data: UpdateConversationInput): Promise<ConversationRecord> {
    return this.prisma.conversation.update({ where: { id }, data });
  }

  findConversationById(id: string): Promise<ConversationRecord | null> {
    return this.prisma.conversation.findUnique({ where: { id } });
  }

  findDirectConversation(utilisateurId1: string, utilisateurId2: string): Promise<ConversationRecord | null> {
    return this.prisma.conversation.findFirst({
      where: {
        typeConversation: 'DIRECT',
        participants: {
          some: { utilisateurId: utilisateurId1 },
        },
        AND: {
          participants: {
            some: { utilisateurId: utilisateurId2 },
          },
        },
      },
    });
  }

  findConversationsByParticipantPaged(
    utilisateurId: string,
    page: number,
    size: number,
  ): Promise<{ items: ConversationRecord[]; total: number }> {
    const where = { participants: { some: { utilisateurId } } };
    return Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.conversation.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  searchConversations(utilisateurId: string, query: string): Promise<ConversationRecord[]> {
    return this.prisma.conversation.findMany({
      where: {
        participants: { some: { utilisateurId } },
        titre: { contains: query, mode: 'insensitive' },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
  }

  createParticipant(data: CreateParticipantInput): Promise<ParticipantRecord> {
    return this.prisma.conversationParticipant.create({
      data,
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, photoProfilUrl: true } } },
    });
  }

  findParticipantsByConversationId(conversationId: string): Promise<ParticipantRecord[]> {
    return this.prisma.conversationParticipant.findMany({
      where: { conversationId },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, photoProfilUrl: true } } },
      orderBy: { dateJoin: 'asc' },
    });
  }

  findParticipant(conversationId: string, utilisateurId: string): Promise<ParticipantRecord | null> {
    return this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_utilisateurId: {
          conversationId,
          utilisateurId,
        },
      },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, photoProfilUrl: true } } },
    });
  }

  existsParticipant(conversationId: string, utilisateurId: string): Promise<boolean> {
    return this.prisma.conversationParticipant
      .findUnique({
        where: {
          conversationId_utilisateurId: {
            conversationId,
            utilisateurId,
          },
        },
        select: { id: true },
      })
      .then((value: { id: string } | null) => Boolean(value));
  }

  countAdmins(conversationId: string): Promise<number> {
    return this.prisma.conversationParticipant.count({
      where: { conversationId, estAdmin: true },
    });
  }

  deleteParticipant(id: string): Promise<ParticipantRecord> {
    return this.prisma.conversationParticipant.delete({
      where: { id },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true, photoProfilUrl: true } } },
    });
  }

  createMessage(data: CreateMessageInput): Promise<MessageRecord> {
    return this.prisma.message.create({
      data,
      include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
    });
  }

  updateMessage(id: string, data: UpdateMessageInput): Promise<MessageRecord> {
    return this.prisma.message.update({
      where: { id },
      data,
      include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
    });
  }

  findMessageById(id: string): Promise<MessageRecord | null> {
    return this.prisma.message.findUnique({
      where: { id },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
    });
  }

  findMessagesByConversationPaged(
    conversationId: string,
    page: number,
    size: number,
  ): Promise<{ items: MessageRecord[]; total: number }> {
    const where = { conversationId, estSupprime: false };
    return Promise.all([
      this.prisma.message.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { dateEnvoi: 'desc' },
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
      conversationId,
      estSupprime: false,
      contenu: { contains: query, mode: 'insensitive' as const },
    };

    return Promise.all([
      this.prisma.message.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { dateEnvoi: 'desc' },
        include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
      }),
      this.prisma.message.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  }

  findLastMessage(conversationId: string): Promise<MessageRecord | null> {
    return this.prisma.message.findFirst({
      where: { conversationId, estSupprime: false },
      orderBy: { dateEnvoi: 'desc' },
      include: { utilisateur: { select: { id: true, nom: true, prenom: true } } },
    });
  }

  countUnread(conversationId: string, utilisateurId: string): Promise<number> {
    return this.prisma.message.count({
      where: {
        conversationId,
        utilisateurId: { not: utilisateurId },
        estSupprime: false,
        estLu: false,
      },
    });
  }

  markAllAsRead(conversationId: string, utilisateurId: string): Promise<{ count: number }> {
    return this.prisma.message.updateMany({
      where: {
        conversationId,
        utilisateurId: { not: utilisateurId },
        estSupprime: false,
        estLu: false,
      },
      data: {
        estLu: true,
        dateLecture: new Date(),
      },
    });
  }

  newId(): string {
    return randomUUID();
  }
}
