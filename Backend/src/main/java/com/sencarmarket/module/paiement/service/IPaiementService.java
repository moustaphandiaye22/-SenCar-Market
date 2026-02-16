package com.sencarmarket.module.paiement.service;

import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.paiement.entity.PaiementLog;
import com.sencarmarket.module.paiement.entity.Portefeuille;
import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;

import java.util.List;
import java.util.UUID;

/**
 * Interface pour le service paiement
 * Implémente le principe de DIP (Dependency Inversion Principle)
 */
public interface IPaiementService {

    // Paiement
    Paiement createPaiement(Paiement paiement);

    Paiement updateStatutPaiement(UUID id, String nouveauStatut);

    Paiement getPaiementById(UUID id);

    List<Paiement> getPaiementsByUtilisateur(UUID utilisateurId);

    List<Paiement> getPaiementsByAnnonce(UUID annonceId);

    List<Paiement> getPaiementsByStatut(String statut);

    // Paiement Log
    PaiementLog createLog(PaiementLog log);

    List<PaiementLog> getLogsByPaiement(UUID paiementId);

    // Portefeuille
    Portefeuille createPortefeuille(Portefeuille portefeuille);

    Portefeuille getPortefeuilleByUtilisateur(UUID utilisateurId);

    Portefeuille addFunds(UUID utilisateurId, double montant);

    Portefeuille withdrawFunds(UUID utilisateurId, double montant);

    // Transaction
    TransactionPortefeuille createTransaction(TransactionPortefeuille transaction);

    TransactionPortefeuille getTransactionById(UUID id);

    List<TransactionPortefeuille> getTransactionsByPortefeuille(UUID portefeuilleId);

    List<TransactionPortefeuille> getTransactionsByUtilisateur(UUID utilisateurId);
}
