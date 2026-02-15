package com.sencarmarket.module.utilisateur.repository;

import com.sencarmarket.module.utilisateur.entity.TypeUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TypeUtilisateurRepository extends JpaRepository<TypeUtilisateur, UUID> {
}
