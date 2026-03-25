import { Inject, Injectable } from '@nestjs/common';

import {
  ROLE_EXPERT,
  ROLES_ADMIN_MODERATION,
  ROLES_INSPECTION,
} from '../../common/constants/role-groups';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { DomainException } from '../../common/exceptions/domain.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { buildPaginatedResponse, clampPage, clampSize } from '../../common/utils/pagination.util';

import {
  DemandeRecord,
  UserRecord,
} from './certification.models';
import {
  CERTIFICATION_REPOSITORY_PORT,
  CertificationRepositoryPort,
} from './certification.repository.port';
import { CreateDemandeCertificationRequestDto } from './dto/create-demande-certification-request.dto';
import { CreateInspectionRequestDto } from './dto/create-inspection-request.dto';
import { CreateRapportInspectionRequestDto } from './dto/create-rapport-inspection-request.dto';
import { DemandeCertificationResponseDto } from './dto/demande-certification-response.dto';
import { InspectionResponseDto } from './dto/inspection-response.dto';
import { RapportInspectionResponseDto } from './dto/rapport-inspection-response.dto';
import { CertificationDocumentService } from './services/certification-document.service';
import { CertificationSecurityService } from './services/certification-security.service';
import { CertificationWorkflowService } from './services/certification-workflow.service';
import { CertificationMapper } from './services/certification.mapper';
import { RESULTAT_INSPECTION_VALUES, STATUT_DEMANDE_CERTIFICATION_VALUES, StatutDemandeCertification } from './types/certification.types';
import { CertificationStatusValidator } from './validation/certification-status.validator';

type UploadedFileLike = { originalname?: string; buffer: Buffer };

@Injectable()
export class CertificationService {
  private readonly montantInspection = 50000;

  constructor(
    @Inject(CERTIFICATION_REPOSITORY_PORT) private readonly repository: CertificationRepositoryPort,
    private readonly securityService: CertificationSecurityService,
    private readonly workflowService: CertificationWorkflowService,
    private readonly documentService: CertificationDocumentService,
    private readonly inputValidator: CertificationStatusValidator,
    private readonly mapper: CertificationMapper,
  ) {}

  async createDemandeCertification(
    request: CreateDemandeCertificationRequestDto,
    user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    const vehicule = await this.repository.findVehiculeById(request.vehiculeId);
    if (!vehicule) {
      throw new DomainException('Véhicule non trouvé', 404, 'VEHICULE_NOT_FOUND');
    }

    const existing = await this.repository.findDemandesByVehiculeId(request.vehiculeId);
    const hasActive = existing.some((d) => d.statut !== 'CERTIFIEE' && d.statut !== 'REJETEE');
    if (hasActive) {
      throw new DomainException('Une demande active existe déjà pour ce véhicule', 400, 'CERTIFICATION_REQUEST_ALREADY_ACTIVE');
    }

    const now = new Date();
    const created = await this.repository.createDemande({
      id: this.repository.newId(),
      utilisateur: { connect: { id: current.id } },
      vehicule: { connect: { id: request.vehiculeId } },
      statut: 'EN_ATTENTE',
      montant_paiement: this.montantInspection,
      date_soumission: now,
      created_at: now,
      updated_at: now,
    });

    return this.mapper.toDemandeResponse(created);
  }

  async processPayment(demandeId: string, paiementId: string, user: AuthenticatedUser): Promise<DemandeCertificationResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    const demande = await this.requireDemande(demandeId);
    this.securityService.ensureOwnerOrAdmin(current, demande.utilisateur_id);

    if (demande.statut !== 'EN_ATTENTE') {
      throw new DomainException('Paiement impossible dans cet état', 400, 'CERTIFICATION_PAYMENT_INVALID_STATE');
    }

    const updated = await this.repository.updateDemande(demandeId, {
      paiement_id: paiementId,
      statut: 'PAYEE',
      date_traitement: new Date(),
      updated_at: new Date(),
    });

