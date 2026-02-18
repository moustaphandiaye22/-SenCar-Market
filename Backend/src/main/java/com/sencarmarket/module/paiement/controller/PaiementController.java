package com.sencarmarket.module.paiement.controller;

import com.sencarmarket.module.paiement.dto.*;
import com.sencarmarket.module.paiement.entity.PaiementLog;
import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;
import com.sencarmarket.module.paiement.service.PaiementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/paiements")
@RequiredArgsConstructor
public class PaiementController {

    private final PaiementService paiementService;

    // ========== PAIEMENTS ==========

    @PostMapping
    public ResponseEntity<PaiementResponse> createPaiement(
            @Valid @RequestBody CreatePaiementRequest request) {
        return ResponseEntity.ok(paiementService.createPaiement(request));
    }

    @PostMapping("/wave")
    public ResponseEntity<PaiementResponse> createPaiementWave(
            @Valid @RequestBody CreatePaiementRequest request) {
        return ResponseEntity.ok(paiementService.createPaiementWave(request));
    }

    @PostMapping("/orange-money")
    public ResponseEntity<PaiementResponse> createPaiementOrangeMoney(
            @Valid @RequestBody CreatePaiementRequest request) {
        return ResponseEntity.ok(paiementService.createPaiementOrangeMoney(request));
    }

    @PostMapping("/escrow")
    public ResponseEntity<PaiementResponse> createPaiementEscrow(
            @Valid @RequestBody CreatePaiementRequest request) {
        return ResponseEntity.ok(paiementService.createPaiementEscrow(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaiementResponse> getPaiementById(@PathVariable UUID id) {
        return ResponseEntity.ok(paiementService.getPaiementResponseById(id));
    }

    @GetMapping("/utilisateur/{utilisateurId}")
    public ResponseEntity<List<PaiementResponse>> getPaiementsByUtilisateur(@PathVariable UUID utilisateurId) {
        return ResponseEntity.ok(paiementService.getPaiementsByUtilisateur(utilisateurId));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<PaiementResponse>> getPaiementsByReservation(@PathVariable UUID reservationId) {
        return ResponseEntity.ok(paiementService.getPaiementsByReservation(reservationId));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<PaiementResponse>> getPaiementsByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(paiementService.getPaiementsByStatut(statut));
    }

    @PutMapping("/{id}/confirmer")
    public ResponseEntity<PaiementResponse> confirmerPaiement(
            @PathVariable UUID id,
            @RequestParam String referenceExterne) {
        return ResponseEntity.ok(paiementService.confirmerPaiement(id, referenceExterne));
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<PaiementResponse> annulerPaiement(@PathVariable UUID id) {
        return ResponseEntity.ok(paiementService.annulerPaiement(id));
    }

    @PostMapping("/{id}/rembourser")
    public ResponseEntity<PaiementResponse> RembourserPaiement(
            @PathVariable UUID id,
            @RequestParam(required = false) BigDecimal montant) {
        BigDecimal mont = montant != null ? montant : BigDecimal.ZERO;
        return ResponseEntity.ok(paiementService.remboursementPaiement(id, mont));
    }

    @PostMapping("/{id}/confirmer-liberer")
    public ResponseEntity<PaiementResponse> confirmerReceptionEtLiberer(@PathVariable UUID id) {
        return ResponseEntity.ok(paiementService.confirmerReceptionEtLiberer(id));
    }

    // ========== WEBHOOKS ==========

    @PostMapping("/webhook/wave")
    public ResponseEntity<String> webhookWave(
            @RequestBody String payload,
            @RequestHeader("X-Wave-Signature") String signature) {
        String result = paiementService.processWaveWebhook(payload, signature);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/webhook/orange-money")
    public ResponseEntity<String> webhookOrangeMoney(
            @RequestBody String payload,
            @RequestHeader("X-OM-Signature") String signature) {
        String result = paiementService.processOrangeMoneyWebhook(payload, signature);
        return ResponseEntity.ok(result);
    }

    // ========== PORTEFEUILLE ==========

    @GetMapping("/portefeuille/utilisateur/{utilisateurId}")
    public ResponseEntity<PortefeuilleResponse> getPortefeuille(@PathVariable UUID utilisateurId) {
        return ResponseEntity.ok(paiementService.getOrCreatePortefeuille(utilisateurId));
    }

    @PostMapping("/portefeuille/crediter")
    public ResponseEntity<PortefeuilleResponse> crediterPortefeuille(
            @Valid @RequestBody TransactionPortefeuilleRequest request,
            Authentication authentication) {
        UUID utilisateurId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(paiementService.crediterPortefeuille(utilisateurId, request));
    }

    @PostMapping("/portefeuille/debiter")
    public ResponseEntity<PortefeuilleResponse> debiterPortefeuille(
            @Valid @RequestBody TransactionPortefeuilleRequest request,
            Authentication authentication) {
        UUID utilisateurId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(paiementService.debiterPortefeuille(utilisateurId, request));
    }

    @PostMapping("/portefeuille/retrait")
    public ResponseEntity<TransactionResponse> demanderRetrait(
            @Valid @RequestBody RetraitRequest request,
            Authentication authentication) {
        UUID utilisateurId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(paiementService.demanderRetrait(utilisateurId, request));
    }

    // ========== TRANSACTIONS ==========

    @GetMapping("/transactions/utilisateur/{utilisateurId}")
    public ResponseEntity<List<TransactionResponse>> getHistoriqueTransactions(@PathVariable UUID utilisateurId) {
        return ResponseEntity.ok(paiementService.getHistoriqueTransactions(utilisateurId));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<TransactionResponse> getTransactionById(@PathVariable UUID id) {
        return ResponseEntity.ok(paiementService.getTransactionResponseById(id));
    }

    // ========== LOGS ==========

    @GetMapping("/{id}/logs")
    public ResponseEntity<List<PaiementLog>> getLogsByPaiement(@PathVariable UUID id) {
        return ResponseEntity.ok(paiementService.getLogsByPaiement(id));
    }

    // ========== COMMISSION ==========

    @GetMapping("/commission/calculer")
    public ResponseEntity<BigDecimal> calculateCommission(@RequestParam BigDecimal montant) {
        return ResponseEntity.ok(paiementService.calculateCommission(montant));
    }
}
