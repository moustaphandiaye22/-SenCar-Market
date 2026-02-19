package com.sencarmarket.module.certification.repository;

import com.sencarmarket.module.certification.entity.Inspection;
import com.sencarmarket.module.certification.entity.Inspection.ResultatInspection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, UUID> {

    Optional<Inspection> findByDemandeCertificationId(UUID demandeCertificationId);

    Page<Inspection> findByInspecteurId(UUID inspecteurId, Pageable pageable);

    List<Inspection> findByResultat(ResultatInspection resultat);
}
