import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import type { AssuranceRepositoryPort} from './assurance.repository.port';
import { ASSURANCE_REPOSITORY_PORT } from './assurance.repository.port';
import { AssuranceService } from './assurance.service';
import { AssuranceAccessPolicy } from './services/assurance-access.policy';
import { AssurancePricingService } from './services/assurance-pricing.service';
import { AssuranceMapper } from './services/assurance.mapper';
import { AssuranceOptionIdsValidator } from './validation/assurance-option-ids.validator';

describe('AssuranceService', () => {
  let service: AssuranceService;
  let repository: jest.Mocked<AssuranceRepositoryPort>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssuranceService,
        AssuranceOptionIdsValidator,
        AssuranceAccessPolicy,
        AssurancePricingService,
        AssuranceMapper,
        {
          provide: ASSURANCE_REPOSITORY_PORT,
          useValue: {
            findUserByEmail: jest.fn(),
            findUserById: jest.fn(),
            findVehiculeById: jest.fn(),
            createProduit: jest.fn(),
            findProduitById: jest.fn(),
            updateProduit: jest.fn(),
            findProduitsPaged: jest.fn(),
            findProduitsActifs: jest.fn(),
            createOption: jest.fn(),
            findOptionById: jest.fn(),
            updateOption: jest.fn(),
            findOptionsByProduitId: jest.fn(),
            findOptionsByIds: jest.fn(),
            createSouscription: jest.fn(),
            findSouscriptionById: jest.fn(),
            findSouscriptionsByUtilisateurId: jest.fn(),
            updateSouscription: jest.fn(),
            newId: jest.fn().mockReturnValue('00000000-0000-0000-0000-000000000001'),
          },
        },
      ],
    }).compile();

    service = module.get<AssuranceService>(AssuranceService);
    repository = module.get(ASSURANCE_REPOSITORY_PORT);
  });

  it('should reject product creation for unauthorized role', async () => {
    repository.findUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      nom: 'User',
      prenom: 'Test',
      typeUtilisateur: { nom: 'UTILISATEUR' },
    } as never);

    await expect(
      service.createProduitAssurance(
        {
          nom: 'RC Auto',
          prixBase: 12000,
          typeAssurance: 'RESPONSABILITE_CIVILE',
        },
        {
          userId: 'user-1',
          email: 'user@test.com',
          typeUtilisateur: 'UTILISATEUR',
        },
      ),
    ).rejects.toThrow('Accès refusé');
  });

  it('should reject options that do not belong to the selected product', async () => {
    repository.findProduitById.mockResolvedValue({
      id: 'product-1',
      nom: 'RC Auto',
      description: null,
      prix_base: 12000,
      type_assurance: 'RESPONSABILITE_CIVILE',
      duree_mois: 12,
      est_actif: true,
      created_at: new Date(),
      updated_at: new Date(),
      option_assurance: [],
    } as never);
    repository.findOptionsByIds.mockResolvedValue([
      {
        id: 'option-1',
        produit_assurance_id: 'product-2',
        nom: 'Bris de glace',
        description: null,
        prix_supplementaire: 3000,
        est_actif: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ] as never);

    await expect(service.calculatePrix('product-1', ['option-1'])).rejects.toThrow(
      "Une ou plusieurs options ne correspondent pas au produit d'assurance",
    );
  });

  it('should reject document upload with blank url', async () => {
    repository.findSouscriptionById.mockResolvedValue({
      id: 'subscription-1',
      utilisateurId: 'user-1',
      produitAssuranceId: 'product-1',
      vehiculeId: 'vehicule-1',
      statut: 'PAYEE',
      montantTotal: 10000,
      dateDebut: new Date(),
      dateFin: new Date(),
      numeroContrat: 'ASC-1',
      documentUrl: null,
      paiementId: 'payment-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      utilisateur: { id: 'user-1', nom: 'User' },
      produitAssurance: { id: 'product-1', nom: 'RC Auto' },
      vehicule: {
        id: 'vehicule-1',
        marque: { nom: 'Toyota' },
        modele: { nom: 'Yaris' },
      },
      optionsSelectionnees: [],
    } as never);

    await expect(service.uploadDocument('subscription-1', 'contrat', '   ')).rejects.toThrow(
      'URL du document requise',
    );
  });
});
