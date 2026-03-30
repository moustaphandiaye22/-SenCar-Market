import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { MessagerieRepositoryPort } from './messagerie.repository.port';
import { MESSAGERIE_REPOSITORY_PORT } from './messagerie.repository.port';
import { MessagerieService } from './messagerie.service';
import { MessagerieAccessService } from './services/messagerie-access.service';
import { MessagerieMapper } from './services/messagerie.mapper';
import { MessagerieInputValidator } from './validation/messagerie-input.validator';

describe('MessagerieService', () => {
  let service: MessagerieService;
  let repository: jest.Mocked<MessagerieRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagerieService,
        MessagerieInputValidator,
        MessagerieAccessService,
        MessagerieMapper,
        {
          provide: MESSAGERIE_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            findUserById: jest.fn(),
            createConversation: jest.fn(),
            updateConversation: jest.fn(),
            findConversationById: jest.fn(),
            findDirectConversation: jest.fn(),
            findConversationsByParticipantPaged: jest.fn(),
            searchConversations: jest.fn(),
            createParticipant: jest.fn(),
            findParticipantsByConversationId: jest.fn(),
            findParticipant: jest.fn(),
            existsParticipant: jest.fn(),
            countAdmins: jest.fn(),
            deleteParticipant: jest.fn(),
            createMessage: jest.fn(),
            updateMessage: jest.fn(),
            findMessageById: jest.fn(),
            findMessagesByConversationPaged: jest.fn(),
            searchMessages: jest.fn(),
            findLastMessage: jest.fn(),
            countUnread: jest.fn(),
            markAllAsRead: jest.fn(),
            newId: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
          },
        },
      ],
    }).compile();

    service = module.get<MessagerieService>(MessagerieService);
    repository = module.get(MESSAGERIE_REPOSITORY_PORT);
  });

  it('should reject deleting message from another user', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      nom: 'A',
      prenom: 'B',
      photo_profil_url: null,
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);

    repository.findMessageById.mockResolvedValue({
      id: 'msg-1',
      conversation_id: 'conv-1',
      utilisateur_id: 'user-2',
    } as never);

    await expect(
      service.deleteMessage('msg-1', {
        userId: 'user-1',
        email: 'a@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow('Seul l\'auteur peut supprimer ce message');
  });

  it('should reject direct conversation with self', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      nom: 'A',
      prenom: 'B',
      photo_profil_url: null,
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);

    await expect(
      service.createConversation(
        {
          typeConversation: 'DIRECT',
          autreUtilisateurId: 'user-1',
        },
        {
          userId: 'user-1',
          email: 'a@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Impossible de créer une conversation directe avec soi-même');
  });

  it('should reject group conversation without title', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      nom: 'A',
      prenom: 'B',
      photo_profil_url: null,
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);

    await expect(
      service.createConversation(
        {
          typeConversation: 'GROUP',
          titre: '   ',
        },
        {
          userId: 'user-1',
          email: 'a@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Le titre est requis pour une conversation de groupe');
  });

  it('should return empty list when conversation search query is blank', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      nom: 'A',
      prenom: 'B',
      photo_profil_url: null,
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);

    const result = await service.searchConversations(
      '   ',
      {
        userId: 'user-1',
        email: 'a@test.com',
        typeUtilisateur: 'UTILISATEUR',
      },
    );

    expect(result).toEqual([]);
    expect(repository.searchConversations).not.toHaveBeenCalled();
  });

  it('should reject pinning a deleted message', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'a@test.com',
      nom: 'A',
      prenom: 'B',
      photo_profil_url: null,
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);
    repository.findMessageById.mockResolvedValue({
      id: 'msg-1',
      conversation_id: 'conv-1',
      utilisateur_id: 'user-2',
      est_supprime: true,
    } as never);

    await expect(
      service.pinMessage('msg-1', {
        userId: 'user-1',
        email: 'a@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow("Impossible d'épingler un message supprimé");
  });
});
