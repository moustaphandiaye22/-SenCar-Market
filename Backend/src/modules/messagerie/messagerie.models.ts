import type { TypeConversation, TypeMessage } from './types/messagerie.types';

type ConnectById = { connect: { id: string } };

export type UserRecord = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  photoProfilUrl: string | null;
  typeUtilisateur: { nom: string } | null;
};

export type ParticipantRecord = {
  id: string;
  conversationId: string;
  utilisateurId: string;
  dateJoin: Date | null;
  estAdmin: boolean | null;
  estMute: boolean | null;
  derniereLectureDate: Date | null;
  nombreNonLus: number | null;
  utilisateur: { id: string; nom: string | null; prenom: string | null; photoProfilUrl: string | null };
};

export type MessageRecord = {
  id: string;
  conversationId: string;
  utilisateurId: string;
  contenu: string;
  dateEnvoi: Date | null;
  dateLecture: Date | null;
  estLu: boolean | null;
  estSupprime: boolean | null;
  estEpingle: boolean | null;
  typeMessage: string | null;
  utilisateur: { id: string; nom: string | null; prenom: string | null };
};

export type ConversationRecord = {
  id: string;
  titre: string | null;
  typeConversation: TypeConversation | null;
  annonceId: string | null;
  messageEpingleId: string | null;
  avatarUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type CreateConversationInput = {
  id: string;
  titre?: string;
  typeConversation: TypeConversation;
  annonceId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateConversationInput = Partial<{
  titre: string;
  avatarUrl: string;
  updatedAt: Date;
}>;

export type CreateParticipantInput = {
  id: string;
  conversation: ConnectById;
  utilisateur: ConnectById;
  dateJoin: Date;
  estAdmin: boolean;
  estMute: boolean;
  nombreNonLus: number;
};

export type CreateMessageInput = {
  id: string;
  conversation: ConnectById;
  utilisateur: ConnectById;
  contenu: string;
  dateEnvoi: Date;
  estLu: boolean;
  estSupprime: boolean;
  estEpingle: boolean;
  typeMessage: TypeMessage;
};

export type UpdateMessageInput = Partial<{
  estSupprime: boolean;
  estEpingle: boolean;
  estLu: boolean;
  dateLecture: Date;
}>;
