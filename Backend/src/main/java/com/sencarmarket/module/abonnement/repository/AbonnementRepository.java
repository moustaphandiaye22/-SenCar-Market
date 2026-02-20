package com.sencarmarket.module.abonnement.repository;

import com.sencarmarket.module.abonnement.entity.Abonnement;
import com.sencarmarket.module.abonnement.enums.TypeAbonnement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository pour les plans d'abonnement
 */
@Repository
public interface AbonnementRepository extends JpaRepository<Abonnement, UUID> {

    List<Abonnement> findAllByOrderByPrixMensuelAsc();

    Optional<Abonnement> findByType(TypeAbonnement type);

    List<Abonnement> findByEstVedette(Boolean estVedette);

    List<Abonnement> findByEstCertifie(Boolean estCertifie);
}
