package com.sencarmarket.module.utilisateur.repository;

import com.sencarmarket.module.utilisateur.entity.UtilisateurBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UtilisateurBadgeRepository extends JpaRepository<UtilisateurBadge, UUID> {
}
