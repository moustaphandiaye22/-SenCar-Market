package com.sencarmarket.module.annonce.repository;

import com.sencarmarket.module.annonce.entity.ReservationLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReservationLocationRepository extends JpaRepository<ReservationLocation, UUID> {

    List<ReservationLocation> findByLocataireId(UUID locataireId);

    List<ReservationLocation> findByVehiculeId(UUID vehiculeId);
}
