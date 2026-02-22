package com.sencarmarket.module.assurance.controller;

import com.sencarmarket.module.assurance.dto.*;
import com.sencarmarket.module.assurance.service.AssuranceService;
import com.sencarmarket.module.commun.dto.PaginatedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assurance")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AssuranceController {

    private final AssuranceService assuranceService;

    // ==================== Produit Assurance ====================

    /**
     * Creer un produit d'assurance - Compagnie d'assurance uniquement
     */
    @PostMapping("/produits")
    @PreAuthorize("hasRole('COMPAGNIE_ASSURANCE') or hasRole('ADMIN')")
    public ResponseEntity<ProduitAssuranceResponse> createProduitAssurance(
            @Valid @RequestBody CreateProduitAssuranceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assuranceService.createProduitAssurance(request));
    }

    @GetMapping("/produits/{id}")
    public ResponseEntity<ProduitAssuranceResponse> getProduitAssuranceById(@PathVariable UUID id) {
        return ResponseEntity.ok(assuranceService.getProduitAssuranceById(id));
    }

    @GetMapping("/produits")
    public ResponseEntity<PaginatedResponse<ProduitAssuranceResponse>> getAllProduitAssurances(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(assuranceService.getAllProduitAssurances(page, size));
    }

    @GetMapping("/produits/actifs")
    public ResponseEntity<List<ProduitAssuranceResponse>> getActiveProduitAssurances() {
        return ResponseEntity.ok(assuranceService.getActiveProduitAssurances());
    }

    /**
     * Mettre a jour un produit - Compagnie d'assurance ou Admin
     */
    @PutMapping("/produits/{id}")
    @PreAuthorize("hasRole('COMPAGNIE_ASSURANCE') or hasRole('ADMIN')")
    public ResponseEntity<ProduitAssuranceResponse> updateProduitAssurance(
            @PathVariable UUID id,
            @Valid @RequestBody CreateProduitAssuranceRequest request) {
        return ResponseEntity.ok(assuranceService.updateProduitAssurance(id, request));
    }

    /**
     * Supprimer un produit - Compagnie d'assurance ou Admin
     */
    @DeleteMapping("/produits/{id}")
    @PreAuthorize("hasRole('COMPAGNIE_ASSURANCE') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduitAssurance(@PathVariable UUID id) {
        assuranceService.deleteProduitAssurance(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Option Assurance ====================

    /**
     * Creer une option - Compagnie d'assurance uniquement
     */
    @PostMapping("/options")
    @PreAuthorize("hasRole('COMPAGNIE_ASSURANCE') or hasRole('ADMIN')")
    public ResponseEntity<OptionAssuranceResponse> createOptionAssurance(
            @Valid @RequestBody CreateOptionAssuranceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assuranceService.createOptionAssurance(request));
    }

    @GetMapping("/options/{id}")
    public ResponseEntity<OptionAssuranceResponse> getOptionAssuranceById(@PathVariable UUID id) {
        return ResponseEntity.ok(assuranceService.getOptionAssuranceById(id));
    }

    @GetMapping("/produits/{produitId}/options")
    public ResponseEntity<List<OptionAssuranceResponse>> getOptionsByProduitAssurance(
            @PathVariable UUID produitId) {
        return ResponseEntity.ok(assuranceService.getOptionsByProduitAssurance(produitId));
    }

    /**
     * Mettre a jour une option - Compagnie d'assurance ou Admin
     */
    @PutMapping("/options/{id}")
    @PreAuthorize("hasRole('COMPAGNIE_ASSURANCE') or hasRole('ADMIN')")
    public ResponseEntity<OptionAssuranceResponse> updateOptionAssurance(
            @PathVariable UUID id,
            @Valid @RequestBody CreateOptionAssuranceRequest request) {
        return ResponseEntity.ok(assuranceService.updateOptionAssurance(id, request));
    }

    /**
     * Supprimer une option - Compagnie d'assurance ou Admin
     */
    @DeleteMapping("/options/{id}")
    @PreAuthorize("hasRole('COMPAGNIE_ASSURANCE') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOptionAssurance(@PathVariable UUID id) {
        assuranceService.deleteOptionAssurance(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Souscription Assurance ====================

    @PostMapping("/souscriptions")
    public ResponseEntity<SouscriptionAssuranceResponse> createSouscription(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateSouscriptionAssuranceRequest request) {
        // In a real app, get user ID from security context
        UUID utilisateurId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assuranceService.createSouscription(utilisateurId, request));
    }

    @GetMapping("/souscriptions/{id}")
    public ResponseEntity<SouscriptionAssuranceResponse> getSouscriptionById(@PathVariable UUID id) {
        return ResponseEntity.ok(assuranceService.getSouscriptionById(id));
    }

    @GetMapping("/souscriptions/utilisateur/{utilisateurId}")
    public ResponseEntity<List<SouscriptionAssuranceResponse>> getSouscriptionsByUtilisateur(
            @PathVariable UUID utilisateurId) {
        return ResponseEntity.ok(assuranceService.getSouscriptionsByUtilisateur(utilisateurId));
    }

    @GetMapping("/calcul-prix")
    public ResponseEntity<SouscriptionAssuranceResponse> calculatePrix(
            @RequestParam UUID produitAssuranceId,
            @RequestParam(required = false) List<UUID> optionIds) {
        return ResponseEntity.ok(assuranceService.calculatePrix(produitAssuranceId, optionIds));
    }

    // ==================== Payment ====================

    @PostMapping("/souscriptions/{id}/payment")
    public ResponseEntity<SouscriptionAssuranceResponse> processPayment(
            @PathVariable UUID id,
            @RequestParam UUID paiementId) {
        return ResponseEntity.ok(assuranceService.processPayment(id, paiementId));
    }

    // ==================== Contract ====================

    @PostMapping("/souscriptions/{id}/contrat")
    public ResponseEntity<SouscriptionAssuranceResponse> generateContract(@PathVariable UUID id) {
        return ResponseEntity.ok(assuranceService.generateContract(id));
    }

    // ==================== Documents ====================

    @PostMapping("/souscriptions/{id}/documents")
    public ResponseEntity<SouscriptionAssuranceResponse> uploadDocument(
            @PathVariable UUID id,
            @RequestParam String documentType,
            @RequestParam String documentUrl) {
        return ResponseEntity.ok(assuranceService.uploadDocument(id, documentType, documentUrl));
    }
}
