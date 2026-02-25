package com.sencarmarket.module.utilisateur.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilisateurBadgeId implements Serializable {

    private UUID utilisateurId;
    private UUID badgeId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UtilisateurBadgeId that = (UtilisateurBadgeId) o;
        return Objects.equals(utilisateurId, that.utilisateurId) && Objects.equals(badgeId, that.badgeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(utilisateurId, badgeId);
    }
}
