package com.sencarmarket.module.paiement.repository;

import com.sencarmarket.module.paiement.entity.Paiement;
import com.sencarmarket.module.paiement.enums.StatutPaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, UUID> {

    List<Paiement> findByUtilisateurId(UUID utilisateurId);
    
    List<Paiement> findByReservationId(UUID reservationId);

    List<Paiement> findByStatut(StatutPaiement statut);
    
    List<Paiement> findByIsEscrow(Boolean isEscrow);
    
    List<Paiement> findByReferenceTransaction(String referenceTransaction);
    
    List<Paiement> findByReferenceExterne(String referenceExterne);
}
