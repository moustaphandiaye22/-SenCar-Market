package com.sencarmarket.module.utilisateur.repository;

import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, UUID> {

    Optional<Utilisateur> findByEmail(String email);

    Optional<Utilisateur> findByTelephone(String telephone);

    boolean existsByEmail(String email);

    boolean existsByTelephone(String telephone);

    @Query("SELECT u FROM Utilisateur u WHERE u.typeUtilisateur.id = :typeId")
    java.util.List<Utilisateur> findByTypeUtilisateurId(@Param("typeId") UUID typeId);

    @Query("SELECT u FROM Utilisateur u WHERE u.statutVerification.id = :statutId")
    java.util.List<Utilisateur> findByStatutVerificationId(@Param("statutId") UUID statutId);
}
