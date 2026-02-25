package com.sencarmarket.module.tradein.controller;

import com.sencarmarket.module.commun.dto.PaginatedResponse;
import com.sencarmarket.module.commun.constants.AppMessages;
import com.sencarmarket.module.commun.security.AccessControlService;
import com.sencarmarket.module.tradein.dto.*;
import com.sencarmarket.module.tradein.entity.DemandeTradeIn.StatutTradeIn;
import com.sencarmarket.module.tradein.service.TradeInService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tradein")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class TradeInController {

    private final TradeInService tradeInService;
    private final AccessControlService accessControlService;

    // ==================== Demande ====================

    /**
     * Cree une nouvelle demande de trade-in
     */
    @PostMapping("/demandes")
    public ResponseEntity<DemandeTradeInResponse> createDemande(
            @Valid @RequestBody CreateDemandeTradeInRequest request,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        DemandeTradeInResponse response = tradeInService.createDemande(request, utilisateurId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Récupère toutes les demandes de trade-in avec pagination
     */
    @GetMapping("/demandes")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<PaginatedResponse<DemandeTradeInResponse>> getAllDemandes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PaginatedResponse<DemandeTradeInResponse> response = tradeInService.getAllDemandes(page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Récupère une demande de trade-in par ID
     */
    @GetMapping("/demandes/{id}")
    public ResponseEntity<DemandeTradeInResponse> getDemandeById(@PathVariable UUID id, Authentication authentication) {
        checkTradeInOwnerOrAdmin(authentication, id);
        DemandeTradeInResponse response = tradeInService.getDemandeById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Récupère les demandes de trade-in d'un utilisateur
     */
    @GetMapping("/demandes/utilisateur/{utilisateurId}")
    public ResponseEntity<List<DemandeTradeInResponse>> getDemandesByUtilisateur(
            @PathVariable UUID utilisateurId,
            Authentication authentication) {
        accessControlService.checkOwnerOrAdmin(authentication, utilisateurId, AppMessages.ACCESS_DENIED_RESOURCE);
        List<DemandeTradeInResponse> response = tradeInService.getDemandesByUtilisateur(utilisateurId);
        return ResponseEntity.ok(response);
    }

    /**
     * Met à jour une demande de trade-in
     */
    @PutMapping("/demandes/{id}")
    public ResponseEntity<DemandeTradeInResponse> updateDemande(
            @PathVariable UUID id,
            @Valid @RequestBody CreateDemandeTradeInRequest request,
            Authentication authentication) {
        checkTradeInOwnerOrAdmin(authentication, id);
        DemandeTradeInResponse response = tradeInService.updateDemande(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Supprime une demande de trade-in
     */
    @DeleteMapping("/demandes/{id}")
    public ResponseEntity<Void> deleteDemande(@PathVariable UUID id, Authentication authentication) {
        checkTradeInOwnerOrAdmin(authentication, id);
        tradeInService.deleteDemande(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Estimation ====================

    /**
     * Estime la valeur d'un véhicule (sans créer de demande)
     */
    @PostMapping("/estimation")
    public ResponseEntity<EstimationResponse> estimerVehicule(
            @Valid @RequestBody EstimationRequest request) {
        EstimationResponse response = tradeInService.estimerVehicule(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Calcule l'estimation automatique pour une demande existante
     */
    @PostMapping("/demandes/{id}/calculer-estimation")
    public ResponseEntity<DemandeTradeInResponse> calculerEstimationAuto(@PathVariable UUID id, Authentication authentication) {
        checkTradeInOwnerOrAdmin(authentication, id);
        DemandeTradeInResponse response = tradeInService.calculerEstimationAuto(id);
        return ResponseEntity.ok(response);
    }

    // ==================== Validation Admin ====================

    /**
     * Valide une demande de trade-in (admin)
     */
    @PostMapping("/demandes/{id}/validation")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<DemandeTradeInResponse> validerDemande(
            @PathVariable UUID id,
            @Valid @RequestBody ValidationRequest request) {
        DemandeTradeInResponse response = tradeInService.validerDemande(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Met à jour le statut d'une demande
     */
    @PatchMapping("/demandes/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<DemandeTradeInResponse> updateStatut(
            @PathVariable UUID id,
            @RequestParam StatutTradeIn statut) {
        DemandeTradeInResponse response = tradeInService.updateStatut(id, statut);
        return ResponseEntity.ok(response);
    }

    // ==================== Notifications ====================

    /**
     * Notifie l'utilisateur pour une demande
     */
    @PostMapping("/demandes/{id}/notifier")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<DemandeTradeInResponse> notifierUtilisateur(@PathVariable UUID id) {
        DemandeTradeInResponse response = tradeInService.notifierUtilisateur(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Récupère les demandes non notifiées
     */
    @GetMapping("/demandes/non-notifiees")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<List<DemandeTradeInResponse>> getDemandesNonNotifiees() {
        List<DemandeTradeInResponse> response = tradeInService.getDemandesNonNotifiees();
        return ResponseEntity.ok(response);
    }

    private void checkTradeInOwnerOrAdmin(Authentication authentication, UUID demandeId) {
        if (accessControlService.isAdmin(authentication)) {
            return;
        }
        DemandeTradeInResponse demande = tradeInService.getDemandeById(demandeId);
        accessControlService.checkOwnerOrAdmin(authentication, demande.getUtilisateurId(),
                AppMessages.ACCESS_DENIED_RESOURCE);
    }
}
