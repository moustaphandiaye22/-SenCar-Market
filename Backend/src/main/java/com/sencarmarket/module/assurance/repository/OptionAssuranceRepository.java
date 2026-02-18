package com.sencarmarket.module.assurance.repository;

import com.sencarmarket.module.assurance.entity.OptionAssurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OptionAssuranceRepository extends JpaRepository<OptionAssurance, UUID> {

    List<OptionAssurance> findByProduitAssuranceId(UUID produitAssuranceId);

    List<OptionAssurance> findByEstActifTrue();
}
