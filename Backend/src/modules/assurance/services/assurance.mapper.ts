import { Injectable } from '@nestjs/common';

import { toNullableNumber } from '../../../common/utils/number.util';
import { OptionRecord, ProduitRecord, SouscriptionRecord } from '../assurance.models';
import { OptionAssuranceResponseDto } from '../dto/option-assurance-response.dto';
import { ProduitAssuranceResponseDto } from '../dto/produit-assurance-response.dto';
import { SouscriptionAssuranceResponseDto } from '../dto/souscription-assurance-response.dto';

@Injectable()
export class AssuranceMapper {
  toProduitResponse(produit: ProduitRecord): ProduitAssuranceResponseDto {
    return {
      id: produit.id,
      nom: produit.nom,
      description: produit.description,
      prixBase: toNullableNumber(produit.prixBase) ?? 0,
      typeAssurance: produit.typeAssurance,
      dureeMois: produit.dureeMois,
      estActif: produit.estActif,
      options: produit.options.map((option) => this.toOptionResponse(option)),
      createdAt: produit.createdAt,
      updatedAt: produit.updatedAt,
    };
  }

  toOptionResponse(option: OptionRecord): OptionAssuranceResponseDto {
    return {
      id: option.id,
      nom: option.nom,
      description: option.description,
      prixSupplementaire: toNullableNumber(option.prixSupplementaire),
      produitAssuranceId: option.produitAssuranceId,
      estActif: option.estActif,
      createdAt: option.createdAt,
      updatedAt: option.updatedAt,
    };
  }

  toSouscriptionResponse(subscription: SouscriptionRecord): SouscriptionAssuranceResponseDto {
    const marque = subscription.vehicule.marque?.nom ?? '';
    const modele = subscription.vehicule.modele?.nom ?? '';

    return {
      id: subscription.id,
      utilisateurId: subscription.utilisateurId,
      utilisateurNom: subscription.utilisateur.nom,
      vehiculeId: subscription.vehiculeId,
      vehiculeDescription: `${marque} ${modele}`.trim() || null,
      produitAssuranceId: subscription.produitAssuranceId,
      produitAssuranceNom: subscription.produitAssurance.nom,
      optionsSelectionnees: subscription.optionsSelectionnees.map((item) => this.toOptionResponse(item.option)),
      montantTotal: toNullableNumber(subscription.montantTotal),
      statut: subscription.statut,
      dateDebut: subscription.dateDebut,
      dateFin: subscription.dateFin,
      numeroContrat: subscription.numeroContrat,
      documentUrl: subscription.documentUrl,
      paiementId: subscription.paiementId,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  toPricingPreview(
    produitId: string,
    produitNom: string,
    selectedOptions: OptionRecord[],
    montantTotal: number,
  ): SouscriptionAssuranceResponseDto {
    return {
      id: null,
      utilisateurId: null,
      utilisateurNom: null,
      vehiculeId: null,
      vehiculeDescription: null,
      produitAssuranceId: produitId,
      produitAssuranceNom: produitNom,
      optionsSelectionnees: selectedOptions.map((opt) => this.toOptionResponse(opt)),
      montantTotal,
      statut: null,
      dateDebut: null,
      dateFin: null,
      numeroContrat: null,
      documentUrl: null,
      paiementId: null,
      createdAt: null,
      updatedAt: null,
    };
  }
}
