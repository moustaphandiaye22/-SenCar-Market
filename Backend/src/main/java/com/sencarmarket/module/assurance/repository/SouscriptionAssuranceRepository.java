package com.sencarmarket.module.assurance.repository;

import com.sencarmarket.module.assurance.entity.SouscriptionAssurance;
import com.sencarmarket.module.assurance.enums.StatutAssurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SouscriptionAssuranceRepository extends JpaRepository<SouscriptionAssurance, UUID> {

    List<SouscriptionAssurance> findByUtilisateurId(UUID utilisateurId);

    List<SouscriptionAssurance> findByVehiculeId(UUID vehiculeId);

    List<SouscriptionAssurance> findByStatut(StatutAssurance statut);

    List<SouscriptionAssurance> findByUtilisateurIdAndStatut(UUID utilisateurId, StatutAssurance statut);
}
