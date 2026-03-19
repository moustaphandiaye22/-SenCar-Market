import type {
  MotifSignalement,
  StatutTraitementSignalement,
  TypeEntiteSignalable,
  TypeNotification,
} from './types/notification.types';

export type UserRecord = {
  id: string;
  email: string;
  nom: string | null;
  prenom: string | null;
  type_utilisateur: { nom: string } | null;
};

export type NotificationRecord = {
  id: string;
  utilisateur_id: string;
  titre: string;
  message: string | null;
  type: TypeNotification;
  est_lu: boolean | null;
  reference_id: string | null;
  reference_type: string | null;
  created_at: Date | null;
  date_lecture: Date | null;
};

export type SignalementRecord = {
  id: string;
  utilisateur_id: string;
  type_entite: TypeEntiteSignalable;
  entite_id: string;
  motif: MotifSignalement;
  description: string | null;
  statut_traitement: StatutTraitementSignalement;
  traite_par: string | null;
  date_traitement: Date | null;
  created_at: Date | null;
  utilisateur: { nom: string | null; prenom: string | null } | null;
};

export type CreateNotificationInput = {
  id: string;
  utilisateur_id: string;
  titre: string;
  message: string;
  type: TypeNotification;
  est_lu: boolean;
  reference_id?: string;
  reference_type?: string;
  created_at: Date;
};

export type UpdateNotificationInput = Partial<{
  est_lu: boolean;
  date_lecture: Date;
}>;

export type CreateSignalementInput = {
  id: string;
  utilisateur_id: string;
  type_entite: TypeEntiteSignalable;
  entite_id: string;
  motif: MotifSignalement;
  description: string;
  statut_traitement: StatutTraitementSignalement;
  created_at: Date;
};

export type UpdateSignalementInput = Partial<{
  statut_traitement: StatutTraitementSignalement;
  traite_par: string;
  date_traitement: Date;
}>;
