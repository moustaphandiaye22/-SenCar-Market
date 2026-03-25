import { randomUUID } from "crypto";

import { Injectable } from "@nestjs/common";
import {
  StatutReservation,
  StatutTransaction,
  TypeNotification,
} from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";

import {
  AdminUserRecord,
  TransactionRecord,
  VehiculeRecord,
} from "./admin.models";
import { AdminRepositoryPort } from "./admin.repository.port";

@Injectable()
export class AdminRepository implements AdminRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  private toPrismaData(data: Record<string, any>): Record<string, any> {
    const prismaData: Record<string, any> = {};
    const mappings: Record<string, string> = {
      deletedAt: "deleted_at",
      typeUtilisateurId: "type_utilisateur_id",
      photoProfilUrl: "photo_profil_url",
      emailVerifie: "email_verifie",
      telephoneVerifie: "telephone_verifie",
      doubleAuthActive: "double_auth_active",
      statutVerification: "statut_verification",
      createdAt: "created_at",
      updatedAt: "updated_at",
      proprietaireId: "proprietaire_id",
      marqueId: "marque_id",
      modeleId: "modele_id",
      carburantId: "carburant_id",
      boiteVitesseId: "boite_vitesse_id",
      anneeFabrication: "annee_fabrication",
      prixVente: "prix_vente",
      numeroVin: "numero_vin",
      immatriculation: "immatriculation",
      prixNegociable: "prix_negociable",
      estBoost: "est_boost",
      boostDebut: "boost_debut",
      boostFin: "boost_fin",
      nombreFavoris: "nombre_favoris",
      nombrePortes: "nombre_portes",
      nombrePlaces: "nombre_places",
      puissanceFiscale: "puissance_fiscale",
      estGarantie: "est_garantie",
      garantieMois: "garantie_mois",
      portefeuilleId: "portefeuille_id",
      dateTransaction: "date_transaction",
      referenceExterne: "reference_externe",
      typeTransaction: "type_transaction",
      referenceId: "reference_id",
      referenceType: "reference_type",
      estLu: "est_lu",
      dateCreation: "created_at",
    };

