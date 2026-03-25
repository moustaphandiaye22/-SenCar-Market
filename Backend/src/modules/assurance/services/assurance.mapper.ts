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
      description: produit.description ?? null,
      prixBase: toNullableNumber(produit.prix_base) ?? 0,
      typeAssurance: (produit.type_assurance as any) ?? 'TIERS',
      dureeMois: produit.duree_mois ?? null,
      estActif: produit.est_actif ?? false,
      options: (produit.option_assurance ?? []).map((option) => this.toOptionResponse(option)),
      createdAt: produit.created_at ?? null,
      updatedAt: produit.updated_at ?? null,
    };
  }

  toOptionResponse(option: OptionRecord): OptionAssuranceResponseDto {
    return {
      id: option.id,
      nom: option.nom,
      description: option.description ?? null,
      prixSupplementaire: toNullableNumber(option.prix_supplementaire) ?? 0,
      produitAssuranceId: option.produit_assurance_id,
      estActif: option.est_actif ?? false,
      createdAt: option.created_at ?? null,
      updatedAt: option.updated_at ?? null,
    };
  }

  toSouscriptionResponse(subscription: SouscriptionRecord): SouscriptionAssuranceResponseDto {
    const marque = subscription.vehicule.marque?.nom ?? '';
    const modele = subscription.vehicule.modele?.nom ?? '';

    return {
      id: subscription.id,
      utilisateurId: subscription.utilisateur_id,
      utilisateurNom: subscription.utilisateur?.nom ?? null,
      vehiculeId: subscription.vehicule_id,
      vehiculeDescription: `${marque} ${modele}`.trim() || null,
      produitAssuranceId: subscription.produit_assurance_id,
      produitAssuranceNom: subscription.produit_assurance?.nom ?? null,
      optionsSelectionnees: (subscription.souscription_options ?? []).map((item) => this.toOptionResponse(item.option_assurance)),
      montantTotal: toNullableNumber(subscription.montant_total) ?? 0,
      statut: (subscription.statut as any) ?? 'EN_ATTENTE',
      dateDebut: subscription.date_debut ?? null,
      dateFin: subscription.date_fin ?? null,
      numeroContrat: subscription.numero_contrat ?? null,
      documentUrl: subscription.document_url ?? null,
      paiementId: subscription.paiement_id ?? null,
      createdAt: subscription.created_at ?? null,
      updatedAt: subscription.updated_at ?? null,
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
