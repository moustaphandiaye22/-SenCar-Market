package com.sencarmarket.module.tradein.repository;

import com.sencarmarket.module.tradein.entity.HistoriqueEstimation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HistoriqueEstimationRepository extends JpaRepository<HistoriqueEstimation, UUID> {

    List<HistoriqueEstimation> findByVehiculeIdOrderByDateEstimationDesc(UUID vehiculeId);

    Page<HistoriqueEstimation> findAllByOrderByDateEstimationDesc(Pageable pageable);
}
