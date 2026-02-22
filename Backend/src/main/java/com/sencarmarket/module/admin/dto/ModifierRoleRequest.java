package com.sencarmarket.module.admin.dto;

import com.sencarmarket.module.utilisateur.entity.TypeUtilisateur;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour modifier le rôle d'un utilisateur
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModifierRoleRequest {

    @NotNull(message = "Le rôle est requis")
    private TypeUtilisateur nouveauRole;
}
