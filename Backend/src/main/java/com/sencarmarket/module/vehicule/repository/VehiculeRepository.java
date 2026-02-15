package com.sencarmarket.module.vehicule.repository;

import com.sencarmarket.module.vehicule.entity.Statut;
import com.sencarmarket.module.vehicule.entity.Vehicule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehiculeRepository extends JpaRepository<Vehicule, UUID> {

    List<Vehicule> findByMarqueId(UUID marqueId);

    List<Vehicule> findByModeleId(UUID modeleId);

    List<Vehicule> findByStatutAnnonceId(UUID statutAnnonceId);

    @Query("SELECT v FROM Vehicule v WHERE v.prixVente BETWEEN :minPrice AND :maxPrice")
    List<Vehicule> findByPrixBetween(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);

    @Query("SELECT v FROM Vehicule v WHERE v.anneeFabrication BETWEEN :minYear AND :maxYear")
    List<Vehicule> findByAnneeBetween(@Param("minYear") Integer minYear, @Param("maxYear") Integer maxYear);

    List<Vehicule> findByVendeurId(UUID vendeurId);

    Page<Vehicule> findByStatut(Statut statut, Pageable pageable);

    @Query("SELECT v FROM Vehicule v WHERE v.statut = :statut ORDER BY v.estBoost DESC, v.createdAt DESC")
    Page<Vehicule> findPublishedWithBoost(@Param("statut") Statut statut, Pageable pageable);
}
