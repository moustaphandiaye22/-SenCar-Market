import { Inject, Injectable } from "@nestjs/common";

import { PaginatedResponseDto } from "../../common/dto/paginated-response.dto";
import { DomainException } from "../../common/exceptions/domain.exception";
import type { AuthenticatedUser } from "../../common/types/authenticated-user.type";
import { toNullableNumber } from "../../common/utils/number.util";
import {
  buildPaginatedResponse,
  clampPage,
  clampSize,
} from "../../common/utils/pagination.util";

import {
  OptionRecord,
  ProduitRecord,
  SouscriptionRecord,
  UserRecord,
} from "./assurance.models";
import {
  ASSURANCE_REPOSITORY_PORT,
  AssuranceRepositoryPort,
} from "./assurance.repository.port";
import { CreateOptionAssuranceRequestDto } from "./dto/create-option-assurance-request.dto";
import { CreateProduitAssuranceRequestDto } from "./dto/create-produit-assurance-request.dto";
import { CreateSouscriptionAssuranceRequestDto } from "./dto/create-souscription-assurance-request.dto";
import { OptionAssuranceResponseDto } from "./dto/option-assurance-response.dto";
import { ProduitAssuranceResponseDto } from "./dto/produit-assurance-response.dto";
import { SouscriptionAssuranceResponseDto } from "./dto/souscription-assurance-response.dto";
import { AssuranceAccessPolicy } from "./services/assurance-access.policy";
import { AssurancePricingService } from "./services/assurance-pricing.service";
import { AssuranceMapper } from "./services/assurance.mapper";
import {
  STATUT_ASSURANCE_VALUES,
  TYPE_ASSURANCE_VALUES,
} from "./types/assurance.types";
import { AssuranceOptionIdsValidator } from "./validation/assurance-option-ids.validator";

@Injectable()
export class AssuranceService {
  constructor(
    @Inject(ASSURANCE_REPOSITORY_PORT)
    private readonly repository: AssuranceRepositoryPort,
    private readonly inputValidator: AssuranceOptionIdsValidator,
    private readonly accessPolicy: AssuranceAccessPolicy,
    private readonly pricingService: AssurancePricingService,
    private readonly mapper: AssuranceMapper,
  ) {}

  async createProduitAssurance(
    request: CreateProduitAssuranceRequestDto,
    user: AuthenticatedUser,
  ): Promise<ProduitAssuranceResponseDto> {
    await this.ensureAssuranceManager(user);
    const now = new Date();

    const created = await this.repository.createProduit({
      id: this.repository.newId(),
      nom: request.nom,
      description: request.description ?? undefined,
      prix_base: request.prixBase,
      type_assurance: request.typeAssurance,
      duree_mois: request.dureeMois ?? undefined,
      est_actif: true,
      created_at: now,
      updated_at: now,
    });

    return this.mapper.toProduitResponse(created);
  }

  async getProduitAssuranceById(
    id: string,
  ): Promise<ProduitAssuranceResponseDto> {
    const produit = await this.requireProduit(id);
    return this.mapper.toProduitResponse(produit);
  }

  async getAllProduitAssurances(
    page: number,
    size: number,
  ): Promise<PaginatedResponseDto<ProduitAssuranceResponseDto>> {
    const safePage = clampPage(page);
    const safeSize = clampSize(size, 10);
    const { items, total } = await this.repository.findProduitsPaged(
      safePage,
      safeSize,
    );

    return buildPaginatedResponse(
      items.map((item) => this.mapper.toProduitResponse(item)),
      safePage,
      safeSize,
      total,
    );
  }

  async getActiveProduitAssurances(): Promise<ProduitAssuranceResponseDto[]> {
    const items = await this.repository.findProduitsActifs();
    return items.map((item) => this.mapper.toProduitResponse(item));
  }

  async updateProduitAssurance(
    id: string,
    request: CreateProduitAssuranceRequestDto,
    user: AuthenticatedUser,
  ): Promise<ProduitAssuranceResponseDto> {
    await this.ensureAssuranceManager(user);
    await this.requireProduit(id);

    const updated = await this.repository.updateProduit(id, {
      nom: request.nom,
      description: request.description,
      prix_base: request.prixBase,
      type_assurance: request.typeAssurance,
      duree_mois: request.dureeMois,
      updated_at: new Date(),
    });

    return this.mapper.toProduitResponse(updated);
  }

  async deleteProduitAssurance(
    id: string,
    user: AuthenticatedUser,
  ): Promise<void> {
    await this.ensureAssuranceManager(user);
    await this.requireProduit(id);
    await this.repository.updateProduit(id, {
      est_actif: false,
      updated_at: new Date(),
    });
  }

