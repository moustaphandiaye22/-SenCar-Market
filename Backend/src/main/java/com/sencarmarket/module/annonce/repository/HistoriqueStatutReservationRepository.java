package com.sencarmarket.module.annonce.repository;

import com.sencarmarket.module.annonce.entity.HistoriqueStatutReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HistoriqueStatutReservationRepository extends JpaRepository<HistoriqueStatutReservation, UUID> {
    
    List<HistoriqueStatutReservation> findByReservationIdOrderByCreatedAtDesc(UUID reservationId);
}
