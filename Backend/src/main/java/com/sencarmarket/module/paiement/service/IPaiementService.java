package com.sencarmarket.module.paiement.service;

import com.sencarmarket.module.paiement.dto.*;
import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.paiement.entity.PaiementLog;
import com.sencarmarket.module.paiement.entity.Portefeuille;
import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service paiement
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IPaiementService {

    // ========== PAIEMENT ==========
    
    /**
     * Créer une demande de paiement
     */
    PaiementResponse createPaiement(CreatePaiementRequest request);
    
    /**
     * Créer un paiement Wave
     */
    PaiementResponse createPaiementWave(CreatePaiementRequest request);
    
    /**
     * Créer un paiement Orange Money
     */
    PaiementResponse createPaiementOrangeMoney(CreatePaiementRequest request);
    
    /**
     * Mettre à jour le statut d'un paiement
     */
    PaiementResponse updateStatutPaiement(UUID id, String nouveauStatut);
    
    /**
     * Confirmer un paiement après réception du webhook
     */
    PaiementResponse confirmerPaiement(UUID id, String referenceExterne);
    
    /**
     * Annuler un paiement
     */
    PaiementResponse annulerPaiement(UUID id);
    
    /**
     * Rembourser un paiement
     */
    PaiementResponse remboursementPaiement(UUID id, BigDecimal montant);
    
    Paiement getPaiementById(UUID id);
    
    /**
     * Obtenir un paiement par ID (retourne PaiementResponse)
     */
    PaiementResponse getPaiementResponseById(UUID id);

    List<PaiementResponse> getPaiementsByUtilisateur(UUID utilisateurId);

    List<PaiementResponse> getPaiementsByReservation(UUID reservationId);

    List<PaiementResponse> getPaiementsByStatut(String statut);

    // ========== WEBHOOK ==========
    
    /**
     * Traiter le webhook de Wave
     */
    String processWaveWebhook(String payload, String signature);
    
    /**
     * Traiter le webhook d'Orange Money
     */
    String processOrangeMoneyWebhook(String payload, String signature);
    
    /**
     * Vérifier la signature du webhook
     */
    boolean verifyWebhookSignature(String payload, String signature, String secret);

    // ========== PAIEMENT LOG ==========
    
    PaiementLog createLog(PaiementLog log);

    List<PaiementLog> getLogsByPaiement(UUID paiementId);

    // ========== PORTEFEUILLE ==========
    
    /**
     * Créer ou récupérer le portefeuille d'un utilisateur
     */
    PortefeuilleResponse getOrCreatePortefeuille(UUID utilisateurId);
    
    /**
     * Obtenir le portefeuille d'un utilisateur
     */
    PortefeuilleResponse getPortefeuilleByUtilisateur(UUID utilisateurId);
    
    /**
     * Créditer le portefeuille
     */
    PortefeuilleResponse crediterPortefeuille(UUID utilisateurId, TransactionPortefeuilleRequest request);
    
    /**
     * Débiter le portefeuille
     */
    PortefeuilleResponse debiterPortefeuille(UUID utilisateurId, TransactionPortefeuilleRequest request);
    
    /**
     * Demander un retrait
     */
    TransactionResponse demanderRetrait(UUID utilisateurId, RetraitRequest request);
    
    /**
     * Bloquer des fonds pour escrow
     */
    PortefeuilleResponse bloquerFondsEscrow(UUID utilisateurId, BigDecimal montant, String reference);
    
    /**
     * Libérer les fonds escrow
     */
    PortefeuilleResponse libererFondsEscrow(UUID utilisateurId, BigDecimal montant, String reference);
    
    /**
     * Rembourser les fonds escrow
     */
    PortefeuilleResponse remboursementEscrow(UUID utilisateurId, BigDecimal montant, String reference);

    // ========== TRANSACTION ==========
    
    TransactionPortefeuille createTransaction(TransactionPortefeuille transaction);

    TransactionPortefeuille getTransactionById(UUID id);
    
    /**
     * Obtenir une transaction par ID (retourne TransactionResponse)
     */
    TransactionResponse getTransactionResponseById(UUID id);

    List<TransactionResponse> getTransactionsByPortefeuille(UUID portefeuilleId);

    List<TransactionResponse> getTransactionsByUtilisateur(UUID utilisateurId);

    List<TransactionResponse> getHistoriqueTransactions(UUID utilisateurId);
    
    // ========== ESCROW ==========
    
    /**
     * Créer un paiement escrow
     */
    PaiementResponse createPaiementEscrow(CreatePaiementRequest request);
    
    /**
     * Confirmer la réception et libérer les fonds
     */
    PaiementResponse confirmerReceptionEtLiberer(UUID paiementId);
    
    /**
     * Calculer la commission plateforme
     */
    BigDecimal calculateCommission(BigDecimal montant);
    
    // Méthodes de mapping (utilisées par le controller)
    com.sencarmarket.module.paiement.dto.PaiementResponse mapToPaiementResponse(com.sencarmarket.module.paiement.entity.Paiement paiement);
    
    com.sencarmarket.module.paiement.dto.TransactionResponse mapToTransactionResponse(com.sencarmarket.module.paiement.entity.TransactionPortefeuille transaction);
}
