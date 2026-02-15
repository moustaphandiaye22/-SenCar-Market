package com.sencarmarket.module.utilisateur.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpVerifyRequest {

    @NotBlank(message = "L'email est obligatoire")
    private String email;

    @NotBlank(message = "Le code OTP est obligatoire")
    private String codeOtp;
}
