package com.sencarmarket.module.vehicule.repository;

import com.sencarmarket.module.vehicule.entity.PhotoVehicule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PhotoVehiculeRepository extends JpaRepository<PhotoVehicule, UUID> {

    List<PhotoVehicule> findByVehiculeId(UUID vehiculeId);
}
