package com.sencarmarket.module.paiement.controller;

import com.sencarmarket.module.paiement.dto.*;
import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.paiement.entity.PaiementLog;
import com.sencarmarket.module.paiement.repository.TransactionPortefeuilleRepository;
import com.sencarmarket.module.paiement.service.PaiementService;
import com.sencarmarket.module.commun.security.AccessControlService;
import com.sencarmarket.module.commun.exception.UnauthorizedAccessException;
import com.sencarmarket.module.commun.constants.AppMessages;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/paiements")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class PaiementController {

    private final PaiementService paiementService;
    private final AccessControlService accessControlService;
    private final TransactionPortefeuilleRepository transactionRepository;

    // ========== PAIEMENTS ==========

    @PostMapping
    public ResponseEntity<PaiementResponse> createPaiement(
            @Valid @RequestBody CreatePaiementRequest request,
            Authentication authentication) {
        applyAuthenticatedUtilisateurId(request, authentication);
        accessControlService.checkOwnerOrAdmin(authentication, request.getUtilisateurId(), AppMessages.ACCESS_DENIED_RESOURCE);
        return ResponseEntity.ok(paiementService.createPaiement(request));
    }

    @PostMapping("/wave")
    public ResponseEntity<PaiementResponse> createPaiementWave(
            @Valid @RequestBody CreatePaiementRequest request,
            Authentication authentication) {
        applyAuthenticatedUtilisateurId(request, authentication);
        accessControlService.checkOwnerOrAdmin(authentication, request.getUtilisateurId(), AppMessages.ACCESS_DENIED_RESOURCE);
        return ResponseEntity.ok(paiementService.createPaiementWave(request));
    }

    @PostMapping("/orange-money")
    public ResponseEntity<PaiementResponse> createPaiementOrangeMoney(
            @Valid @RequestBody CreatePaiementRequest request,
            Authentication authentication) {
        applyAuthenticatedUtilisateurId(request, authentication);
        accessControlService.checkOwnerOrAdmin(authentication, request.getUtilisateurId(), AppMessages.ACCESS_DENIED_RESOURCE);
        return ResponseEntity.ok(paiementService.createPaiementOrangeMoney(request));
    }

    @PostMapping("/escrow")
    public ResponseEntity<PaiementResponse> createPaiementEscrow(
            @Valid @RequestBody CreatePaiementRequest request,
            Authentication authentication) {
        applyAuthenticatedUtilisateurId(request, authentication);
        accessControlService.checkOwnerOrAdmin(authentication, request.getUtilisateurId(), AppMessages.ACCESS_DENIED_RESOURCE);
        return ResponseEntity.ok(paiementService.createPaiementEscrow(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaiementResponse> getPaiementById(@PathVariable UUID id, Authentication authentication) {
        Paiement paiement = paiementService.getPaiementById(id);
        accessControlService.checkOwnerOrAdmin(authentication,
                paiement.getUtilisateur() != null ? paiement.getUtilisateur().getId() : null,
                AppMessages.ACCESS_DENIED_RESOURCE);
        return ResponseEntity.ok(paiementService.getPaiementResponseById(id));
    }

    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<List<PaiementResponse>> getPaiementsByUtilisateur(
            @PathVariable UUID utilisateurId,
            Authentication authentication) {
        accessControlService.checkOwnerOrAdmin(authentication, utilisateurId, AppMessages.ACCESS_DENIED_RESOURCE);
        return ResponseEntity.ok(paiementService.getPaiementsByUtilisateur(utilisateurId));
    }

    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<List<PaiementResponse>> getPaiementsByReservation(@PathVariable UUID reservationId) {
        return ResponseEntity.ok(paiementService.getPaiementsByReservation(reservationId));
    }

    @GetMapping("/statut/{statut}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<List<PaiementResponse>> getPaiementsByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(paiementService.getPaiementsByStatut(statut));
    }

    @PutMapping("/{id}/confirmer")
    public ResponseEntity<PaiementResponse> confirmerPaiement(
            @PathVariable UUID id,
            @RequestParam String referenceExterne,
            Authentication authentication) {
        Paiement paiement = paiementService.getPaiementById(id);
        accessControlService.checkOwnerOrAdmin(authentication,
                paiement.getUtilisateur() != null ? paiement.getUtilisateur().getId() : null,
                AppMessages.ACCESS_DENIED_RESOURCE);
        return ResponseEntity.ok(paiementService.confirmerPaiement(id, referenceExterne));
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<PaiementResponse> annulerPaiement(@PathVariable UUID id, Authentication authentication) {
        Paiement paiement = paiementService.getPaiementById(id);
        accessControlService.checkOwnerOrAdmin(authentication,
                paiement.getUtilisateur() != null ? paiement.getUtilisateur().getId() : null,
                AppMessages.ACCESS_DENIED_RESOURCE);
        return ResponseEntity.ok(paiementService.annulerPaiement(id));
    }

    @PostMapping("/{id}/rembourser")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<PaiementResponse> RembourserPaiement(
            @PathVariable UUID id,
            @RequestParam(required = false) BigDecimal montant) {
        BigDecimal mont = montant != null ? montant : BigDecimal.ZERO;
        return ResponseEntity.ok(paiementService.remboursementPaiement(id, mont));
    }

    @PostMapping("/{id}/confirmer-liberer")
    public ResponseEntity<PaiementResponse> confirmerReceptionEtLiberer(@PathVariable UUID id, Authentication authentication) {
        Paiement paiement = paiementService.getPaiementById(id);
        accessControlService.checkOwnerOrAdmin(authentication,
                paiement.getUtilisateur() != null ? paiement.getUtilisateur().getId() : null,
                AppMessages.ACCESS_DENIED_RESOURCE);
        return ResponseEntity.ok(paiementService.confirmerReceptionEtLiberer(id));
    }

    // ========== WEBHOOKS ==========

    @PostMapping("/webhook/wave")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> webhookWave(
            @RequestBody String payload,
            @RequestHeader("X-Wave-Signature") String signature) {
        String result = paiementService.processWaveWebhook(payload, signature);
        if ("INVALID_SIGNATURE".equals(result) || "INVALID_PAYLOAD".equals(result)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/webhook/orange-money")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> webhookOrangeMoney(
            @RequestBody String payload,
            @RequestHeader("X-OM-Signature") String signature) {
        String result = paiementService.processOrangeMoneyWebhook(payload, signature);
        if ("INVALID_SIGNATURE".equals(result) || "INVALID_PAYLOAD".equals(result)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        }
        return ResponseEntity.ok(result);
    }

    // ========== PORTEFEUILLE ==========

    @GetMapping("/portefeuille/utilisateur/{utilisateurId}")
    public ResponseEntity<PortefeuilleResponse> getPortefeuille(@PathVariable UUID utilisateurId, Authentication authentication) {
        accessControlService.checkOwnerOrAdmin(authentication, utilisateurId, AppMessages.ACCESS_DENIED_RESOURCE);
        return ResponseEntity.ok(paiementService.getOrCreatePortefeuille(utilisateurId));
    }

    @PostMapping("/portefeuille/crediter")
    public ResponseEntity<PortefeuilleResponse> crediterPortefeuille(
            @Valid @RequestBody TransactionPortefeuilleRequest request,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        return ResponseEntity.ok(paiementService.crediterPortefeuille(utilisateurId, request));
    }

    @PostMapping("/portefeuille/debiter")
    public ResponseEntity<PortefeuilleResponse> debiterPortefeuille(
            @Valid @RequestBody TransactionPortefeuilleRequest request,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        return ResponseEntity.ok(paiementService.debiterPortefeuille(utilisateurId, request));
    }

    @PostMapping("/portefeuille/retrait")
    public ResponseEntity<TransactionResponse> demanderRetrait(
            @Valid @RequestBody RetraitRequest request,
            Authentication authentication) {
        UUID utilisateurId = accessControlService.getCurrentUserId(authentication);
        return ResponseEntity.ok(paiementService.demanderRetrait(utilisateurId, request));
    }

    // ========== TRANSACTIONS ==========

    @GetMapping("/transactions/utilisateur/{utilisateurId}")
    public ResponseEntity<List<TransactionResponse>> getHistoriqueTransactions(
            @PathVariable UUID utilisateurId,
            Authentication authentication) {
        accessControlService.checkOwnerOrAdmin(authentication, utilisateurId, AppMessages.ACCESS_DENIED_RESOURCE);
        return ResponseEntity.ok(paiementService.getHistoriqueTransactions(utilisateurId));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable UUID id, Authentication authentication) {
        if (!accessControlService.isAdmin(authentication)) {
            UUID currentUserId = accessControlService.getCurrentUserId(authentication);
            if (!transactionRepository.existsByIdAndPortefeuilleUtilisateurId(id, currentUserId)) {
                throw new UnauthorizedAccessException(AppMessages.ACCESS_DENIED_RESOURCE);
            }
        }
        return ResponseEntity.ok(paiementService.getTransactionResponseById(id));
    }

    // ========== LOGS ==========

    @GetMapping("/{id}/logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATEUR', 'SUPER_ADMIN')")
    public ResponseEntity<List<PaiementLog>> getLogsByPaiement(@PathVariable UUID id) {
        return ResponseEntity.ok(paiementService.getLogsByPaiement(id));
    }

    // ========== COMMISSION ==========

    @GetMapping("/commission/calculer")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<BigDecimal> calculateCommission(@RequestParam BigDecimal montant) {
        return ResponseEntity.ok(paiementService.calculateCommission(montant));
    }

    private void applyAuthenticatedUtilisateurId(CreatePaiementRequest request, Authentication authentication) {
        UUID currentUserId = accessControlService.getCurrentUserId(authentication);
        if (!accessControlService.isAdmin(authentication) || request.getUtilisateurId() == null) {
            request.setUtilisateurId(currentUserId);
        }
    }
}
