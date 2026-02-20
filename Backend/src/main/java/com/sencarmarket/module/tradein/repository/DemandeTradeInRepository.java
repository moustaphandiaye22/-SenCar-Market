package com.sencarmarket.module.tradein.repository;

import com.sencarmarket.module.tradein.entity.DemandeTradeIn;
import com.sencarmarket.module.tradein.entity.DemandeTradeIn.StatutTradeIn;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DemandeTradeInRepository extends JpaRepository<DemandeTradeIn, UUID> {

    List<DemandeTradeIn> findByUtilisateurId(UUID utilisateurId);

    Page<DemandeTradeIn> findByStatut(StatutTradeIn statut, Pageable pageable);

    List<DemandeTradeIn> findByStatutIn(List<StatutTradeIn> statuts);

    List<DemandeTradeIn> findByEstNotifie(Boolean estNotifie);
}
