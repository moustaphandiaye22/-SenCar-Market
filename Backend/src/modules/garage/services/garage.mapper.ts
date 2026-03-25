import { Injectable } from '@nestjs/common';

import { toNullableNumber } from '../../../common/utils/number.util';
import { GarageResponseDto } from '../dto/garage-response.dto';
import { GarageServiceResponseDto } from '../dto/garage-service-response.dto';
import { RendezVousResponseDto } from '../dto/rendez-vous-response.dto';
import { ServiceGarageResponseDto } from '../dto/service-garage-response.dto';
import { GarageRecord, GarageServiceAssociationRecord, ServiceGarageRecord, RendezVousServiceRecord } from '../garage.models';

@Injectable()
export class GarageMapper {
  toGarageResponse(garage: GarageRecord): GarageResponseDto {
    return {
      id: garage.id,
      nom: garage.nom,
      adresse: garage.adresse,
      telephone: garage.telephone,
      email: garage.email,
      description: garage.description,
      horairesOuverture: garage.horaires_ouverture,
      latitude: garage.latitude,
      longitude: garage.longitude,
      ville: garage.ville,
      pays: garage.pays,
      logoUrl: garage.logo_url,
      statutValidation: garage.statut_validation,
      commentaireAdmin: garage.commentaire_admin,
      dateValidation: garage.date_validation,
      proprietaireId: garage.utilisateur?.id ?? garage.utilisateur_id ?? '',
      proprietaireNom: garage.utilisateur?.nom ?? null,
      createdAt: garage.created_at,
      updatedAt: garage.updated_at,
      noteMoyenne: null,
      nombreAvis: null,
    };
  }

  toServiceResponse(service: ServiceGarageRecord): ServiceGarageResponseDto {
    return {
      id: service.id,
      nom: service.nom,
      description: service.description,
      prix: toNullableNumber(service.prix),
      dureeEstimee: service.duree_estimee,
      categorie: service.categorie,
      actif: service.actif,
      createdAt: service.created_at,
      updatedAt: service.updated_at,
    };
  }

  toAssociationResponse(association: GarageServiceAssociationRecord): GarageServiceResponseDto {
    return {
      id: association.id,
      garageId: association.garage_id,
      garageNom: association.garage.nom,
      serviceId: association.service_id,
      serviceNom: association.service_garage.nom,
      prix: toNullableNumber(association.prix),
      dureeEstimee: association.duree_estimee,
      actif: association.actif,
      createdAt: association.created_at,
      updatedAt: association.updated_at,
    };
  }

  toRendezVousResponse(record: RendezVousServiceRecord): RendezVousResponseDto {
    return {
      id: record.id,
      garageId: record.garage_id,
      clientId: record.client_id,
      serviceId: record.service_id ?? undefined,
      dateRendezVous: record.date_rendez_vous,
      statut: record.statut ?? 'EN_ATTENTE',
      commentaire: record.commentaire ?? undefined,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      garageNom: record.garage.nom,
      clientNom: record.client.prenom ? `${record.client.prenom} ${record.client.nom}` : (record.client.nom ?? 'Utilisateur'),
      serviceNom: record.service?.nom ?? undefined,
    };
  }
}
