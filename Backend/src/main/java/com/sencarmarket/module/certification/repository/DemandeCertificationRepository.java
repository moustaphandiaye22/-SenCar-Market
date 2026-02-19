package com.sencarmarket.module.certification.repository;

import com.sencarmarket.module.certification.entity.DemandeCertification;
import com.sencarmarket.module.certification.entity.DemandeCertification.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DemandeCertificationRepository extends JpaRepository<DemandeCertification, UUID> {

    List<DemandeCertification> findByUtilisateurId(UUID utilisateurId);

    List<DemandeCertification> findByVehiculeId(UUID vehiculeId);

    List<DemandeCertification> findByStatut(StatutDemande statut);

    List<DemandeCertification> findByInspecteurId(UUID inspecteurId);

    List<DemandeCertification> findByStatutIn(List<StatutDemande> statuts);
}
