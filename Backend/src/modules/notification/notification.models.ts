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
  typeUtilisateur: { nom: string } | null;
};

export type NotificationRecord = {
  id: string;
  utilisateurId: string;
  titre: string;
  message: string | null;
  type: TypeNotification;
  estLu: boolean | null;
  referenceId: string | null;
  referenceType: string | null;
  dateCreation: Date | null;
  dateLecture: Date | null;
};

export type SignalementRecord = {
  id: string;
  utilisateurId: string;
  typeEntite: TypeEntiteSignalable;
  entiteId: string;
  motif: MotifSignalement;
  description: string | null;
  statutTraitement: StatutTraitementSignalement;
  adminId: string | null;
  dateTraitement: Date | null;
  dateSignalement: Date | null;
  utilisateur: { nom: string | null; prenom: string | null } | null;
};

export type CreateNotificationInput = {
  id: string;
  utilisateur: { connect: { id: string } };
  titre: string;
  message: string;
  type: TypeNotification;
  estLu: boolean;
  referenceId?: string;
  referenceType?: string;
  dateCreation: Date;
};

export type UpdateNotificationInput = Partial<{
  estLu: boolean;
  dateLecture: Date;
}>;

export type CreateSignalementInput = {
  id: string;
  utilisateur: { connect: { id: string } };
  typeEntite: TypeEntiteSignalable;
  entiteId: string;
  motif: MotifSignalement;
  description: string;
  statutTraitement: StatutTraitementSignalement;
  dateSignalement: Date;
};

export type UpdateSignalementInput = Partial<{
  statutTraitement: StatutTraitementSignalement;
  adminId: string;
  dateTraitement: Date;
}>;
