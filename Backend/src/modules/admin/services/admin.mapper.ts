import { Injectable } from '@nestjs/common';

import { toNumberOrZero } from '../../../common/utils/number.util';
import { UtilisateurResponseDto } from '../../auth/dto/utilisateur-response.dto';
import { TransactionResponseDto } from '../../paiement/dto/transaction-response.dto';
import { VehiculeResponseDto } from '../../vehicule/dto/vehicule-response.dto';
import { AdminUserRecord, TransactionRecord, VehiculeRecord } from '../admin.models';

@Injectable()
export class AdminMapper {
  toUtilisateurResponse(user: AdminUserRecord): UtilisateurResponseDto {
    return {
      id: user.id,
      email: user.email,
      telephone: user.telephone,
      prenom: user.prenom,
      nom: user.nom,
      photoProfilUrl: user.photoProfilUrl,
      emailVerifie: user.emailVerifie,
      telephoneVerifie: user.telephoneVerifie,
      doubleAuthActive: user.doubleAuthActive,
      typeUtilisateur: user.typeUtilisateur?.nom ?? null,
      statutVerification: user.statutVerification,
      createdAt: user.createdAt,
    };
  }

  toVehiculeResponse(vehicule: VehiculeRecord): VehiculeResponseDto {
    return {
      id: vehicule.id,
      marque: vehicule.marque?.nom ?? null,
      marqueId: vehicule.marqueId,
      modele: vehicule.modele?.nom ?? null,
      modeleId: vehicule.modeleId,
      anneeFabrication: vehicule.anneeFabrication,
      kilometrage: vehicule.kilometrage,
      carburant: vehicule.carburant?.nom ?? null,
      carburantId: vehicule.carburantId,
      boiteVitesse: vehicule.boiteVitesse?.nom ?? null,
      boiteVitesseId: vehicule.boiteVitesseId,
      couleur: vehicule.couleur,
      prixVente: vehicule.prixVente != null ? String(vehicule.prixVente) : null,
      description: vehicule.description,
      numeroVin: vehicule.numeroVin,
      immatriculation: vehicule.immatriculation,
      statut: vehicule.statut,
      prixNegociable: vehicule.prixNegociable,
      certifie: vehicule.certifie,
      photosUrls: vehicule.photos.map((photo) => photo.url),
      estBoost: vehicule.estBoost,
      boostDebut: vehicule.boostDebut,
      boostFin: vehicule.boostFin,
      vues: vehicule.vues,
      nombreFavoris: vehicule.nombreFavoris,
      estFavori: false,
      proprietaireNom: vehicule.proprietaire?.nom ?? null,
      proprietaireId: vehicule.proprietaireId,
      createdAt: vehicule.createdAt,
    };
  }

  toTransactionResponse(transaction: TransactionRecord): TransactionResponseDto {
    return {
      id: transaction.id,
      portefeuilleId: transaction.portefeuilleId,
      montant: String(toNumberOrZero(transaction.montant)),
      typeTransaction:
        (transaction.typeTransaction as TransactionResponseDto['typeTransaction']) ?? 'CREDIT',
      statut: (transaction.statut as TransactionResponseDto['statut']) ?? 'EN_ATTENTE',
      description: transaction.description,
      referenceExterne: transaction.referenceExterne,
      dateTransaction: transaction.dateTransaction,
      createdAt: transaction.createdAt,
    };
  }
}
