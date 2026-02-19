package com.sencarmarket.module.certification.dto;

import com.sencarmarket.module.certification.entity.Inspection;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRapportInspectionRequest {

    @NotNull(message = "Le résultat de l'inspection est requis")
    private Inspection.ResultatInspection resultat;

    @Min(value = 0, message = "Le score global minimum est 0")
    @Max(value = 100, message = "Le score global maximum est 100")
    private Integer scoreGlobale;

    @Size(max = 2000, message = "Les recommandations ne peuvent pas dépasser 2000 caractères")
    private String recommendations;

    @Size(max = 2000, message = "La conclusion ne peut pas dépasser 2000 caractères")
    private String conclusion;

    private Boolean estApprouve;
}
