import { Injectable } from '@nestjs/common';

import { toNullableNumber } from '../../../common/utils/number.util';
import { GarageResponseDto } from '../dto/garage-response.dto';
import { GarageServiceResponseDto } from '../dto/garage-service-response.dto';
import { ServiceGarageResponseDto } from '../dto/service-garage-response.dto';
import { GarageRecord, GarageServiceAssociationRecord, ServiceGarageRecord } from '../garage.models';

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
      horairesOuverture: garage.horairesOuverture,
      latitude: garage.latitude,
      longitude: garage.longitude,
      ville: garage.ville,
      pays: garage.pays,
      logoUrl: garage.logoUrl,
      statutValidation: garage.statutValidation,
      commentaireAdmin: garage.commentaireAdmin,
      dateValidation: garage.dateValidation,
      proprietaireId: garage.proprietaire?.id ?? garage.utilisateurId,
      proprietaireNom: garage.proprietaire?.nom ?? null,
      createdAt: garage.createdAt,
      updatedAt: garage.updatedAt,
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
      dureeEstimee: service.dureeEstimee,
      categorie: service.categorie,
      actif: service.actif,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }

  toAssociationResponse(association: GarageServiceAssociationRecord): GarageServiceResponseDto {
    return {
      id: association.id,
      garageId: association.garageId,
      garageNom: association.garage.nom,
      serviceId: association.serviceId,
      serviceNom: association.service.nom,
      prix: toNullableNumber(association.prix),
      dureeEstimee: association.dureeEstimee,
      actif: association.actif,
      createdAt: association.createdAt,
      updatedAt: association.updatedAt,
    };
  }
}
