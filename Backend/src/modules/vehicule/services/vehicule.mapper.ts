import { Injectable } from '@nestjs/common';

import { VehiculeResponseDto } from '../dto/vehicule-response.dto';
import { VehiculeRecord } from '../vehicule.models';

@Injectable()
export class VehiculeMapper {
  toVehiculeResponse(vehicule: VehiculeRecord, estFavori: boolean): VehiculeResponseDto {
    const marque = (vehicule.marque as { nom?: string | null } | null)?.nom ?? null;
    const marqueId = vehicule.marqueId;
    const modele = (vehicule.modele as { nom?: string | null } | null)?.nom ?? null;
    const modeleId = vehicule.modeleId;
    const carburant = (vehicule.carburant as { nom?: string | null } | null)?.nom ?? null;
    const carburantId = vehicule.carburantId;
    const boiteVitesse = (vehicule.boiteVitesse as { nom?: string | null } | null)?.nom ?? null;
    const boiteVitesseId = vehicule.boiteVitesseId;
    const proprietaire = vehicule.proprietaire as { id: string; nom?: string | null };
    const photos = ((vehicule.photos as Array<{ url: string }> | undefined) ?? []).map((p) => p.url);

    return {
      id: vehicule.id,
      marque,
      marqueId,
      modele,
      modeleId,
      anneeFabrication: vehicule.anneeFabrication,
      kilometrage: vehicule.kilometrage,
      carburant,
      carburantId,
      boiteVitesse,
      boiteVitesseId,
      couleur: vehicule.couleur,
      prixVente: vehicule.prixVente ? String(vehicule.prixVente) : null,
      description: vehicule.description,
      numeroVin: vehicule.numeroVin,
      immatriculation: vehicule.immatriculation,
      statut: vehicule.statut,
      prixNegociable: vehicule.prixNegociable,
      certifie: vehicule.certifie,
      titre: vehicule.titre,
      nombrePortes: vehicule.nombrePortes,
      nombrePlaces: vehicule.nombrePlaces,
      cylindree: vehicule.cylindree,
      puissanceFiscale: vehicule.puissanceFiscale,
      estGarantie: vehicule.estGarantie,
      garantieMois: vehicule.garantieMois,
      photosUrls: photos,
      estBoost: vehicule.estBoost,
      boostDebut: vehicule.boostDebut,
      boostFin: vehicule.boostFin,
      vues: vehicule.vues,
      nombreFavoris: vehicule.nombreFavoris,
      estFavori,
      proprietaireNom: proprietaire?.nom ?? null,
      proprietaireId: proprietaire.id,
      createdAt: vehicule.createdAt,
    };
  }
}