  async createOptionAssurance(
    request: CreateOptionAssuranceRequestDto,
    user: AuthenticatedUser,
  ): Promise<OptionAssuranceResponseDto> {
    await this.ensureAssuranceManager(user);
    await this.requireProduit(request.produitAssuranceId);

    const now = new Date();
    const created = await this.repository.createOption({
      id: this.repository.newId(),
      produit_assurance_id: request.produitAssuranceId,
      nom: request.nom,
      description: request.description ?? undefined,
      prix_supplementaire: request.prixSupplementaire,
      est_actif: true,
      created_at: now,
      updated_at: now,
    });

    return this.mapper.toOptionResponse(created);
  }

  async getOptionAssuranceById(
    id: string,
  ): Promise<OptionAssuranceResponseDto> {
    const option = await this.requireOption(id);
    return this.mapper.toOptionResponse(option);
  }

  async getOptionsByProduitAssurance(
    produitAssuranceId: string,
  ): Promise<OptionAssuranceResponseDto[]> {
    await this.requireProduit(produitAssuranceId);
    const options =
      await this.repository.findOptionsByProduitId(produitAssuranceId);
    return options.map((opt) => this.mapper.toOptionResponse(opt));
  }

  async updateOptionAssurance(
    id: string,
    request: CreateOptionAssuranceRequestDto,
    user: AuthenticatedUser,
  ): Promise<OptionAssuranceResponseDto> {
    await this.ensureAssuranceManager(user);
    const option = await this.requireOption(id);

    if (option.produit_assurance_id !== request.produitAssuranceId) {
      await this.requireProduit(request.produitAssuranceId);
    }

    const updated = await this.repository.updateOption(id, {
      produit_assurance_id: request.produitAssuranceId,
      nom: request.nom,
      description: request.description,
      prix_supplementaire: request.prixSupplementaire,
      updated_at: new Date(),
    });

    return this.mapper.toOptionResponse(updated);
  }

  async deleteOptionAssurance(
    id: string,
    user: AuthenticatedUser,
  ): Promise<void> {
    await this.ensureAssuranceManager(user);
    await this.requireOption(id);
    await this.repository.updateOption(id, {
      est_actif: false,
      updated_at: new Date(),
    });
  }

  async createSouscription(
    utilisateurId: string,
    request: CreateSouscriptionAssuranceRequestDto,
  ): Promise<SouscriptionAssuranceResponseDto> {
    const [utilisateur, vehicule, produit] = await Promise.all([
      this.repository.findUserById(utilisateurId),
      this.repository.findVehiculeById(request.vehiculeId),
      this.repository.findProduitById(request.produitAssuranceId),
    ]);

    this.assertFound(utilisateur, "Utilisateur non trouvé", "USER_NOT_FOUND");
    this.assertFound(vehicule, "Véhicule non trouvé", "VEHICULE_NOT_FOUND");

    if (!produit || !produit.est_actif) {
      throw new DomainException(
        "Produit assurance non trouvé",
        404,
        "ASSURANCE_PRODUCT_NOT_FOUND",
      );
    }

    const selectedOptions = await this.getSelectedOptions(
      request.optionIds ?? [],
      produit.id,
    );
    const montantTotal = this.pricingService.calculateTotalPrice(
      toNullableNumber(produit.prix_base) ?? 0,
      selectedOptions,
    );

    const now = new Date();
    const dateFin = this.pricingService.resolveDateFin(now, produit.duree_mois);

    const created = await this.repository.createSouscription({
      id: this.repository.newId(),
      utilisateur_id: utilisateurId,
      produit_assurance_id: request.produitAssuranceId,
      vehicule_id: request.vehiculeId,
      statut: "EN_ATTENTE",
      montant_total: montantTotal,
      date_debut: now,
      date_fin: dateFin,
      numero_contrat: this.pricingService.generateContractNumber(now),
      created_at: now,
      updated_at: now,
      optionsSelectionnees:
        selectedOptions.length > 0
          ? {
              create: selectedOptions.map((opt) => ({ option_id: opt.id })),
            }
          : undefined,
    });

    return this.mapper.toSouscriptionResponse(created);
  }

  async getSouscriptionById(
    id: string,
  ): Promise<SouscriptionAssuranceResponseDto> {
    const souscription = await this.requireSouscription(id);
    return this.mapper.toSouscriptionResponse(souscription);
  }

  async getSouscriptionsByUtilisateur(
    utilisateurId: string,
  ): Promise<SouscriptionAssuranceResponseDto[]> {
    const souscriptions =
      await this.repository.findSouscriptionsByUtilisateurId(utilisateurId);
    return souscriptions.map((item) =>
      this.mapper.toSouscriptionResponse(item),
    );
  }

