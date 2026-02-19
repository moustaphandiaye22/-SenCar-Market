package com.sencarmarket.module.certification.dto;

import com.sencarmarket.module.certification.entity.Inspection.etatVehicule;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class CreateInspectionRequest {

    @NotNull(message = "L'ID de la demande de certification est requis")
    private UUID demandeCertificationId;

    @NotNull(message = "La date d'inspection est requise")
    private LocalDateTime dateInspection;

    @Min(value = 0, message = "Le kilométrage ne peut pas être négatif")
    @Max(value = 2000000, message = "Le kilométrage maximum est de 2,000,000 km")
    private Integer kilometrage;

    private etatVehicule etatMoteur;
    private etatVehicule etatGenerateur;
    private etatVehicule etatFreinage;
    private etatVehicule etatSuspension;
    private etatVehicule etatTransmission;
    private etatVehicule etatPneus;
    private etatVehicule etatCarrosserie;
    private etatVehicule etatInterieur;

    @Size(max = 2000, message = "Le commentaire ne peut pas dépasser 2000 caractères")
    private String commentaire;
}
