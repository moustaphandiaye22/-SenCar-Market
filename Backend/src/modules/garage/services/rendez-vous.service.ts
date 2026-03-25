import { Inject, Injectable } from '@nestjs/common';

import { DomainException } from '../../../common/exceptions/domain.exception';
import { AuthenticatedUser } from '../../../common/types/authenticated-user.type';
import { NotificationService } from '../../notification/notification.service';
import { CreateRendezVousRequestDto } from '../dto/create-rendez-vous-request.dto';
import { RendezVousResponseDto } from '../dto/rendez-vous-response.dto';
import { GARAGE_REPOSITORY_PORT, GarageRepositoryPort } from '../garage.repository.port';

import { GarageMapper } from './garage.mapper';

@Injectable()
export class RendezVousService {
  constructor(
    @Inject(GARAGE_REPOSITORY_PORT) private readonly repository: GarageRepositoryPort,
    private readonly mapper: GarageMapper,
    private readonly notificationService: NotificationService,
  ) {}

  async createRendezVous(request: CreateRendezVousRequestDto, user: AuthenticatedUser): Promise<RendezVousResponseDto> {
    const client = await this.repository.findUserByEmail(user.email);
    if (!client) throw new DomainException('Client non trouvé', 404, 'USER_NOT_FOUND');

    const garage = await this.repository.findGarageById(request.garageId);
    if (!garage) throw new DomainException('Garage non trouvé', 404, 'GARAGE_NOT_FOUND');

    const rendezVous = await this.repository.createRendezVous({
      id: this.repository.newId(),
      garage: { connect: { id: request.garageId } },
      client: { connect: { id: client.id } },
      ...(request.serviceId ? { service: { connect: { id: request.serviceId } } } : {}),
      date_rendez_vous: new Date(request.dateRendezVous),
      statut: 'EN_ATTENTE',
      commentaire: request.commentaire,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Notifications
    const dateStr = rendezVous.date_rendez_vous.toLocaleDateString('fr-FR');
    const timeStr = rendezVous.date_rendez_vous.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Au Client
    await this.notificationService.createNotification({
      utilisateurId: client.id,
      titre: 'Demande de rendez-vous envoyée',
      message: `Votre demande de rendez-vous au garage ${garage.nom} pour le ${dateStr} à ${timeStr} a été envoyée.`,
      type: 'RENDEZ_VOUS_GARAGE',
      entiteId: rendezVous.id,
      entiteType: 'RENDEZ_VOUS_SERVICE',
    });

    // Au Propriétaire du garage
    if (garage.utilisateur_id) {
       await this.notificationService.createNotification({
        utilisateurId: garage.utilisateur_id,
        titre: 'Nouveau rendez-vous demandé',
        message: `Un nouveau rendez-vous a été demandé par ${client.prenom || ''} ${client.nom || ''} pour le ${dateStr} à ${timeStr}.`,
        type: 'RENDEZ_VOUS_GARAGE',
        entiteId: rendezVous.id,
        entiteType: 'RENDEZ_VOUS_SERVICE',
      });
    }

    return this.mapper.toRendezVousResponse(rendezVous);
  }

  async getRendezVousByClient(user: AuthenticatedUser): Promise<RendezVousResponseDto[]> {
    const client = await this.repository.findUserByEmail(user.email);
    if (!client) throw new DomainException('Client non trouvé', 404, 'USER_NOT_FOUND');
    const items = await this.repository.findRendezVousByClient(client.id);
    return items.map(item => this.mapper.toRendezVousResponse(item));
  }

  async getRendezVousByGarage(garageId: string): Promise<RendezVousResponseDto[]> {
    const items = await this.repository.findRendezVousByGarage(garageId);
    return items.map(item => this.mapper.toRendezVousResponse(item));
  }

  async updateStatut(id: string, statut: string): Promise<RendezVousResponseDto> {
    const updated = await this.repository.updateRendezVousStatut(id, statut);
    
    // Notification au client du changement de statut
    await this.notificationService.createNotification({
      utilisateurId: updated.client_id,
      titre: `Mise à jour de votre rendez-vous`,
      message: `Le statut de votre rendez-vous au garage ${updated.garage.nom} pour le ${updated.date_rendez_vous.toLocaleDateString()} a été mis à jour : ${statut}.`,
      type: statut === 'CONFIRME' ? 'RENDEZ_VOUS_CONFIRME' : 'RENDEZ_VOUS_ANNULE',
      entiteId: updated.id,
      entiteType: 'RENDEZ_VOUS_SERVICE',
    });

    return this.mapper.toRendezVousResponse(updated);
  }
}
