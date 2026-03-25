import { Injectable } from '@nestjs/common';

import { VehiculeResponseDto } from '../dto/vehicule-response.dto';
import { VehiculeRecord } from '../vehicule.models';

@Injectable()
export class VehiculeMapper {
  toVehiculeResponse(vehicule: VehiculeRecord, estFavori: boolean): VehiculeResponseDto {
    const marque = (vehicule.marque as { nom?: string | null } | null)?.nom ?? null;
    const marqueId = vehicule.marque_id;
    const modele = (vehicule.modele as { nom?: string | null } | null)?.nom ?? null;
    const modeleId = vehicule.modele_id;
    const carburant = (vehicule.carburant as { nom?: string | null } | null)?.nom ?? null;
    const carburantId = vehicule.carburant_id;
    const boiteVitesse = (vehicule.boite_vitesse as { nom?: string | null } | null)?.nom ?? null;
    const boiteVitesseId = vehicule.boite_vitesse_id;
    const proprietaire = vehicule.utilisateur;
    const photos = ((vehicule.photo_vehicule as Array<{ url: string }> | undefined) ?? []).map(
      (p) => p.url,
    );

    return {
      id: vehicule.id,
      marque,
      marqueId,
      modele,
      modeleId,
      anneeFabrication: vehicule.annee_fabrication,
      kilometrage: vehicule.kilometrage,
      carburant,
      carburantId,
      boiteVitesse,
      boiteVitesseId,
      couleur: vehicule.couleur,
      prixVente: vehicule.prix_vente ? String(vehicule.prix_vente) : null,
      description: vehicule.description,
      numeroVin: vehicule.numero_vin,
      immatriculation: vehicule.immatriculation,
      statut: vehicule.statut,
      prixNegociable: vehicule.prix_negociable,
      certifie: vehicule.certifie,
      titre: vehicule.titre,
      nombrePortes: vehicule.nombre_portes,
      nombrePlaces: vehicule.nombre_places,
      cylindree: vehicule.cylindree,
      puissanceFiscale: vehicule.puissance_fiscale,
      estGarantie: vehicule.est_garantie,
      garantieMois: vehicule.garantie_mois,
      photosUrls: photos,
      estBoost: vehicule.est_boost,
      boostDebut: vehicule.boost_debut,
      boostFin: vehicule.boost_fin,
      vues: vehicule.vues,
      nombreFavoris: vehicule.nombre_favoris,
      estFavori,
      proprietaireNom: proprietaire?.nom ?? null,
      proprietaireId: vehicule.proprietaire_id,
      proprietaireTelephone: proprietaire?.telephone ?? null,
      proprietaireEmail: proprietaire?.email ?? null,
      createdAt: vehicule.created_at,
    };
  }
}
