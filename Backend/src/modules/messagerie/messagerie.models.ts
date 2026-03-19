import type { TypeConversation, TypeMessage } from './types/messagerie.types';

type ConnectById = { connect: { id: string } };

export type UserRecord = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  photo_profil_url: string | null;
  type_utilisateur: { nom: string } | null;
};

export type ParticipantRecord = {
  id: string;
  conversation_id: string;
  utilisateur_id: string;
  date_join: Date | null;
  est_admin: boolean | null;
  est_mute: boolean | null;
  derniere_lecture_date: Date | null;
  nombre_non_lus: number | null;
  utilisateur: { id: string; nom: string | null; prenom: string | null; photo_profil_url: string | null };
};

export type MessageRecord = {
  id: string;
  conversation_id: string;
  utilisateur_id: string;
  contenu: string;
  date_envoi: Date | null;
  date_lecture: Date | null;
  est_lu: boolean | null;
  est_supprime: boolean | null;
  est_epingle: boolean | null;
  type_message: string | null;
  utilisateur: { id: string; nom: string | null; prenom: string | null };
};

export type ConversationRecord = {
  id: string;
  titre: string | null;
  type_conversation: TypeConversation | null;
  annonce_id: string | null;
  message_epingle_id: string | null;
  avatar_url: string | null;
  created_at: Date | null;
  updated_at: Date | null;
};

export type CreateConversationInput = {
  id: string;
  titre?: string;
  type_conversation: TypeConversation;
  annonce_id?: string;
  created_at: Date;
  updated_at: Date;
};

export type UpdateConversationInput = Partial<{
  titre: string;
  avatar_url: string;
  updated_at: Date;
}>;

export type CreateParticipantInput = {
  id: string;
  conversation_id: string;
  utilisateur_id: string;
  date_join: Date;
  est_admin: boolean;
  est_mute: boolean;
  nombre_non_lus: number;
};

export type CreateMessageInput = {
  id: string;
  conversation_id: string;
  utilisateur_id: string;
  contenu: string;
  date_envoi: Date;
  est_lu: boolean;
  est_supprime: boolean;
  est_epingle: boolean;
  type_message: TypeMessage;
};

export type UpdateMessageInput = Partial<{
  est_supprime: boolean;
  est_epingle: boolean;
  est_lu: boolean;
  date_lecture: Date;
}>;