  async calculatePrix(
    produitAssuranceId: string,
    optionIds?: string[],
  ): Promise<SouscriptionAssuranceResponseDto> {
    const produit = await this.repository.findProduitById(produitAssuranceId);
    if (!produit || !produit.est_actif) {
      throw new DomainException(
        "Produit assurance non trouvé",
        404,
        "ASSURANCE_PRODUCT_NOT_FOUND",
      );
    }

    const selectedOptions = await this.getSelectedOptions(
      optionIds ?? [],
      produit.id,
    );
    const montantTotal = this.pricingService.calculateTotalPrice(
      toNullableNumber(produit.prix_base) ?? 0,
      selectedOptions,
    );

    return this.mapper.toPricingPreview(
      produit.id,
      produit.nom,
      selectedOptions,
      montantTotal,
    );
  }

  async calculatePrixFromQuery(
    produitAssuranceId: string,
    optionIds?: string | string[],
  ): Promise<SouscriptionAssuranceResponseDto> {
    const normalizedOptionIds =
      this.inputValidator.normalizeOptionIds(optionIds);
    return this.calculatePrix(produitAssuranceId, normalizedOptionIds);
  }

  async processPayment(
    subscriptionId: string,
    paiementId: string,
  ): Promise<SouscriptionAssuranceResponseDto> {
    const subscription = await this.requireSouscription(subscriptionId);

    if (subscription.statut !== "EN_ATTENTE") {
      throw new DomainException(
        `Paiement impossible pour une souscription avec statut ${subscription.statut}`,
        400,
        "ASSURANCE_PAYMENT_PROCESS_INVALID",
      );
    }

    // Verify the payment exists and is CONFIRME
    const payment = await this.repository.findPaiementById(paiementId);
    if (!payment) {
      throw new DomainException(
        "Paiement non trouvé",
        404,
        "PAYMENT_NOT_FOUND",
      );
    }

    if (payment.statut !== "CONFIRME") {
      throw new DomainException(
        "Le paiement doit être confirmé pour activate l'assurance",
        400,
        "PAYMENT_NOT_CONFIRMED",
      );
    }

    const updated = await this.repository.updateSouscription(subscriptionId, {
      paiement_id: paiementId,
      statut: "PAYEE",
      updated_at: new Date(),
    });

    return this.mapper.toSouscriptionResponse(updated);
  }

  async generateContract(
    subscriptionId: string,
  ): Promise<SouscriptionAssuranceResponseDto> {
    const subscription = await this.requireSouscription(subscriptionId);

    if (subscription.statut !== "PAYEE") {
      throw new DomainException(
        "La souscription doit être payée pour générer le contrat",
        400,
        "ASSURANCE_CONTRACT_REQUIRES_PAYMENT",
      );
    }

    const updated = await this.repository.updateSouscription(subscriptionId, {
      document_url: this.pricingService.buildContractUrl(
        subscription.numero_contrat ?? "",
      ),
      statut: "ACTIVE",
      updated_at: new Date(),
    });

    return this.mapper.toSouscriptionResponse(updated);
  }

  async uploadDocument(
    subscriptionId: string,
    documentType: string,
    documentUrl: string,
  ): Promise<SouscriptionAssuranceResponseDto> {
    const subscription = await this.requireSouscription(subscriptionId);

    const normalizedDocumentType = documentType.trim();
    if (!normalizedDocumentType) {
      throw new DomainException(
        "Type de document requis",
        400,
        "ASSURANCE_DOCUMENT_TYPE_REQUIRED",
      );
    }

    const normalizedDocumentUrl = documentUrl.trim();
    if (!normalizedDocumentUrl) {
      throw new DomainException(
        "URL du document requise",
        400,
        "ASSURANCE_DOCUMENT_URL_REQUIRED",
      );
    }

    const updated = await this.repository.updateSouscription(subscription.id, {
      document_url: normalizedDocumentUrl,
      updated_at: new Date(),
    });

    return this.mapper.toSouscriptionResponse(updated);
  }

  async canAccessSouscription(
    subscriptionId: string,
    user: AuthenticatedUser,
  ): Promise<boolean> {
    const current = await this.requireCurrentUser(user);
    const subscription = await this.requireSouscription(subscriptionId);
    return this.accessPolicy.canAccessSouscription(
      current,
      subscription.utilisateur_id,
    );
  }

  async canAccessUserSouscriptions(
    utilisateurId: string,
    user: AuthenticatedUser,
  ): Promise<boolean> {
    const current = await this.requireCurrentUser(user);
    return this.accessPolicy.canAccessSouscription(current, utilisateurId);
  }

  async getSouscriptionByIdAuthorized(
    id: string,
    user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    const current = await this.requireCurrentUser(user);
    const subscription = await this.requireSouscription(id);
    this.accessPolicy.assertCanAccessSouscription(
      current,
      subscription.utilisateur_id,
    );
    return this.mapper.toSouscriptionResponse(subscription);
  }

