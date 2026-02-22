package com.sencarmarket.module.commun.repository;

import com.sencarmarket.module.commun.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findByUtilisateurIdOrderByDateActionDesc(UUID utilisateurId, Pageable pageable);

    Page<AuditLog> findByActionOrderByDateActionDesc(String action, Pageable pageable);

    Page<AuditLog> findByTypeEntiteAndIdEntiteOrderByDateActionDesc(String typeEntite, UUID idEntite, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.dateAction BETWEEN :startDate AND :endDate ORDER BY a.dateAction DESC")
    Page<AuditLog> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                    @Param("endDate") LocalDateTime endDate, 
                                    Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.utilisateurId = :utilisateurId AND a.action = :action AND a.dateAction > :since ORDER BY a.dateAction DESC")
    List<AuditLog> findRecentActions(@Param("utilisateurId") UUID utilisateurId, 
                                     @Param("action") String action, 
                                     @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.action = :action AND a.dateAction > :since")
    long countRecentActions(@Param("action") String action, @Param("since") LocalDateTime since);
}
