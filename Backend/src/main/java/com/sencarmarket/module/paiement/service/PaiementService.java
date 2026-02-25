package com.sencarmarket.module.paiement.service;

import com.sencarmarket.module.paiement.dto.*;
import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.paiement.entity.PaiementLog;
import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;
import com.sencarmarket.module.paiement.mapper.IPaiementMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaiementService implements IPaiementService {

    private final PaiementCoreService paiementCoreService;
    private final PaiementWebhookService paiementWebhookService;
    private final PortefeuilleTransactionService portefeuilleTransactionService;
    private final PaiementLogService paiementLogService;
    private final IPaiementMapper paiementMapper;

    @Override
    public PaiementResponse createPaiement(CreatePaiementRequest request) {
        return paiementCoreService.createPaiement(request);
    }

    @Override
    public PaiementResponse createPaiementWave(CreatePaiementRequest request) {
        return paiementCoreService.createPaiementWave(request);
    }

    @Override
    public PaiementResponse createPaiementOrangeMoney(CreatePaiementRequest request) {
        return paiementCoreService.createPaiementOrangeMoney(request);
    }

    @Override
    public PaiementResponse updateStatutPaiement(UUID id, String nouveauStatut) {
        return paiementCoreService.updateStatutPaiement(id, nouveauStatut);
    }

    @Override
    public PaiementResponse confirmerPaiement(UUID id, String referenceExterne) {
        return paiementCoreService.confirmerPaiement(id, referenceExterne);
    }

    @Override
    public PaiementResponse annulerPaiement(UUID id) {
        return paiementCoreService.annulerPaiement(id);
    }

    @Override
    public PaiementResponse remboursementPaiement(UUID id, BigDecimal montant) {
        return paiementCoreService.remboursementPaiement(id, montant);
    }

    @Override
    public Paiement getPaiementById(UUID id) {
        return paiementCoreService.getPaiementById(id);
    }

    @Override
    public PaiementResponse getPaiementResponseById(UUID id) {
        return paiementCoreService.getPaiementResponseById(id);
    }

    @Override
    public List<PaiementResponse> getPaiementsByUtilisateur(UUID utilisateurId) {
        return paiementCoreService.getPaiementsByUtilisateur(utilisateurId);
    }

    @Override
    public List<PaiementResponse> getPaiementsByReservation(UUID reservationId) {
        return paiementCoreService.getPaiementsByReservation(reservationId);
    }

    @Override
    public List<PaiementResponse> getPaiementsByStatut(String statut) {
        return paiementCoreService.getPaiementsByStatut(statut);
    }

    @Override
    public String processWaveWebhook(String payload, String signature) {
        return paiementWebhookService.processWaveWebhook(payload, signature);
    }

    @Override
    public String processOrangeMoneyWebhook(String payload, String signature) {
        return paiementWebhookService.processOrangeMoneyWebhook(payload, signature);
    }

    @Override
    public boolean verifyWebhookSignature(String payload, String signature, String secret) {
        return paiementWebhookService.verifyWebhookSignature(payload, signature, secret);
    }

    @Override
    public PaiementLog createLog(PaiementLog log) {
        return paiementLogService.createLog(log);
    }

    @Override
    public List<PaiementLog> getLogsByPaiement(UUID paiementId) {
        return paiementLogService.getLogsByPaiement(paiementId);
    }

    @Override
    public PortefeuilleResponse getOrCreatePortefeuille(UUID utilisateurId) {
        return portefeuilleTransactionService.getOrCreatePortefeuille(utilisateurId);
    }

    @Override
    public PortefeuilleResponse getPortefeuilleByUtilisateur(UUID utilisateurId) {
        return portefeuilleTransactionService.getPortefeuilleByUtilisateur(utilisateurId);
    }

    @Override
    public PortefeuilleResponse crediterPortefeuille(UUID utilisateurId, TransactionPortefeuilleRequest request) {
        return portefeuilleTransactionService.crediterPortefeuille(utilisateurId, request);
    }

    @Override
    public PortefeuilleResponse debiterPortefeuille(UUID utilisateurId, TransactionPortefeuilleRequest request) {
        return portefeuilleTransactionService.debiterPortefeuille(utilisateurId, request);
    }

    @Override
    public TransactionResponse demanderRetrait(UUID utilisateurId, RetraitRequest request) {
        return portefeuilleTransactionService.demanderRetrait(utilisateurId, request);
    }

    @Override
    public PortefeuilleResponse bloquerFondsEscrow(UUID utilisateurId, BigDecimal montant, String reference) {
        return portefeuilleTransactionService.bloquerFondsEscrow(utilisateurId, montant, reference);
    }

    @Override
    public PortefeuilleResponse libererFondsEscrow(UUID utilisateurId, BigDecimal montant, String reference) {
        return portefeuilleTransactionService.libererFondsEscrow(utilisateurId, montant, reference);
    }

    @Override
    public PortefeuilleResponse remboursementEscrow(UUID utilisateurId, BigDecimal montant, String reference) {
        return portefeuilleTransactionService.remboursementEscrow(utilisateurId, montant, reference);
    }

    @Override
    public TransactionPortefeuille createTransaction(TransactionPortefeuille transaction) {
        return portefeuilleTransactionService.createTransaction(transaction);
    }

    @Override
    public TransactionPortefeuille getTransactionById(UUID id) {
        return portefeuilleTransactionService.getTransactionById(id);
    }

    @Override
    public TransactionResponse getTransactionResponseById(UUID id) {
        return portefeuilleTransactionService.getTransactionResponseById(id);
    }

    @Override
    public List<TransactionResponse> getTransactionsByPortefeuille(UUID portefeuilleId) {
        return portefeuilleTransactionService.getTransactionsByPortefeuille(portefeuilleId);
    }

    @Override
    public List<TransactionResponse> getTransactionsByUtilisateur(UUID utilisateurId) {
        return portefeuilleTransactionService.getTransactionsByUtilisateur(utilisateurId);
    }

    @Override
    public List<TransactionResponse> getHistoriqueTransactions(UUID utilisateurId) {
        return portefeuilleTransactionService.getHistoriqueTransactions(utilisateurId);
    }

    @Override
    public PaiementResponse createPaiementEscrow(CreatePaiementRequest request) {
        return paiementCoreService.createPaiementEscrow(request);
    }

    @Override
    public PaiementResponse confirmerReceptionEtLiberer(UUID paiementId) {
        return paiementCoreService.confirmerReceptionEtLiberer(paiementId);
    }

    @Override
    public BigDecimal calculateCommission(BigDecimal montant) {
        return paiementCoreService.calculateCommission(montant);
    }

    @Override
    public PaiementResponse mapToPaiementResponse(Paiement paiement) {
        return paiementMapper.toPaiementResponse(paiement);
    }

    @Override
    public TransactionResponse mapToTransactionResponse(TransactionPortefeuille transaction) {
        return paiementMapper.toTransactionResponse(transaction);
    }
}
