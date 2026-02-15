package com.sencarmarket.module.utilisateur.repository;

import com.sencarmarket.module.utilisateur.entity.OtpCode;
import com.sencarmarket.module.utilisateur.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, UUID> {

    List<OtpCode> findByUtilisateurAndTypeAndUtiliseFalse(Utilisateur utilisateur, OtpCode.OtpType type);

    Optional<OtpCode> findByUtilisateurAndCodeAndUtiliseFalse(Utilisateur utilisateur, String code);

    @Query("SELECT o FROM OtpCode o WHERE o.utilisateur = :utilisateur AND o.type = :type AND o.utilise = false AND o.expiration > :now ORDER BY o.createdAt DESC")
    Optional<OtpCode> findValidOtp(Utilisateur utilisateur, OtpCode.OtpType type, LocalDateTime now);

    void deleteByExpirationBefore(LocalDateTime dateTime);
}
