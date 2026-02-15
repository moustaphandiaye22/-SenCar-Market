package com.sencarmarket.module.vehicule.repository;

import com.sencarmarket.module.vehicule.entity.Carburant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CarburantRepository extends JpaRepository<Carburant, UUID> {
}
