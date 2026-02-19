package com.sencarmarket.module.certification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RapportInspectionResponse {

    private UUID id;
    private UUID inspectionId;
    private String urlRapportPdf;
    private LocalDateTime dateGeneration;
    private Integer scoreGlobale;
    private String recommendations;
    private String conclusion;
    private Boolean estApprouve;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
