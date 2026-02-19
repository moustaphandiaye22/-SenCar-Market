package com.sencarmarket.module.certification.controller;

import com.sencarmarket.module.certification.dto.*;
import com.sencarmarket.module.certification.entity.DemandeCertification;
import com.sencarmarket.module.certification.service.CertificationService;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/certifications")
@RequiredArgsConstructor
public class CertificationController {

    private final CertificationService certificationService;

    // ==================== Demande Certification ====================

    /**
     * Crée une nouvelle demande de certification
     */
    @PostMapping("/demandes")
    public ResponseEntity<DemandeCertificationResponse> createDemandeCertification(
            @Valid @RequestBody CreateDemandeCertificationRequest request,
            @RequestHeader("X-User-Id") UUID utilisateurId) {
        DemandeCertificationResponse response = certificationService.createDemandeCertification(request, utilisateurId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Récupère toutes les demandes de certification avec pagination
     */
    @GetMapping("/demandes")
    public ResponseEntity<PaginatedResponse<DemandeCertificationResponse>> getAllDemandes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PaginatedResponse<DemandeCertificationResponse> response = certificationService.getAllDemandes(page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Récupère une demande de certification par ID
     */
    @GetMapping("/demandes/{id}")
    public ResponseEntity<DemandeCertificationResponse> getDemandeById(@PathVariable UUID id) {
        DemandeCertificationResponse response = certificationService.getDemandeById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Récupère les demandes de certification d'un utilisateur
     */
    @GetMapping("/demandes/utilisateur/{utilisateurId}")
    public ResponseEntity<List<DemandeCertificationResponse>> getDemandesByUtilisateur(
            @PathVariable UUID utilisateurId) {
        List<DemandeCertificationResponse> response = certificationService.getDemandesByUtilisateur(utilisateurId);
        return ResponseEntity.ok(response);
    }

    /**
     * Met à jour une demande de certification
     */
    @PutMapping("/demandes/{id}")
    public ResponseEntity<DemandeCertificationResponse> updateDemandeCertification(
            @PathVariable UUID id,
            @Valid @RequestBody CreateDemandeCertificationRequest request) {
        DemandeCertificationResponse response = certificationService.updateDemandeCertification(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Supprime une demande de certification
     */
    @DeleteMapping("/demandes/{id}")
    public ResponseEntity<Void> deleteDemandeCertification(@PathVariable UUID id) {
        certificationService.deleteDemandeCertification(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Payment ====================

    /**
     * Traite le paiement d'une demande de certification
     */
    @PostMapping("/demandes/{demandeId}/payment")
    public ResponseEntity<DemandeCertificationResponse> processPayment(
            @PathVariable UUID demandeId,
            @RequestParam UUID paiementId) {
        DemandeCertificationResponse response = certificationService.processPayment(demandeId, paiementId);
        return ResponseEntity.ok(response);
    }

    // ==================== Inspector ====================

    /**
     * Attribue un inspecteur à une demande de certification
     */
    @PostMapping("/demandes/{demandeId}/assign-inspector")
    public ResponseEntity<DemandeCertificationResponse> assignInspector(
            @PathVariable UUID demandeId,
            @RequestParam UUID inspecteurId) {
        DemandeCertificationResponse response = certificationService.assignInspector(demandeId, inspecteurId);
        return ResponseEntity.ok(response);
    }

    // ==================== Statut ====================

    /**
     * Met à jour le statut d'une demande de certification
     */
    @PatchMapping("/demandes/{demandeId}/statut")
    public ResponseEntity<DemandeCertificationResponse> updateStatut(
            @PathVariable UUID demandeId,
            @RequestParam DemandeCertification.StatutDemande statut) {
        DemandeCertificationResponse response = certificationService.updateStatut(demandeId, statut);
        return ResponseEntity.ok(response);
    }

    // ==================== Inspection ====================

    /**
     * Crée une inspection pour une demande de certification
     */
    @PostMapping("/inspections")
    public ResponseEntity<InspectionResponse> createInspection(
            @Valid @RequestBody CreateInspectionRequest request,
            @RequestParam UUID demandeId) {
        InspectionResponse response = certificationService.createInspection(request, demandeId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Récupère une inspection par ID
     */
    @GetMapping("/inspections/{id}")
    public ResponseEntity<InspectionResponse> getInspectionById(@PathVariable UUID id) {
        InspectionResponse response = certificationService.getInspectionById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Récupère les inspections d'un inspecteur avec pagination
     */
    @GetMapping("/inspections/inspecteur/{inspecteurId}")
    public ResponseEntity<PaginatedResponse<InspectionResponse>> getInspectionsByInspecteur(
            @PathVariable UUID inspecteurId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PaginatedResponse<InspectionResponse> response = certificationService.getInspectionsByInspecteur(inspecteurId, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Met à jour une inspection
     */
    @PutMapping("/inspections/{id}")
    public ResponseEntity<InspectionResponse> updateInspection(
            @PathVariable UUID id,
            @Valid @RequestBody CreateInspectionRequest request) {
        InspectionResponse response = certificationService.updateInspection(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Supprime une inspection
     */
    @DeleteMapping("/inspections/{id}")
    public ResponseEntity<Void> deleteInspection(@PathVariable UUID id) {
        certificationService.deleteInspection(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Rapport ====================

    /**
     * Upload le PDF du rapport d'inspection
     */
    @PostMapping("/inspections/{inspectionId}/upload-rapport")
    public ResponseEntity<RapportInspectionResponse> uploadRapportPdf(
            @PathVariable UUID inspectionId,
            @RequestParam("file") MultipartFile file) {
        RapportInspectionResponse response = certificationService.uploadRapportPdf(inspectionId, file);
        return ResponseEntity.ok(response);
    }

    /**
     * Enregistre le résultat de l'inspection
     */
    @PostMapping("/inspections/{inspectionId}/resultat")
    public ResponseEntity<InspectionResponse> saveRapportResult(
            @PathVariable UUID inspectionId,
            @Valid @RequestBody CreateRapportInspectionRequest request) {
        InspectionResponse response = certificationService.saveRapportResult(inspectionId, request);
        return ResponseEntity.ok(response);
    }

    // ==================== Badge ====================

    /**
     * Génère le badge certifié pour un véhicule
     */
    @PostMapping("/demandes/{demandeId}/generate-badge")
    public ResponseEntity<DemandeCertificationResponse> generateBadge(@PathVariable UUID demandeId) {
        DemandeCertificationResponse response = certificationService.generateBadge(demandeId);
        return ResponseEntity.ok(response);
    }
}
