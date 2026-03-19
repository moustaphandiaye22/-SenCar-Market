import { randomUUID } from "crypto";

import { Injectable } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";

import {
  AbonnementRecord,
  BoostAnnonceRecord,
  CreateAbonnementInput,
  CreateBoostInput,
  CreateUtilisateurAbonnementInput,
  UpdateAbonnementInput,
  UpdateBoostInput,
  UpdateUtilisateurAbonnementInput,
  UserRecord,
  UtilisateurAbonnementRecord,
} from "./abonnement.models";
import { AbonnementRepositoryPort } from "./abonnement.repository.port";

@Injectable()
export class AbonnementRepository implements AbonnementRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private mapUserRecord(
    user: {
      id: string;
      email: string;
      type_utilisateur: { nom: string } | null;
    } | null,
  ): UserRecord | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      typeUtilisateur: user.type_utilisateur
        ? { nom: user.type_utilisateur.nom }
        : null,
    };
  }

  private mapAbonnementRecord(
    abonnement: {
      id: string;
      nom: string;
      description: string | null;
      prix_mensuel: unknown;
      duree_jours: number | null;
      nombre_annonces: number | null;
      est_vedette: boolean | null;
      est_certifie: boolean | null;
      type: string | null;
      est_actif: boolean | null;
      avantages: string | null;
      prix_annuel: unknown;
      nombre_boosts_gratuits: number | null;
      acces_prioritaire: boolean | null;
      support_prioritaire: boolean | null;
    } | null,
  ): AbonnementRecord | null {
    if (!abonnement) return null;
    return {
      id: abonnement.id,
      nom: abonnement.nom,
      description: abonnement.description,
      prixMensuel: abonnement.prix_mensuel,
      dureeJours: abonnement.duree_jours,
      nombreAnnonces: abonnement.nombre_annonces,
      estVedette: abonnement.est_vedette,
      estCertifie: abonnement.est_certifie,
      type: abonnement.type as AbonnementRecord["type"],
      estActif: abonnement.est_actif,
      avantages: abonnement.avantages,
      prixAnnuel: abonnement.prix_annuel,
      nombreBoostsGratuits: abonnement.nombre_boosts_gratuits,
      accesPrioritaire: abonnement.acces_prioritaire,
      supportPrioritaire: abonnement.support_prioritaire,
    };
  }

  private mapAbonnementRecords(
    abonnements: {
      id: string;
      nom: string;
      description: string | null;
      prix_mensuel: unknown;
      duree_jours: number | null;
      nombre_annonces: number | null;
      est_vedette: boolean | null;
      est_certifie: boolean | null;
      type: string | null;
      est_actif: boolean | null;
      avantages: string | null;
      prix_annuel: unknown;
      nombre_boosts_gratuits: number | null;
      acces_prioritaire: boolean | null;
      support_prioritaire: boolean | null;
    }[],
  ): AbonnementRecord[] {
    return abonnements.map(
      (a) => this.mapAbonnementRecord(a) as AbonnementRecord,
    );
  }

  private mapUtilisateurAbonnementRecord(
    record: {
      id: string;
      utilisateur_id: string;
      abonnement_id: string;
      date_debut: Date | null;
      date_fin: Date | null;
      statut: string;
      nombre_annonces_utilisees: number | null;
      abonnement: {
        id: string;
        nom: string;
        nombre_annonces: number | null;
      } | null;
    } | null,
  ): UtilisateurAbonnementRecord | null {
    if (!record) return null;
    return {
      id: record.id,
      utilisateurId: record.utilisateur_id,
      abonnementId: record.abonnement_id,
      dateDebut: record.date_debut,
      dateFin: record.date_fin,
      statut: record.statut as UtilisateurAbonnementRecord["statut"],
      nombreAnnoncesUtilisees: record.nombre_annonces_utilisees,
      abonnement: record.abonnement,
    };
  }

  private mapUtilisateurAbonnementRecords(
    records: {
      id: string;
      utilisateur_id: string;
      abonnement_id: string;
      date_debut: Date | null;
      date_fin: Date | null;
      statut: string;
      nombre_annonces_utilisees: number | null;
      abonnement: {
        id: string;
        nom: string;
        nombre_annonces: number | null;
      } | null;
    }[],
  ): UtilisateurAbonnementRecord[] {
    return records.map(
      (r) =>
        this.mapUtilisateurAbonnementRecord(r) as UtilisateurAbonnementRecord,
    );
  }

  private mapBoostAnnonceRecord(
    record: {
      id: string;
      annonce_location_id: string;
      date_debut: Date | null;
      date_fin: Date | null;
      niveau_boost: string | null;
      statut: string | null;
      payment_id: string | null;
    } | null,
  ): BoostAnnonceRecord | null {
    if (!record) return null;
    return {
      id: record.id,
      annonceLocationId: record.annonce_location_id,
      dateDebut: record.date_debut,
      dateFin: record.date_fin,
      niveauBoost: record.niveau_boost,
      statut: record.statut as BoostAnnonceRecord["statut"],
      paymentId: record.payment_id,
    };
  }

  private mapBoostAnnonceRecords(
    records: {
      id: string;
      annonce_location_id: string;
      date_debut: Date | null;
      date_fin: Date | null;
      niveau_boost: string | null;
      statut: string | null;
      payment_id: string | null;
    }[],
  ): BoostAnnonceRecord[] {
    return records.map(
      (r) => this.mapBoostAnnonceRecord(r) as BoostAnnonceRecord,
    );
  }

  findUserByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur
      .findUnique({
        where: { email },
        include: { type_utilisateur: true },
      })
      .then((user) =>
        this.mapUserRecord(
          user as {
            id: string;
            email: string;
            type_utilisateur: { nom: string } | null;
          },
        ),
      );
  }

  findUserById(id: string): Promise<UserRecord | null> {
    return this.prisma.utilisateur
      .findUnique({
        where: { id },
        include: { type_utilisateur: true },
      })
      .then((user) =>
        this.mapUserRecord(
          user as {
            id: string;
            email: string;
            type_utilisateur: { nom: string } | null;
          },
        ),
      );
  }

  createAbonnement(data: CreateAbonnementInput): Promise<AbonnementRecord> {
    return this.prisma.abonnement.create({ data }).then(
      (result) =>
        this.mapAbonnementRecord(
          result as unknown as {
            id: string;
            nom: string;
            description: string | null;
            prix_mensuel: unknown;
            duree_jours: number | null;
            nombre_annonces: number | null;
            est_vedette: boolean | null;
            est_certifie: boolean | null;
            type: string | null;
            est_actif: boolean | null;
            avantages: string | null;
            prix_annuel: unknown;
            nombre_boosts_gratuits: number | null;
            acces_prioritaire: boolean | null;
            support_prioritaire: boolean | null;
          },
        ) as AbonnementRecord,
    );
  }

  updateAbonnement(
    id: string,
    data: UpdateAbonnementInput,
  ): Promise<AbonnementRecord> {
    return this.prisma.abonnement.update({ where: { id }, data }).then(
      (result) =>
        this.mapAbonnementRecord(
          result as unknown as {
            id: string;
            nom: string;
            description: string | null;
            prix_mensuel: unknown;
            duree_jours: number | null;
            nombre_annonces: number | null;
            est_vedette: boolean | null;
            est_certifie: boolean | null;
            type: string | null;
            est_actif: boolean | null;
            avantages: string | null;
            prix_annuel: unknown;
            nombre_boosts_gratuits: number | null;
            acces_prioritaire: boolean | null;
            support_prioritaire: boolean | null;
          },
        ) as AbonnementRecord,
    );
  }

  findAbonnementById(id: string): Promise<AbonnementRecord | null> {
    return this.prisma.abonnement.findUnique({ where: { id } }).then((result) =>
      this.mapAbonnementRecord(
        result as unknown as {
          id: string;
          nom: string;
          description: string | null;
          prix_mensuel: unknown;
          duree_jours: number | null;
          nombre_annonces: number | null;
          est_vedette: boolean | null;
          est_certifie: boolean | null;
          type: string | null;
          est_actif: boolean | null;
          avantages: string | null;
          prix_annuel: unknown;
          nombre_boosts_gratuits: number | null;
          acces_prioritaire: boolean | null;
          support_prioritaire: boolean | null;
        },
      ),
    );
  }

  findAllAbonnements(): Promise<AbonnementRecord[]> {
    return this.prisma.abonnement
      .findMany({
        orderBy: { prix_mensuel: "asc" },
      })
      .then((results) =>
        this.mapAbonnementRecords(
          results as unknown as {
            id: string;
            nom: string;
            description: string | null;
            prix_mensuel: unknown;
            duree_jours: number | null;
            nombre_annonces: number | null;
            est_vedette: boolean | null;
            est_certifie: boolean | null;
            type: string | null;
            est_actif: boolean | null;
            avantages: string | null;
            prix_annuel: unknown;
            nombre_boosts_gratuits: number | null;
            acces_prioritaire: boolean | null;
            support_prioritaire: boolean | null;
          }[],
        ),
      );
  }

  createUtilisateurAbonnement(
    data: CreateUtilisateurAbonnementInput,
  ): Promise<UtilisateurAbonnementRecord> {
    return this.prisma.utilisateur_abonnement
      .create({
        data,
        include: {
          abonnement: {
            select: { id: true, nom: true, nombre_annonces: true },
          },
        },
      })
      .then(
        (result) =>
          this.mapUtilisateurAbonnementRecord(
            result as unknown as {
              id: string;
              utilisateur_id: string;
              abonnement_id: string;
              date_debut: Date | null;
              date_fin: Date | null;
              statut: string;
              nombre_annonces_utilisees: number | null;
              abonnement: {
                id: string;
                nom: string;
                nombre_annonces: number | null;
              } | null;
            },
          ) as UtilisateurAbonnementRecord,
      );
  }

  updateUtilisateurAbonnement(
    id: string,
    data: UpdateUtilisateurAbonnementInput,
  ): Promise<UtilisateurAbonnementRecord> {
    return this.prisma.utilisateur_abonnement
      .update({
        where: { id },
        data,
        include: {
          abonnement: {
            select: { id: true, nom: true, nombre_annonces: true },
          },
        },
      })
      .then(
        (result) =>
          this.mapUtilisateurAbonnementRecord(
            result as unknown as {
              id: string;
              utilisateur_id: string;
              abonnement_id: string;
              date_debut: Date | null;
              date_fin: Date | null;
              statut: string;
              nombre_annonces_utilisees: number | null;
              abonnement: {
                id: string;
                nom: string;
                nombre_annonces: number | null;
              } | null;
            },
          ) as UtilisateurAbonnementRecord,
      );
  }

  findActiveSubscription(
    utilisateurId: string,
    now: Date,
  ): Promise<UtilisateurAbonnementRecord | null> {
    return this.prisma.utilisateur_abonnement
      .findFirst({
        where: {
          utilisateur_id: utilisateurId,
          statut: "ACTIF",
          date_fin: { gt: now },
        },
        orderBy: { date_fin: "desc" },
        include: {
          abonnement: {
            select: { id: true, nom: true, nombre_annonces: true },
          },
        },
      })
      .then((result) =>
        this.mapUtilisateurAbonnementRecord(
          result as unknown as {
            id: string;
            utilisateur_id: string;
            abonnement_id: string;
            date_debut: Date | null;
            date_fin: Date | null;
            statut: string;
            nombre_annonces_utilisees: number | null;
            abonnement: {
              id: string;
              nom: string;
              nombre_annonces: number | null;
            } | null;
          },
        ),
      );
  }

  findPendingSubscription(
    utilisateurId: string,
  ): Promise<UtilisateurAbonnementRecord | null> {
    return this.prisma.utilisateur_abonnement
      .findFirst({
        where: {
          utilisateur_id: utilisateurId,
          statut: "EN_ATTENTE",
        },
        orderBy: { date_debut: "desc" },
        include: {
          abonnement: {
            select: { id: true, nom: true, nombre_annonces: true },
          },
        },
      })
      .then((result) =>
        this.mapUtilisateurAbonnementRecord(
          result as unknown as {
            id: string;
            utilisateur_id: string;
            abonnement_id: string;
            date_debut: Date | null;
            date_fin: Date | null;
            statut: string;
            nombre_annonces_utilisees: number | null;
            abonnement: {
              id: string;
              nom: string;
              nombre_annonces: number | null;
            } | null;
          },
        ),
      );
  }

  findUtilisateurAbonnementById(
    id: string,
  ): Promise<UtilisateurAbonnementRecord | null> {
    return this.prisma.utilisateur_abonnement
      .findUnique({
        where: { id },
        include: {
          abonnement: {
            select: { id: true, nom: true, nombre_annonces: true },
          },
        },
      })
      .then((result) =>
        result
          ? this.mapUtilisateurAbonnementRecord(
              result as unknown as {
                id: string;
                utilisateur_id: string;
                abonnement_id: string;
                date_debut: Date | null;
                date_fin: Date | null;
                statut: string;
                nombre_annonces_utilisees: number | null;
                abonnement: {
                  id: string;
                  nom: string;
                  nombre_annonces: number | null;
                } | null;
              },
            )
          : null,
      );
  }

  findSubscriptionsByUtilisateurPaged(
    utilisateurId: string,
    page: number,
    size: number,
  ): Promise<{ items: UtilisateurAbonnementRecord[]; total: number }> {
    return Promise.all([
      this.prisma.utilisateur_abonnement.findMany({
        where: { utilisateur_id: utilisateurId },
        skip: page * size,
        take: size,
        orderBy: { date_debut: "desc" },
        include: {
          abonnement: {
            select: { id: true, nom: true, nombre_annonces: true },
          },
        },
      }),
      this.prisma.utilisateur_abonnement.count({
        where: { utilisateur_id: utilisateurId },
      }),
    ]).then(([items, total]) => ({
      items: this.mapUtilisateurAbonnementRecords(
        items as unknown as {
          id: string;
          utilisateur_id: string;
          abonnement_id: string;
          date_debut: Date | null;
          date_fin: Date | null;
          statut: string;
          nombre_annonces_utilisees: number | null;
          abonnement: {
            id: string;
            nom: string;
            nombre_annonces: number | null;
          } | null;
        }[],
      ),
      total,
    }));
  }

  findExpiredActiveSubscriptions(
    now: Date,
  ): Promise<UtilisateurAbonnementRecord[]> {
    return this.prisma.utilisateur_abonnement
      .findMany({
        where: {
          statut: "ACTIF",
          date_fin: { lte: now },
        },
        include: {
          abonnement: {
            select: { id: true, nom: true, nombre_annonces: true },
          },
        },
      })
      .then((results) =>
        this.mapUtilisateurAbonnementRecords(
          results as unknown as {
            id: string;
            utilisateur_id: string;
            abonnement_id: string;
            date_debut: Date | null;
            date_fin: Date | null;
            statut: string;
            nombre_annonces_utilisees: number | null;
            abonnement: {
              id: string;
              nom: string;
              nombre_annonces: number | null;
            } | null;
          }[],
        ),
      );
  }

  findExpiringSoon(
    now: Date,
    endDate: Date,
  ): Promise<UtilisateurAbonnementRecord[]> {
    return this.prisma.utilisateur_abonnement
      .findMany({
        where: {
          statut: "ACTIF",
          date_fin: { gt: now, lte: endDate },
        },
        include: {
          abonnement: {
            select: { id: true, nom: true, nombre_annonces: true },
          },
        },
      })
      .then((results) =>
        this.mapUtilisateurAbonnementRecords(
          results as unknown as {
            id: string;
            utilisateur_id: string;
            abonnement_id: string;
            date_debut: Date | null;
            date_fin: Date | null;
            statut: string;
            nombre_annonces_utilisees: number | null;
            abonnement: {
              id: string;
              nom: string;
              nombre_annonces: number | null;
            } | null;
          }[],
        ),
      );
  }

  createBoost(data: CreateBoostInput): Promise<BoostAnnonceRecord> {
    return this.prisma.boost_annonce.create({ data }).then(
      (result) =>
        this.mapBoostAnnonceRecord(
          result as unknown as {
            id: string;
            annonce_location_id: string;
            date_debut: Date | null;
            date_fin: Date | null;
            niveau_boost: string | null;
            statut: string | null;
            payment_id: string | null;
          },
        ) as BoostAnnonceRecord,
    );
  }

  updateBoost(id: string, data: UpdateBoostInput): Promise<BoostAnnonceRecord> {
    const updateData: Record<string, unknown> = {};
    if (data.dateDebut !== undefined) updateData.date_debut = data.dateDebut;
    if (data.dateFin !== undefined) updateData.date_fin = data.dateFin;
    if (data.niveauBoost !== undefined)
      updateData.niveau_boost = data.niveauBoost;
    if (data.statut !== undefined) updateData.statut = data.statut;
    if (data.payment_id !== undefined) updateData.payment_id = data.payment_id;

    return this.prisma.boost_annonce
      .update({
        where: { id },
        data: updateData as any,
      })
      .then(
        (result) =>
          this.mapBoostAnnonceRecord(
            result as unknown as {
              id: string;
              annonce_location_id: string;
              date_debut: Date | null;
              date_fin: Date | null;
              niveau_boost: string | null;
              statut: string | null;
              payment_id: string | null;
            },
          ) as BoostAnnonceRecord,
      );
  }

  deleteBoost(id: string): Promise<BoostAnnonceRecord> {
    return this.prisma.boost_annonce.delete({ where: { id } }).then(
      (result) =>
        this.mapBoostAnnonceRecord(
          result as unknown as {
            id: string;
            annonce_location_id: string;
            date_debut: Date | null;
            date_fin: Date | null;
            niveau_boost: string | null;
            statut: string | null;
            payment_id: string | null;
          },
        ) as BoostAnnonceRecord,
    );
  }

  findBoostById(id: string): Promise<BoostAnnonceRecord | null> {
    return this.prisma.boost_annonce
      .findUnique({ where: { id } })
      .then((result) =>
        this.mapBoostAnnonceRecord(
          result as unknown as {
            id: string;
            annonce_location_id: string;
            date_debut: Date | null;
            date_fin: Date | null;
            niveau_boost: string | null;
            statut: string | null;
            payment_id: string | null;
          },
        ),
      );
  }

  findBoostsByAnnonceLocationId(
    annonceLocationId: string,
    now: Date,
  ): Promise<BoostAnnonceRecord[]> {
    return this.prisma.boost_annonce
      .findMany({
        where: {
          annonce_location_id: annonceLocationId,
          date_fin: { gt: now },
        },
        orderBy: { date_fin: "desc" },
      })
      .then((results) =>
        this.mapBoostAnnonceRecords(
          results as unknown as {
            id: string;
            annonce_location_id: string;
            date_debut: Date | null;
            date_fin: Date | null;
            niveau_boost: string | null;
            statut: string | null;
            payment_id: string | null;
          }[],
        ),
      );
  }

  findPaymentById(
    paymentId: string,
  ): Promise<{ id: string; statut: string } | null> {
    return this.prisma.paiement.findUnique({
      where: { id: paymentId },
      select: { id: true, statut: true },
    });
  }

  newId(): string {
    return randomUUID();
  }
}
