package com.sencarmarket.module.paiement.repository;

import com.sencarmarket.module.paiement.entity.PaiementLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaiementLogRepository extends JpaRepository<PaiementLog, UUID> {
    
    List<PaiementLog> findByPaiementIdOrderByDateActionDesc(UUID paiementId);
    
    List<PaiementLog> findByAction(String action);
}
