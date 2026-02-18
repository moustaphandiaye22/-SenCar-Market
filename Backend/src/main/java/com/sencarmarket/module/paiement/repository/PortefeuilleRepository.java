package com.sencarmarket.module.paiement.repository;

import com.sencarmarket.module.paiement.entity.Portefeuille;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortefeuilleRepository extends JpaRepository<Portefeuille, UUID> {
    
    Optional<Portefeuille> findByUtilisateurId(UUID utilisateurId);
    
    boolean existsByUtilisateurId(UUID utilisateurId);
}
