package com.sencarmarket.module.paiement.exception;

import com.sencarmarket.module.commun.exception.PaiementException;

/**
 * Exception levée cuando le solde du portefeuille est insuffisant
 */
public class SoldeInsuffisantException extends PaiementException {
    
    private final Double soldeActuel;
    private final Double montantDemande;

    public SoldeInsuffisantException(Double soldeActuel, Double montantDemande) {
        super("SOLDE_INSUFFISANT", 
              "Le solde actuel est insuffisant pour cette opération",
              String.format("Solde actuel: %s, Montant demandé: %s",-soldeActuel, montantDemande));
        this.soldeActuel = soldeActuel;
        this.montantDemande = montantDemande;
    }

    public Double getSoldeActuel() {
        return soldeActuel;
    }

    public Double getMontantDemande() {
        return montantDemande;
    }
}
