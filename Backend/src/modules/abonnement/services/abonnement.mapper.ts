import { Injectable } from '@nestjs/common';

import {
  AbonnementRecord,
  BoostAnnonceRecord,
  UtilisateurAbonnementRecord,
} from '../abonnement.models';
import { AbonnementResponseDto } from '../dto/abonnement-response.dto';
import { BoostAnnonceResponseDto } from '../dto/boost-annonce-response.dto';
import { UtilisateurAbonnementResponseDto } from '../dto/utilisateur-abonnement-response.dto';
import { AbonnementInputValidator } from '../validation/abonnement-input.validator';

@Injectable()
export class AbonnementMapper {
  constructor(private readonly inputValidator: AbonnementInputValidator) {}

  toAbonnementResponse(item: AbonnementRecord): AbonnementResponseDto {
    return {
      id: item.id,
      nom: item.nom,
      description: item.description,
      prixMensuel: item.prixMensuel != null ? String(item.prixMensuel) : null,
      dureeJours: item.dureeJours,
      nombreAnnonces: item.nombreAnnonces,
      estVedette: item.estVedette,
      estCertifie: item.estCertifie,
      type: item.type,
    };
  }

  toUtilisateurAbonnementResponse(item: UtilisateurAbonnementRecord): UtilisateurAbonnementResponseDto {
    const totalAllowed = item.abonnement?.nombreAnnonces;
    const used = item.nombreAnnoncesUtilisees ?? 0;

    return {
      id: item.id,
      utilisateurId: item.utilisateurId,
      abonnementId: item.abonnementId,
      abonnementNom: item.abonnement?.nom ?? null,
      dateDebut: item.dateDebut,
      dateFin: item.dateFin,
      statut: this.inputValidator.parseStatutOrDefault(item.statut),
      nombreAnnoncesUtilisees: item.nombreAnnoncesUtilisees,
      nombreAnnoncesRestantes: totalAllowed != null ? Math.max(0, totalAllowed - used) : null,
    };
  }

  toBoostResponse(item: BoostAnnonceRecord): BoostAnnonceResponseDto {
    return {
      id: item.id,
      annonceLocationId: item.annonceLocationId,
      dateDebut: item.dateDebut,
      dateFin: item.dateFin,
      niveauBoost: item.niveauBoost,
    };
  }
}
