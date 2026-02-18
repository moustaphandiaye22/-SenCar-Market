package com.sencarmarket.module.paiement.repository;

import com.sencarmarket.module.paiement.entity.TransactionPortefeuille;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionPortefeuilleRepository extends JpaRepository<TransactionPortefeuille, UUID> {
    
    List<TransactionPortefeuille> findByPortefeuilleIdOrderByDateTransactionDesc(UUID portefeuilleId);
    
    List<TransactionPortefeuille> findByPortefeuilleUtilisateurIdOrderByDateTransactionDesc(UUID utilisateurId);
    
    List<TransactionPortefeuille> findByReferenceExterne(String referenceExterne);
}