    for (const [key, value] of Object.entries(data)) {
      const mappedKey = mappings[key] || key;
      prismaData[mappedKey] = value;
    }
    return prismaData;
  }

  private mapUserRecord(
    user: {
      id: string;
      email: string;
      telephone: string;
      mot_de_passe_hash: string;
      prenom: string | null;
      nom: string | null;
      photo_profil_url: string | null;
      email_verifie: boolean | null;
      telephone_verifie: boolean | null;
      double_auth_active: boolean | null;
      statut_verification: string | null;
      created_at: Date | null;
      deleted_at: Date | null;
      type_utilisateur_id: string | null;
      type_utilisateur: { id: string; nom: string } | null;
    } | null,
  ): AdminUserRecord | null {
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      telephone: user.telephone,
      prenom: user.prenom,
      nom: user.nom,
      photoProfilUrl: user.photo_profil_url,
      emailVerifie: user.email_verifie,
      telephoneVerifie: user.telephone_verifie,
      doubleAuthActive: user.double_auth_active,
      statutVerification: user.statut_verification,
      createdAt: user.created_at,
      deletedAt: user.deleted_at,
      typeUtilisateurId: user.type_utilisateur_id,
      typeUtilisateur: user.type_utilisateur,
    };
  }

  private mapVehiculeRecord(
    vehicule: any,
  ): VehiculeRecord | null {
    if (!vehicule) return null;
    return {
      id: vehicule.id,
      proprietaireId: vehicule.proprietaire_id,
      marqueId: vehicule.marque_id,
      modeleId: vehicule.modele_id,
      carburantId: vehicule.carburant_id,
      boiteVitesseId: vehicule.boite_vitesse_id,
      statut: vehicule.statut,
      marque: vehicule.marque,
      modele: vehicule.modele,
      carburant: vehicule.carburant,
      boiteVitesse: vehicule.boite_vitesse,
      proprietaire: vehicule.utilisateur,
      photos: (vehicule.photo_vehicule || []).map((p: any) => ({ url: p.url })),
      anneeFabrication: vehicule.annee_fabrication,
      kilometrage: vehicule.kilometrage,
      couleur: vehicule.couleur,
      prixVente: vehicule.prix_vente,
      description: vehicule.description,
      numeroVin: vehicule.numero_vin,
      immatriculation: vehicule.immatriculation,
      prixNegociable: vehicule.prix_negociable,
      certifie: vehicule.certifie,
      estBoost: vehicule.est_boost,
      boostDebut: vehicule.boost_debut,
      boostFin: vehicule.boost_fin,
      vues: vehicule.vues,
      nombreFavoris: vehicule.nombre_favoris,
      titre: vehicule.titre,
      nombrePortes: vehicule.nombre_portes,
      nombrePlaces: vehicule.nombre_places,
      cylindree: vehicule.cylindree,
      puissanceFiscale: vehicule.puissance_fiscale,
      estGarantie: vehicule.est_garantie,
      garantieMois: vehicule.garantie_mois,
      createdAt: vehicule.created_at,
    };
  }

  private mapTransactionRecord(transaction: any): TransactionRecord | null {
    if (!transaction) return null;
    return {
      id: transaction.id,
      portefeuilleId: transaction.portefeuille_id,
      montant: transaction.montant,
      typeTransaction: transaction.type_transaction,
      statut: transaction.statut,
      description: transaction.description,
      referenceExterne: transaction.reference_externe,
      dateTransaction: transaction.date_transaction,
      createdAt: transaction.created_at,
      portefeuille: transaction.portefeuille,
    };
  }

  countUtilisateurs(): Promise<number> {
    return this.prisma.utilisateur.count();
  }

  countVehicules(): Promise<number> {
    return this.prisma.vehicule.count();
  }

  countVehiculesByStatut(statut: string): Promise<number> {
    return this.prisma.vehicule.count({ where: { statut } });
  }

  countReservations(): Promise<number> {
    return this.prisma.reservation_location.count();
  }

  countReservationsByStatut(statut: string): Promise<number> {
    return this.prisma.reservation_location.count({
      where: { statut: statut as StatutReservation },
    });
  }

  countTransactions(): Promise<number> {
    return this.prisma.transaction_portefeuille.count();
  }

  countTransactionsByStatut(statut: string): Promise<number> {
    return this.prisma.transaction_portefeuille.count({
      where: { statut: statut as StatutTransaction },
    });
  }

  countAbonnements(): Promise<number> {
    return this.prisma.abonnement.count();
  }

  countAbonnementsActifs(at: Date): Promise<number> {
    return this.prisma.utilisateur_abonnement.count({
      where: {
        statut: "ACTIF",
        date_fin: { gte: at },
      },
    });
  }

  countTradeInByStatut(statut: string[]): Promise<number> {
    return this.prisma.demande_trade_in.count({
      where: { statut: { in: statut as any } },
    });
  }

  findUsersPaged(
    page: number,
    size: number,
    sortBy: string,
    sortDir: "asc" | "desc",
  ) {
    const orderBy = { [this.userSortBy(sortBy)]: sortDir } as {
      created_at: "asc" | "desc";
      updated_at: "asc" | "desc";
      email: "asc" | "desc";
    };
    return Promise.all([
      this.prisma.utilisateur.findMany({
        skip: page * size,
        take: size,
        orderBy,
        include: { type_utilisateur: true },
      }),
      this.prisma.utilisateur.count(),
    ]).then(([items, total]) => ({
      items: items.map(
        (item) =>
          this.mapUserRecord(
            item as unknown as {
              id: string;
              email: string;
              telephone: string;
              mot_de_passe_hash: string;
              prenom: string | null;
              nom: string | null;
              photo_profil_url: string | null;
              email_verifie: boolean | null;
              telephone_verifie: boolean | null;
              double_auth_active: boolean | null;
              statut_verification: string | null;
              created_at: Date | null;
              deleted_at: Date | null;
              type_utilisateur_id: string | null;
              type_utilisateur: { id: string; nom: string } | null;
            },
          ) as AdminUserRecord,
      ),
      total,
    }));
  }

  findUserById(id: string): Promise<AdminUserRecord | null> {
    return this.prisma.utilisateur
      .findUnique({
        where: { id },
        include: { type_utilisateur: true },
      })
      .then((user) =>
        this.mapUserRecord(
          user as unknown as {
            id: string;
            email: string;
            telephone: string;
            mot_de_passe_hash: string;
            prenom: string | null;
            nom: string | null;
            photo_profil_url: string | null;
            email_verifie: boolean | null;
            telephone_verifie: boolean | null;
            double_auth_active: boolean | null;
            statut_verification: string | null;
            created_at: Date | null;
            deleted_at: Date | null;
            type_utilisateur_id: string | null;
            type_utilisateur: { id: string; nom: string } | null;
          },
        ),
      );
  }

  updateUser(id: string, data: Record<string, unknown>): Promise<AdminUserRecord> {
    const prismaData = this.toPrismaData(data);

    return this.prisma.utilisateur
      .update({
        where: { id },
        data: prismaData,
        include: { type_utilisateur: true },
      })
      .then(
        (user) =>
          this.mapUserRecord(
            user as unknown as {
              id: string;
              email: string;
              telephone: string;
              mot_de_passe_hash: string;
              prenom: string | null;
              nom: string | null;
              photo_profil_url: string | null;
              email_verifie: boolean | null;
              telephone_verifie: boolean | null;
              double_auth_active: boolean | null;
              statut_verification: string | null;
              created_at: Date | null;
              deleted_at: Date | null;
              type_utilisateur_id: string | null;
              type_utilisateur: { id: string; nom: string } | null;
            },
          ) as AdminUserRecord,
      );
  }

  findVehiculesPaged(
    page: number,
    size: number,
    sortBy: string,
    sortDir: "asc" | "desc",
  ) {
    const orderBy = { [this.vehiculeSortBy(sortBy)]: sortDir } as {
      created_at: "asc" | "desc";
      updated_at: "asc" | "desc";
      prix_vente: "asc" | "desc";
      vues: "asc" | "desc";
    };
    return Promise.all([
      this.prisma.vehicule.findMany({
        skip: page * size,
        take: size,
        where: { deleted_at: null },
        orderBy,
        include: {
          marque: true,
          modele: true,
          carburant: true,
          boite_vitesse: true,
          utilisateur: true,
          photo_vehicule: true,
        },
      }),
      this.prisma.vehicule.count({ where: { deleted_at: null } }),
    ]).then(([items, total]) => ({
      items: items.map(
        (item) =>
          this.mapVehiculeRecord(
            item as unknown as {
              id: string;
              proprietaire_id: string;
              marque_id: string | null;
              modele_id: string | null;
              carburant_id: string | null;
              boite_vitesse_id: string | null;
              statut: string;
              marque: { nom: string | null } | null;
              modele: { nom: string | null } | null;
              carburant: { nom: string | null } | null;
              boite_vitesse: { nom: string | null } | null;
              proprietaire: {
                id: string;
                nom: string | null;
                email: string;
                telephone: string;
              };
              photos: Array<{ url: string }>;
              annee_fabrication: number | null;
              kilometrage: number | null;
              couleur: string | null;
              prix_vente: unknown;
              description: string | null;
              numero_vin: string | null;
              immatriculation: string | null;
              prix_negociable: boolean | null;
              certifie: boolean | null;
              est_boost: boolean | null;
              boost_debut: Date | null;
              boost_fin: Date | null;
              vues: number | null;
              nombre_favoris: number | null;
              titre: string | null;
              nombre_portes: number | null;
              nombre_places: number | null;
              cylindree: string | null;
              puissance_fiscale: string | null;
              est_garantie: boolean | null;
              garantie_mois: number | null;
              created_at: Date | null;
            },
          ) as VehiculeRecord,
      ),
      total,
    }));
  }

  findVehiculeById(id: string): Promise<VehiculeRecord | null> {
    return this.prisma.vehicule
      .findUnique({
        where: { id },
        include: {
          marque: true,
          modele: true,
          carburant: true,
          boite_vitesse: true,
          utilisateur: true,
          photo_vehicule: true,
        },
      })
      .then((vehicule) =>
        this.mapVehiculeRecord(
          vehicule as unknown as {
            id: string;
            proprietaire_id: string;
            marque_id: string | null;
            modele_id: string | null;
            carburant_id: string | null;
            boite_vitesse_id: string | null;
            statut: string;
            marque: { nom: string | null } | null;
            modele: { nom: string | null } | null;
            carburant: { nom: string | null } | null;
            boite_vitesse: { nom: string | null } | null;
            proprietaire: {
              id: string;
              nom: string | null;
              email: string;
              telephone: string;
            };
            photos: Array<{ url: string }>;
            annee_fabrication: number | null;
            kilometrage: number | null;
            couleur: string | null;
            prix_vente: unknown;
            description: string | null;
            numero_vin: string | null;
            immatriculation: string | null;
            prix_negociable: boolean | null;
            certifie: boolean | null;
            est_boost: boolean | null;
            boost_debut: Date | null;
            boost_fin: Date | null;
            vues: number | null;
            nombre_favoris: number | null;
            titre: string | null;
            nombre_portes: number | null;
            nombre_places: number | null;
            cylindree: string | null;
            puissance_fiscale: string | null;
            est_garantie: boolean | null;
            garantie_mois: number | null;
            created_at: Date | null;
          },
        ),
      );
  }

  updateVehicule(id: string, data: Record<string, unknown>): Promise<VehiculeRecord> {
    const prismaData = this.toPrismaData(data);
    return this.prisma.vehicule
      .update({
        where: { id },
        data: prismaData,
        include: {
          marque: true,
          modele: true,
          carburant: true,
          boite_vitesse: true,
          utilisateur: true,
          photo_vehicule: true,
        },
      })
      .then((v) => this.mapVehiculeRecord(v) as VehiculeRecord);
  }

  deleteVehicule(id: string): Promise<{ id: string }> {
    return this.prisma.vehicule.delete({ where: { id } }).then((v) => ({ id: v.id }));
  }

  findTransactionsPaged(
    page: number,
    size: number,
    sortBy: string,
    sortDir: "asc" | "desc",
  ) {
    const orderBy = { [this.transactionSortBy(sortBy)]: sortDir } as {
      created_at: "asc" | "desc";
      date_transaction: "asc" | "desc";
    };
    return Promise.all([
      this.prisma.transaction_portefeuille.findMany({
        skip: page * size,
        take: size,
        orderBy,
        include: { portefeuille: { select: { utilisateur_id: true } } },
      }),
      this.prisma.transaction_portefeuille.count(),
    ]).then(([items, total]) => ({
      items: items.map(
        (item) =>
          this.mapTransactionRecord(
            item as unknown as {
              id: string;
              portefeuille_id: string;
              montant: unknown;
              type_transaction: string;
              statut: string;
              description: string | null;
              reference_externe: string | null;
              date_transaction: Date | null;
              created_at: Date | null;
              portefeuille: { utilisateur_id: string } | null;
            },
          ) as TransactionRecord,
      ),
      total,
    }));
  }

  findTransactionsByUtilisateurId(
    utilisateurId: string,
  ): Promise<TransactionRecord[]> {
    return this.prisma.transaction_portefeuille
      .findMany({
        where: { portefeuille: { utilisateur_id: utilisateurId } },
        orderBy: { date_transaction: "desc" },
        include: { portefeuille: { select: { utilisateur_id: true } } },
      })
      .then((records) =>
        records.map(
          (item) =>
            this.mapTransactionRecord(
              item as unknown as {
                id: string;
                portefeuille_id: string;
                montant: unknown;
                type_transaction: string;
                statut: string;
                description: string | null;
                reference_externe: string | null;
                date_transaction: Date | null;
                created_at: Date | null;
                portefeuille: { utilisateur_id: string } | null;
              },
            ) as TransactionRecord,
        ),
      );
  }

  findTransactionById(id: string): Promise<TransactionRecord | null> {
    return this.prisma.transaction_portefeuille
      .findUnique({
        where: { id },
        include: { portefeuille: { select: { utilisateur_id: true } } },
      })
      .then((record) =>
        this.mapTransactionRecord(
          record as unknown as {
            id: string;
            portefeuille_id: string;
            montant: unknown;
            type_transaction: string;
            statut: string;
            description: string | null;
            reference_externe: string | null;
            date_transaction: Date | null;
            created_at: Date | null;
            portefeuille: { utilisateur_id: string } | null;
          },
        ),
      );
  }

  findTransactionsByStatut(statut: string): Promise<TransactionRecord[]> {
    return this.prisma.transaction_portefeuille
      .findMany({
        where: { statut: statut as StatutTransaction },
        include: { portefeuille: { select: { utilisateur_id: true } } },
      })
      .then((records) =>
        records.map((v) => this.mapTransactionRecord(v) as TransactionRecord),
      );
  }

  findTypeUtilisateurByNom(
    nom: string,
  ): Promise<{ id: string; nom: string } | null> {
    return this.prisma.type_utilisateur.findUnique({ where: { nom } });
  }

  createTransaction(data: {
    id: string;
    portefeuille: { connect: { id: string } };
    montant: number;
    typeTransaction: string;
    statut: string;
    description: string;
    dateTransaction: Date;
    createdAt: Date;
  }): Promise<TransactionRecord> {
    const prismaData = this.toPrismaData(data);
    return this.prisma.transaction_portefeuille
      .create({
        data: {
          id: prismaData.id,
          portefeuille_id: data.portefeuille.connect.id,
          montant: prismaData.montant,
          type_transaction: prismaData.type_transaction,
          statut: prismaData.statut,
          description: prismaData.description,
          date_transaction: prismaData.date_transaction,
          created_at: prismaData.created_at,
        },
        include: { portefeuille: { select: { utilisateur_id: true } } },
      })
      .then((v) => this.mapTransactionRecord(v) as TransactionRecord);
  }

  createNotification(data: {
    id: string;
    utilisateur: { connect: { id: string } };
    titre: string;
    message: string;
    type: string;
    estLu: boolean;
    dateCreation: Date;
    referenceType?: string;
    referenceId?: string;
  }): Promise<{ id: string }> {
    const prismaData = this.toPrismaData(data);
    return this.prisma.notification
      .create({
        data: {
          id: prismaData.id,
          utilisateur_id: data.utilisateur.connect.id,
          titre: prismaData.titre,
          message: prismaData.message,
          type: prismaData.type as TypeNotification,
          est_lu: prismaData.est_lu,
          created_at: prismaData.created_at,
          reference_type: prismaData.reference_type,
          reference_id: prismaData.reference_id,
        },
      })
      .then((n) => ({ id: n.id }));
  }

  findAllUsersIds(): Promise<Array<{ id: string }>> {
    return this.prisma.utilisateur.findMany({
      where: { deleted_at: null },
      select: { id: true },
    });
  }

  findUserByEmail(email: string): Promise<AdminUserRecord | null> {
    return this.prisma.utilisateur
      .findUnique({
        where: { email },
        include: { type_utilisateur: true },
      })
      .then((u) => this.mapUserRecord(u as any));
  }

  newId(): string {
    return randomUUID();
  }

  private userSortBy(sortBy: string): "created_at" | "updated_at" | "email" {
    if (sortBy === "updatedAt") return "updated_at";
    if (sortBy === "email") return "email";
    return "created_at";
  }

  private vehiculeSortBy(
    sortBy: string,
  ): "created_at" | "updated_at" | "prix_vente" | "vues" {
    if (sortBy === "updatedAt") return "updated_at";
    if (sortBy === "prixVente") return "prix_vente";
    if (sortBy === "vues") return "vues";
    return "created_at";
  }

  private transactionSortBy(sortBy: string): "created_at" | "date_transaction" {
    if (sortBy === "dateTransaction") return "date_transaction";
    return "created_at";
  }
}
