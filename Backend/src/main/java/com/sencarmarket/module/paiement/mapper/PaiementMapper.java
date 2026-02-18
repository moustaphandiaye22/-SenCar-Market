package com.sencarmarket.module.paiement.mapper;

import com.sencarmarket.module.paiement.dto.PaiementResponse;
import com.sencarmarket.module.paiement.dto.PortefeuilleResponse;
import com.sencarmarket.module.paiement.dto.TransactionResponse;
import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.paiement.entity.Portefeuille;
import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;
import org.springframework.stereotype.Component;

/**
 * Implémentation du mapper paiement
 * Sépare la logique de mapping du service (pattern utilisé dans les autres modules)
 */
@Component
public class PaiementMapper implements IPaiementMapper {

    @Override
    public PaiementResponse toPaiementResponse(Paiement paiement) {
        if (paiement == null) {
            return null;
        }
        
        return PaiementResponse.builder()
                .id(paiement.getId())
                .utilisateurId(paiement.getUtilisateur() != null ? paiement.getUtilisateur().getId() : null)
                .reservationId(paiement.getReservation() != null ? paiement.getReservation().getId() : null)
                .montant(paiement.getMontant())
                .montantEscrow(paiement.getMontantEscrow())
                .commission(paiement.getCommission())
                .statut(paiement.getStatut())
                .methodePaiement(paiement.getMethodePaiement())
                .datePaiement(paiement.getDatePaiement())
                .referenceTransaction(paiement.getReferenceTransaction())
                .referenceWave(paiement.getReferenceExterne())
                .urlPaiement(paiement.getUrlPaiement())
                .isEscrow(paiement.getIsEscrow())
                .createdAt(paiement.getCreatedAt())
                .updatedAt(paiement.getUpdatedAt())
                .build();
    }

    @Override
    public PortefeuilleResponse toPortefeuilleResponse(Portefeuille portefeuille) {
        if (portefeuille == null) {
            return null;
        }
        
        return PortefeuilleResponse.builder()
                .id(portefeuille.getId())
                .utilisateurId(portefeuille.getUtilisateur() != null ? portefeuille.getUtilisateur().getId() : null)
                .solde(portefeuille.getSolde())
                .soldeBloque(portefeuille.getSoldeBloque())
                .soldeDisponible(portefeuille.getSoldeDisponible())
                .dateDerniereRecharge(portefeuille.getDateDerniereRecharge())
                .createdAt(portefeuille.getCreatedAt())
                .updatedAt(portefeuille.getUpdatedAt())
                .build();
    }

    @Override
    public TransactionResponse toTransactionResponse(TransactionPortefeuille transaction) {
        if (transaction == null) {
            return null;
        }
        
        return TransactionResponse.builder()
                .id(transaction.getId())
                .portefeuilleId(transaction.getPortefeuille() != null ? transaction.getPortefeuille().getId() : null)
                .montant(transaction.getMontant())
                .typeTransaction(transaction.getTypeTransaction())
                .statut(transaction.getStatut())
                .description(transaction.getDescription())
                .referenceExterne(transaction.getReferenceExterne())
                .dateTransaction(transaction.getDateTransaction())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
