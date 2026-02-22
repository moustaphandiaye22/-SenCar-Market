package com.sencarmarket.module.avis.mapper;

import com.sencarmarket.module.avis.dto.AvisResponse;
import com.sencarmarket.module.avis.entity.Avis;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper pour la conversion entre entités et DTOs du module Avis
 * Suit le principe DRY en centralisant les conversions
 */
@Component
public class AvisMapper {

    /**
     * Convertit une entité Avis en AvisResponse
     */
    public AvisResponse toAvisResponse(Avis avis) {
        if (avis == null) {
            return null;
        }
        return AvisResponse.fromEntity(avis);
    }

    /**
     * Convertit une liste d'entités Avis en liste de AvisResponse
     */
    public List<AvisResponse> toAvisResponseList(List<Avis> avisList) {
        if (avisList == null) {
            return null;
        }
        return avisList.stream()
                .map(this::toAvisResponse)
                .collect(Collectors.toList());
    }
}
