package com.sencarmarket.module.certification.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDemandeCertificationRequest {

    @NotNull(message = "L'ID du véhicule est requis")
    private UUID vehiculeId;
}
