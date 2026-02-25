package com.sencarmarket.module.utilisateur.repository;

import com.sencarmarket.module.utilisateur.entity.UtilisateurBadge;
import com.sencarmarket.module.utilisateur.entity.UtilisateurBadgeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UtilisateurBadgeRepository extends JpaRepository<UtilisateurBadge, UtilisateurBadgeId> {

    List<UtilisateurBadge> findByUtilisateurId(UUID utilisateurId);

    List<UtilisateurBadge> findByBadgeId(UUID badgeId);
}
