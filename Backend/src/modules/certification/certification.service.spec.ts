import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { CloudinaryService } from '../cloudinary/cloudinary.service';

import type {
  CertificationRepositoryPort} from './certification.repository.port';
import {
  CERTIFICATION_REPOSITORY_PORT
} from './certification.repository.port';
import { CertificationService } from './certification.service';
import { CertificationDocumentService } from './services/certification-document.service';
import { CertificationSecurityService } from './services/certification-security.service';
import { CertificationWorkflowService } from './services/certification-workflow.service';
import { CertificationMapper } from './services/certification.mapper';
import { CertificationStatusValidator } from './validation/certification-status.validator';

describe('CertificationService', () => {
  let service: CertificationService;
  let repository: jest.Mocked<CertificationRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificationService,
        CertificationSecurityService,
        CertificationWorkflowService,
        CertificationDocumentService,
        CertificationMapper,
        CertificationStatusValidator,
        {
          provide: CloudinaryService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
        {
          provide: CERTIFICATION_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            findUserById: jest.fn(),
            findVehiculeById: jest.fn(),
            createDemande: jest.fn(),
            findDemandeById: jest.fn(),
            findDemandesByVehiculeId: jest.fn(),
            findDemandesPaged: jest.fn(),
            findDemandesByUtilisateurId: jest.fn(),
            updateDemande: jest.fn(),
            deleteDemande: jest.fn(),
            createInspection: jest.fn(),
            findInspectionById: jest.fn(),
            findInspectionsByInspecteurPaged: jest.fn(),
            updateInspection: jest.fn(),
            deleteInspection: jest.fn(),
            findRapportByInspectionId: jest.fn(),
            createRapport: jest.fn(),
            updateRapport: jest.fn(),
            newId: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
          },
        },
      ],
    }).compile();

    service = module.get<CertificationService>(CertificationService);
    repository = module.get(CERTIFICATION_REPOSITORY_PORT);
  });

  it('should reject listing demandes for non-admin role', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'u@test.com',
      nom: 'User',
      prenom: 'Test',
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);

    await expect(
      service.getAllDemandes(0, 10, {
        userId: 'user-1',
        email: 'u@test.com',
        typeUtilisateur: 'UTILISATEUR',
      }),
    ).rejects.toThrow('Accès refusé');
  });

  it('should reject report upload when file is missing', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'inspector-1',
      email: 'i@test.com',
      nom: 'Inspecteur',
      prenom: 'Test',
      type_utilisateur: { nom: 'EXPERT' },
    } as never);

    await expect(
      service.uploadRapportPdf(
        'inspection-1',
        undefined as never,
        {
          userId: 'inspector-1',
          email: 'i@test.com',
          typeUtilisateur: 'EXPERT',
        },
      ),
    ).rejects.toThrow('Fichier PDF requis');

    expect(repository.findInspectionById).not.toHaveBeenCalled();
  });

  it('should reject assigning non-inspector user as inspecteur', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'admin-1',
      email: 'admin@test.com',
      nom: 'Admin',
      prenom: 'Root',
      type_utilisateur: { nom: 'ADMIN' },
    } as never);
    repository.findDemandeById.mockResolvedValue({
      id: 'demande-1',
      utilisateur_id: 'user-1',
      vehicule_id: 'veh-1',
      statut: 'PAYEE',
      montant_paiement: 50000,
      paiement_id: 'pay-1',
      inspecteur_id: null,
      date_soumission: new Date(),
      date_traitement: null,
      date_inspection: null,
      motif_rejet: null,
      badge_certifie_url: null,
      created_at: new Date(),
      updated_at: new Date(),
      utilisateur_demande_certification_utilisateur_idToutilisateur: { id: 'user-1', nom: 'User' },
      vehicule: { id: 'veh-1', marque: { nom: 'Toyota' }, modele: { nom: 'Yaris' } },
      utilisateur_demande_certification_inspecteur_idToutilisateur: null,
    } as never);
    repository.findUserById.mockResolvedValue({
      id: 'user-2',
      email: 'user2@test.com',
      nom: 'User 2',
      prenom: 'Other',
      type_utilisateur: { nom: 'UTILISATEUR' },
    } as never);

    await expect(
      service.assignInspector('demande-1', 'user-2', {
        userId: 'admin-1',
        email: 'admin@test.com',
        typeUtilisateur: 'ADMIN',
      }),
    ).rejects.toThrow('Utilisateur inspecteur invalide');
  });

  it('should forbid inspecteur from reading another inspecteur inspection', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'inspecteur-1',
      email: 'i1@test.com',
      nom: 'Inspector 1',
      prenom: 'One',
      type_utilisateur: { nom: 'EXPERT' },
    } as never);
    repository.findInspectionById.mockResolvedValue({
      id: 'inspection-1',
      demande_certification_id: 'demande-1',
      inspecteur_id: 'inspecteur-2',
      date_inspection: new Date(),
      resultat: 'EN_COURS',
      commentaire: null,
      kilometrage: null,
      etat_moteur: null,
      etat_generateur: null,
      etat_freinage: null,
      etat_suspension: null,
      etat_transmission: null,
      etat_pneus: null,
      etat_carrosserie: null,
      etat_interieur: null,
      score_total: null,
      created_at: new Date(),
      updated_at: new Date(),
      demande_certification: { id: 'demande-1' },
      utilisateur: { id: 'inspecteur-2', nom: 'Inspector 2' },
    } as never);

    await expect(
      service.getInspectionById('inspection-1', {
        userId: 'inspecteur-1',
        email: 'i1@test.com',
        typeUtilisateur: 'EXPERT',
      }),
    ).rejects.toThrow('Accès refusé');
  });
});
