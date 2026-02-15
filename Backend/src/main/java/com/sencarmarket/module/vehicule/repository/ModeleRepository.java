package com.sencarmarket.module.vehicule.repository;

import com.sencarmarket.module.vehicule.entity.Modele;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModeleRepository extends JpaRepository<Modele, UUID> {

    List<Modele> findByMarqueId(UUID marqueId);
}
