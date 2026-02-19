package com.sencarmarket.module.certification.repository;

import com.sencarmarket.module.certification.entity.RapportInspection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RapportInspectionRepository extends JpaRepository<RapportInspection, UUID> {

    Optional<RapportInspection> findByInspectionId(UUID inspectionId);
}
