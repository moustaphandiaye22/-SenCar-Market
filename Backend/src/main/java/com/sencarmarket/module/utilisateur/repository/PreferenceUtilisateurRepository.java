package com.sencarmarket.module.utilisateur.repository;

import com.sencarmarket.module.utilisateur.entity.PreferenceUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PreferenceUtilisateurRepository extends JpaRepository<PreferenceUtilisateur, UUID> {
}
