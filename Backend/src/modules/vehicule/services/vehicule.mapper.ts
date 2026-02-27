import { Injectable } from '@nestjs/common';

import { VehiculeResponseDto } from '../dto/vehicule-response.dto';
import { VehiculeRecord } from '../vehicule.models';

@Injectable()
export class VehiculeMapper {
  toVehiculeResponse(vehicule: VehiculeRecord, estFavori: boolean): VehiculeResponseDto {
    const marque = (vehicule.marque as { nom?: string | null } | null)?.nom ?? null;
    const modele = (vehicule.modele as { nom?: string | null } | null)?.nom ?? null;
    const carburant = (vehicule.carburant as { nom?: string | null } | null)?.nom ?? null;
    const boiteVitesse = (vehicule.boiteVitesse as { nom?: string | null } | null)?.nom ?? null;
    const proprietaire = vehicule.proprietaire as { id: string; nom?: string | null };
    const photos = ((vehicule.photos as Array<{ url: string }> | undefined) ?? []).map((p) => p.url);

    return {
      id: vehicule.id,
      marque,
      modele,
      anneeFabrication: vehicule.anneeFabrication,
      kilometrage: vehicule.kilometrage,
      carburant,
      boiteVitesse,
      couleur: vehicule.couleur,
      prixVente: vehicule.prixVente ? String(vehicule.prixVente) : null,
      description: vehicule.description,
      numeroVin: vehicule.numeroVin,
      immatriculation: vehicule.immatriculation,
      statut: vehicule.statut,
      prixNegociable: vehicule.prixNegociable,
      certifie: vehicule.certifie,
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
