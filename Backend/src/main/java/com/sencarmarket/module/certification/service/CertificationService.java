package com.sencarmarket.module.certification.service;

import com.sencarmarket.module.certification.dto.*;
import com.sencarmarket.module.certification.entity.DemandeCertification;
import com.sencarmarket.module.certification.entity.Inspection;
import com.sencarmarket.module.certification.entity.RapportInspection;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface CertificationService {

    /**
     * Crée une nouvelle demande de certification pour un véhicule
     */
    DemandeCertificationResponse createDemandeCertification(CreateDemandeCertificationRequest request, UUID utilisateurId);

    /**
     * Traite le paiement d'une demande de certification
     */
    DemandeCertificationResponse processPayment(UUID demandeId, UUID paiementId);

    /**
     * Attribue un inspecteur à une demande de certification
     */
    DemandeCertificationResponse assignInspector(UUID demandeId, UUID inspecteurId);

    /**
     * Met à jour le statut d'une demande de certification
     */
    DemandeCertificationResponse updateStatut(UUID demandeId, DemandeCertification.StatutDemande nouveauStatut);

    /**
     * Met à jour une demande de certification
     */
    DemandeCertificationResponse updateDemandeCertification(UUID id, CreateDemandeCertificationRequest request);

    /**
     * Supprime une demande de certification
     */
    void deleteDemandeCertification(UUID id);

    /**
     * Crée une inspection pour une demande de certification
     */
    InspectionResponse createInspection(CreateInspectionRequest request, UUID demandeId);

    /**
     * Met à jour une inspection
     */
    InspectionResponse updateInspection(UUID id, CreateInspectionRequest request);

    /**
     * Supprime une inspection
     */
    void deleteInspection(UUID id);

    /**
     * Upload le PDF du rapport d'inspection
     */
    RapportInspectionResponse uploadRapportPdf(UUID inspectionId, MultipartFile file);

    /**
     * Enregistre le résultat de l'inspection
     */
    InspectionResponse saveRapportResult(UUID inspectionId, CreateRapportInspectionRequest request);

    /**
     * Génère le badge certifié pour un véhicule
     */
    DemandeCertificationResponse generateBadge(UUID demandeId);

    /**
     * Récupère une demande de certification par ID
     */
    DemandeCertificationResponse getDemandeById(UUID demandeId);

    /**
     * Liste toutes les demandes de certification avec pagination
     */
    PaginatedResponse<DemandeCertificationResponse> getAllDemandes(int page, int size);

    /**
     * Liste les demandes par utilisateur
     */
    List<DemandeCertificationResponse> getDemandesByUtilisateur(UUID utilisateurId);

    /**
     * Liste les inspections par inspecteur avec pagination
     */
    PaginatedResponse<InspectionResponse> getInspectionsByInspecteur(UUID inspecteurId, int page, int size);

    /**
     * Récupère une inspection par ID
     */
    InspectionResponse getInspectionById(UUID inspectionId);
}