    return this.mapper.toDemandeResponse(updated);
  }

  async assignInspector(demandeId: string, inspecteurId: string, user: AuthenticatedUser): Promise<DemandeCertificationResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureRole(current.type_utilisateur?.nom, ROLES_ADMIN_MODERATION);

    const [demande, inspecteur] = await Promise.all([
      this.requireDemande(demandeId),
      this.repository.findUserById(inspecteurId),
    ]);

    if (!inspecteur) {
      throw new DomainException('Inspecteur non trouvé', 404, 'INSPECTOR_NOT_FOUND');
    }
    if (inspecteur.type_utilisateur?.nom !== ROLE_EXPERT) {
      throw new DomainException('Utilisateur inspecteur invalide', 400, 'CERTIFICATION_INVALID_INSPECTOR_ROLE');
    }
    if (demande.statut !== 'PAYEE') {
      throw new DomainException('Attribution inspecteur requiert une demande PAYEE', 400, 'CERTIFICATION_ASSIGN_INSPECTOR_REQUIRES_PAID');
    }

    const updated = await this.repository.updateDemande(demandeId, {
      utilisateur_demande_certification_inspecteur_idToutilisateur: { connect: { id: inspecteurId } },
      statut: 'INSPECTION_PROGRAMMEE',
      updated_at: new Date(),
    });

    return this.mapper.toDemandeResponse(updated);
  }

  async updateStatut(
    demandeId: string,
    statut: StatutDemandeCertification,
    user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureRole(current.type_utilisateur?.nom, ROLES_ADMIN_MODERATION);

    const demande = await this.requireDemande(demandeId);
    this.workflowService.validateTransition(demande.statut as StatutDemandeCertification, statut);

    const updated = await this.repository.updateDemande(demandeId, {
      statut,
      ...(statut === 'REJETEE' ? { date_traitement: new Date() } : {}),
      updated_at: new Date(),
    });

    return this.mapper.toDemandeResponse(updated);
  }

  async updateStatutFromRaw(
    demandeId: string,
    rawStatut: string,
    user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    const statut = this.inputValidator.parseStatus(rawStatut);
    return this.updateStatut(demandeId, statut, user);
  }

  async updateDemandeCertification(
    id: string,
    _request: CreateDemandeCertificationRequestDto,
    user: AuthenticatedUser,
  ): Promise<DemandeCertificationResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    const demande = await this.requireDemande(id);
    this.securityService.ensureOwnerOrAdmin(current, demande.utilisateur_id);

    if (demande.statut !== 'EN_ATTENTE') {
      throw new DomainException('Seule une demande EN_ATTENTE peut être modifiée', 400, 'CERTIFICATION_ONLY_PENDING_UPDATE');
    }

    const updated = await this.repository.updateDemande(id, { updated_at: new Date() });
    return this.mapper.toDemandeResponse(updated);
  }

  async deleteDemandeCertification(id: string, user: AuthenticatedUser): Promise<void> {
    const current = await this.requireCurrentUser(user.email);
    const demande = await this.requireDemande(id);
    this.securityService.ensureOwnerOrAdmin(current, demande.utilisateur_id);

    if (demande.statut === 'CERTIFIEE') {
      throw new DomainException('Impossible de supprimer une demande certifiée', 400, 'CERTIFICATION_CANNOT_DELETE_CERTIFIED');
    }

    await this.repository.deleteDemande(id);
  }

  async createInspection(
    request: CreateInspectionRequestDto,
    demandeId: string,
    user: AuthenticatedUser,
  ): Promise<InspectionResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureRole(current.type_utilisateur?.nom, ROLES_INSPECTION);

    const demande = await this.requireDemande(demandeId);
    if (demande.statut !== 'INSPECTION_PROGRAMMEE') {
      throw new DomainException('La demande doit être INSPECTION_PROGRAMMEE', 400, 'CERTIFICATION_REQUIRES_SCHEDULED_INSPECTION');
    }
    if (!demande.inspecteur_id) {
      throw new DomainException('Aucun inspecteur attribué à cette demande', 400, 'CERTIFICATION_INSPECTOR_NOT_ASSIGNED');
    }
    this.securityService.ensureInspectionAccess(current, demande.inspecteur_id);

    const when = new Date(request.dateInspection);
    this.documentService.assertValidDate(when, 'CERTIFICATION_INVALID_INSPECTION_DATE');
    const now = new Date();
    const created = await this.repository.createInspection({
      id: this.repository.newId(),
      demande_certification: { connect: { id: demandeId } },
      utilisateur: { connect: { id: demande.inspecteur_id } },
      date_inspection: when,
      resultat: 'EN_COURS',
      ...(request.commentaire ? { commentaire: request.commentaire } : {}),
      ...(request.kilometrage != null ? { kilometrage: request.kilometrage } : {}),
      ...(request.etatMoteur ? { etat_moteur: request.etatMoteur } : {}),
      ...(request.etatGenerateur ? { etat_generateur: request.etatGenerateur } : {}),
      ...(request.etatFreinage ? { etat_freinage: request.etatFreinage } : {}),
      ...(request.etatSuspension ? { etat_suspension: request.etatSuspension } : {}),
      ...(request.etatTransmission ? { etat_transmission: request.etatTransmission } : {}),
      ...(request.etatPneus ? { etat_pneus: request.etatPneus } : {}),
      ...(request.etatCarrosserie ? { etat_carrosserie: request.etatCarrosserie } : {}),
      ...(request.etatInterieur ? { etat_interieur: request.etatInterieur } : {}),
      created_at: now,
      updated_at: now,
    });

    await this.repository.updateDemande(demandeId, {
      statut: 'INSPECTE',
      date_inspection: when,
      updated_at: new Date(),
    });

    return this.mapper.toInspectionResponse(created);
  }

  async getInspectionById(id: string, user: AuthenticatedUser): Promise<InspectionResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureRole(current.type_utilisateur?.nom, ROLES_INSPECTION);

    const inspection = await this.repository.findInspectionById(id);
    if (!inspection) {
      throw new DomainException('Inspection non trouvée', 404, 'CERTIFICATION_INSPECTION_NOT_FOUND');
    }
    this.securityService.ensureInspectionAccess(current, inspection.inspecteur_id);
    return this.mapper.toInspectionResponse(inspection);
  }

  async getInspectionsByInspecteur(
    inspecteurId: string,
    page: number,
    size: number,
    user: AuthenticatedUser,
  ): Promise<PaginatedResponseDto<InspectionResponseDto>> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureRole(current.type_utilisateur?.nom, ROLES_INSPECTION);
    this.securityService.ensureInspectionAccess(current, inspecteurId);

    const safePage = clampPage(page);
    const safeSize = clampSize(size, 10);
    const { items, total } = await this.repository.findInspectionsByInspecteurPaged(inspecteurId, safePage, safeSize);
    return buildPaginatedResponse(
      items.map((item) => this.mapper.toInspectionResponse(item)),
      safePage,
      safeSize,
      total,
    );
  }

  async updateInspection(id: string, request: CreateInspectionRequestDto, user: AuthenticatedUser): Promise<InspectionResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureRole(current.type_utilisateur?.nom, ROLES_INSPECTION);

    const inspection = await this.repository.findInspectionById(id);
    if (!inspection) {
      throw new DomainException('Inspection non trouvée', 404, 'CERTIFICATION_INSPECTION_NOT_FOUND');
    }
    this.securityService.ensureInspectionAccess(current, inspection.inspecteur_id);

    if (inspection.resultat === 'REUSSI' || inspection.resultat === 'ECHEC') {
      throw new DomainException('Impossible de modifier une inspection terminée', 400, 'CERTIFICATION_CANNOT_UPDATE_FINISHED_INSPECTION');
    }
    const newInspectionDate = new Date(request.dateInspection);
    this.documentService.assertValidDate(newInspectionDate, 'CERTIFICATION_INVALID_INSPECTION_DATE');

    const updated = await this.repository.updateInspection(id, {
      date_inspection: newInspectionDate,
      ...(request.kilometrage != null ? { kilometrage: request.kilometrage } : {}),
      ...(request.etatMoteur ? { etatMoteur: request.etatMoteur } : {}),
      ...(request.etatGenerateur ? { etatGenerateur: request.etatGenerateur } : {}),
      ...(request.etatFreinage ? { etatFreinage: request.etatFreinage } : {}),
      ...(request.etatSuspension ? { etatSuspension: request.etatSuspension } : {}),
      ...(request.etatTransmission ? { etatTransmission: request.etatTransmission } : {}),
      ...(request.etatPneus ? { etatPneus: request.etatPneus } : {}),
      ...(request.etatCarrosserie ? { etat_carrosserie: request.etatCarrosserie } : {}),
      ...(request.etatInterieur ? { etat_interieur: request.etatInterieur } : {}),
      updated_at: new Date(),
    });

    return this.mapper.toInspectionResponse(updated);
  }

  async deleteInspection(id: string, user: AuthenticatedUser): Promise<void> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureRole(current.type_utilisateur?.nom, ROLES_ADMIN_MODERATION);

    const inspection = await this.repository.findInspectionById(id);
    if (!inspection) {
      throw new DomainException('Inspection non trouvée', 404, 'CERTIFICATION_INSPECTION_NOT_FOUND');
    }

    await this.repository.deleteInspection(id);
  }

  async uploadRapportPdf(inspectionId: string, file: UploadedFileLike, user: AuthenticatedUser): Promise<RapportInspectionResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureRole(current.type_utilisateur?.nom, ROLES_INSPECTION);
    if (!file?.buffer?.length) {
      throw new DomainException('Fichier PDF requis', 400, 'CERTIFICATION_REPORT_FILE_REQUIRED');
    }

    const inspection = await this.repository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new DomainException('Inspection non trouvée', 404, 'CERTIFICATION_INSPECTION_NOT_FOUND');
    }
    this.securityService.ensureInspectionAccess(current, inspection.inspecteur_id);

    const storedPath = await this.documentService.storePdf(file);
    const existing = await this.repository.findRapportByInspectionId(inspectionId);

    if (existing) {
      const updated = await this.repository.updateRapport(existing.id, {
        url_rapport_pdf: storedPath,
        date_generation: new Date(),
        updated_at: new Date(),
      });
      return this.mapper.toRapportResponse(updated);
    }

    const now = new Date();
    const created = await this.repository.createRapport({
      id: this.repository.newId(),
      inspection: { connect: { id: inspectionId } },
      url_rapport_pdf: storedPath,
      date_generation: now,
      created_at: now,
      updated_at: now,
    });
    return this.mapper.toRapportResponse(created);
  }

  async saveRapportResult(
    inspectionId: string,
    request: CreateRapportInspectionRequestDto,
    user: AuthenticatedUser,
  ): Promise<InspectionResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureRole(current.type_utilisateur?.nom, ROLES_INSPECTION);

    const inspection = await this.repository.findInspectionById(inspectionId);
    if (!inspection) {
      throw new DomainException('Inspection non trouvée', 404, 'CERTIFICATION_INSPECTION_NOT_FOUND');
    }
    this.securityService.ensureInspectionAccess(current, inspection.inspecteur_id);

    if (!RESULTAT_INSPECTION_VALUES.includes(request.resultat)) {
      throw new DomainException('Résultat inspection invalide', 400, 'CERTIFICATION_RESULT_INVALID');
    }

    const existing = await this.repository.findRapportByInspectionId(inspectionId);
    if (existing) {
      await this.repository.updateRapport(existing.id, {
        ...(request.scoreGlobale != null ? { score_globale: request.scoreGlobale } : {}),
        ...(request.recommendations ? { recommendations: request.recommendations } : {}),
        ...(request.conclusion ? { conclusion: request.conclusion } : {}),
        ...(request.estApprouve != null ? { est_approuve: request.estApprouve } : {}),
        date_generation: new Date(),
        updated_at: new Date(),
      });
    } else {
      const now = new Date();
      await this.repository.createRapport({
        id: this.repository.newId(),
        inspection: { connect: { id: inspectionId } },
        ...(request.scoreGlobale != null ? { score_globale: request.scoreGlobale } : {}),
        ...(request.recommendations ? { recommendations: request.recommendations } : {}),
        ...(request.conclusion ? { conclusion: request.conclusion } : {}),
        ...(request.estApprouve != null ? { est_approuve: request.estApprouve } : {}),
        date_generation: now,
        created_at: now,
        updated_at: now,
      });
    }

    const updatedInspection = await this.repository.updateInspection(inspectionId, {
      resultat: request.resultat,
      ...(request.conclusion ? { commentaire: request.conclusion } : {}),
      ...(request.scoreGlobale != null ? { score_total: request.scoreGlobale } : {}),
      updated_at: new Date(),
    });

    if (request.resultat === 'REUSSI') {
      await this.repository.updateDemande(inspection.demande_certification_id, {
        statut: 'CERTIFIEE',
        date_traitement: new Date(),
        updated_at: new Date(),
      });
    } else if (request.resultat === 'ECHEC') {
      await this.repository.updateDemande(inspection.demande_certification_id, {
        statut: 'REJETEE',
        ...(request.conclusion ? { motif_rejet: request.conclusion } : {}),
        date_traitement: new Date(),
        updated_at: new Date(),
      });
    } else {
      await this.repository.updateDemande(inspection.demande_certification_id, {
        statut: 'INSPECTE',
        date_traitement: new Date(),
        updated_at: new Date(),
      });
    }

    return this.mapper.toInspectionResponse(updatedInspection);
  }

  async generateBadge(demandeId: string, user: AuthenticatedUser): Promise<DemandeCertificationResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureRole(current.type_utilisateur?.nom, ROLES_ADMIN_MODERATION);

    const demande = await this.requireDemande(demandeId);
    if (demande.statut !== 'CERTIFIEE') {
      throw new DomainException('Le badge nécessite une demande CERTIFIEE', 400, 'CERTIFICATION_REQUIRES_CERTIFIED');
    }

    const badgeUrl = this.documentService.generateBadgeUrl(demandeId);
    const updated = await this.repository.updateDemande(demandeId, {
      badge_certifie_url: badgeUrl,
      updated_at: new Date(),
    });

    return this.mapper.toDemandeResponse(updated);
  }

  async getDemandeById(demandeId: string, user: AuthenticatedUser): Promise<DemandeCertificationResponseDto> {
    const current = await this.requireCurrentUser(user.email);
    const demande = await this.requireDemande(demandeId);
    this.securityService.ensureOwnerOrAdmin(current, demande.utilisateur_id);
    return this.mapper.toDemandeResponse(demande);
  }

  async getAllDemandes(page: number, size: number, user: AuthenticatedUser): Promise<PaginatedResponseDto<DemandeCertificationResponseDto>> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureRole(current.type_utilisateur?.nom, ROLES_ADMIN_MODERATION);

    const safePage = clampPage(page);
    const safeSize = clampSize(size, 10);
    const { items, total } = await this.repository.findDemandesPaged(safePage, safeSize);
    return buildPaginatedResponse(
      items.map((item) => this.mapper.toDemandeResponse(item)),
      safePage,
      safeSize,
      total,
    );
  }

  async getDemandesByUtilisateur(utilisateurId: string, user: AuthenticatedUser): Promise<DemandeCertificationResponseDto[]> {
    const current = await this.requireCurrentUser(user.email);
    this.securityService.ensureOwnerOrAdmin(current, utilisateurId);

    const demandes = await this.repository.findDemandesByUtilisateurId(utilisateurId);
    return demandes.map((demande) => this.mapper.toDemandeResponse(demande));
  }

  private async requireCurrentUser(email: string): Promise<UserRecord> {
    const current = await this.repository.findUserByEmail(email);
    if (!current) {
      throw new DomainException('Utilisateur non trouvé', 404, 'USER_NOT_FOUND');
    }
    return current;
  }

  private async requireDemande(demandeId: string): Promise<DemandeRecord> {
    const demande = await this.repository.findDemandeById(demandeId);
    if (!demande) {
      throw new DomainException('Demande certification non trouvée', 404, 'CERTIFICATION_REQUEST_NOT_FOUND');
    }
    if (!STATUT_DEMANDE_CERTIFICATION_VALUES.includes(demande.statut as (typeof STATUT_DEMANDE_CERTIFICATION_VALUES)[number])) {
      throw new DomainException('Statut demande certification invalide', 500, 'CERTIFICATION_STATUS_INVALID_STORED');
    }
    return demande;
  }

}
