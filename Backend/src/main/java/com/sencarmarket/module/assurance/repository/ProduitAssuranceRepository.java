package com.sencarmarket.module.assurance.repository;

import com.sencarmarket.module.assurance.entity.ProduitAssurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProduitAssuranceRepository extends JpaRepository<ProduitAssurance, UUID> {
}