  async getSouscriptionsByUtilisateurAuthorized(
    utilisateurId: string,
    user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto[]> {
    const current = await this.requireCurrentUser(user);
    this.accessPolicy.assertCanAccessSouscription(current, utilisateurId);
    return this.getSouscriptionsByUtilisateur(utilisateurId);
  }

  async processPaymentAuthorized(
    id: string,
    paiementId: string,
    user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    const current = await this.requireCurrentUser(user);
    const subscription = await this.requireSouscription(id);
    this.accessPolicy.assertCanAccessSouscription(
      current,
      subscription.utilisateur_id,
    );
    return this.processPayment(id, paiementId);
  }

  async generateContractAuthorized(
    id: string,
    user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    const current = await this.requireCurrentUser(user);
    const subscription = await this.requireSouscription(id);
    this.accessPolicy.assertCanAccessSouscription(
      current,
      subscription.utilisateur_id,
    );
    return this.generateContract(id);
  }

  async uploadDocumentAuthorized(
    id: string,
    documentType: string,
    documentUrl: string,
    user: AuthenticatedUser,
  ): Promise<SouscriptionAssuranceResponseDto> {
    const current = await this.requireCurrentUser(user);
    const subscription = await this.requireSouscription(id);
    this.accessPolicy.assertCanAccessSouscription(
      current,
      subscription.utilisateur_id,
    );
    return this.uploadDocument(id, documentType, documentUrl);
  }

  private async ensureAssuranceManager(user: AuthenticatedUser): Promise<void> {
    const current = await this.requireCurrentUser(user);
    this.accessPolicy.assertAssuranceManager(current);
  }

  private async requireCurrentUser(
    user: AuthenticatedUser,
  ): Promise<UserRecord> {
    const current = await this.repository.findUserByEmail(user.email);
    return this.assertFound(
      current,
      "Utilisateur non trouvé",
      "USER_NOT_FOUND",
    );
  }

  private async requireProduit(id: string): Promise<ProduitRecord> {
    const produit = this.assertFound(
      await this.repository.findProduitById(id),
      "Produit assurance non trouvé",
      "ASSURANCE_PRODUCT_NOT_FOUND",
    );

    if (
      !TYPE_ASSURANCE_VALUES.includes(
        produit.type_assurance as (typeof TYPE_ASSURANCE_VALUES)[number],
      )
    ) {
      throw new DomainException(
        "Type assurance invalide",
        500,
        "ASSURANCE_TYPE_INVALID_STORED",
      );
    }

    return produit;
  }

  private async requireOption(id: string): Promise<OptionRecord> {
    return this.assertFound(
      await this.repository.findOptionById(id),
      "Option assurance non trouvée",
      "ASSURANCE_OPTION_NOT_FOUND",
    );
  }

  private async requireSouscription(id: string): Promise<SouscriptionRecord> {
    const subscription = this.assertFound(
      await this.repository.findSouscriptionById(id),
      "Souscription assurance non trouvée",
      "ASSURANCE_SUBSCRIPTION_NOT_FOUND",
    );

    if (
      !STATUT_ASSURANCE_VALUES.includes(
        subscription.statut as (typeof STATUT_ASSURANCE_VALUES)[number],
      )
    ) {
      throw new DomainException(
        "Statut assurance invalide",
        500,
        "ASSURANCE_STATUS_INVALID_STORED",
      );
    }

    return subscription;
  }

  private async getSelectedOptions(
    optionIds: string[],
    produitAssuranceId: string,
  ): Promise<OptionRecord[]> {
    if (optionIds.length === 0) {
      return [];
    }

    const uniqueIds = [...new Set(optionIds)];
    const options = await this.repository.findOptionsByIds(uniqueIds);
    if (options.length !== uniqueIds.length) {
      throw new DomainException(
        "Certaines options assurance sont introuvables",
        404,
        "ASSURANCE_OPTION_NOT_FOUND",
      );
    }

    const inactives = options.filter((option) => option.est_actif === false);
    if (inactives.length > 0) {
      throw new DomainException(
        "Une ou plusieurs options ne sont pas actives",
        400,
        "ASSURANCE_OPTION_INACTIVE",
      );
    }

    const invalidProductOptions = options.filter(
      (option) => option.produit_assurance_id !== produitAssuranceId,
    );
    if (invalidProductOptions.length > 0) {
      throw new DomainException(
        "Une ou plusieurs options ne correspondent pas au produit d'assurance",
        400,
        "ASSURANCE_OPTION_PRODUCT_MISMATCH",
      );
    }

    return options;
  }

  private assertFound<T>(value: T | null, message: string, code: string): T {
    if (!value) {
      throw new DomainException(message, 404, code);
    }
    return value;
  }
}
