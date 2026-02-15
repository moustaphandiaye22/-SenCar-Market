package com.sencarmarket.module.vehicule.repository;

import com.sencarmarket.module.vehicule.entity.VehiculeFavori;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehiculeFavoriRepository extends JpaRepository<VehiculeFavori, UUID> {

    List<VehiculeFavori> findByUtilisateurId(UUID utilisateurId);

    boolean existsByUtilisateurIdAndVehiculeId(UUID utilisateurId, UUID vehiculeId);

    void deleteByUtilisateurIdAndVehiculeId(UUID utilisateurId, UUID vehiculeId);
}
